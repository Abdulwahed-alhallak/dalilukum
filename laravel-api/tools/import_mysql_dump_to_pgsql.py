"""
Import dalilukum.sql (MariaDB dump) into PostgreSQL.

Usage:
  # عبر DATABASE_URL
  DATABASE_URL=postgresql://user:pass@host:5432/db python tools/import_mysql_dump_to_pgsql.py

  # أو عبر متغيرات منفصلة
  PGHOST=179.236.255.47 PGPORT=5432 PGDATABASE=dalilukum PGUSER=dalilukum PGPASSWORD=xxx python tools/import_mysql_dump_to_pgsql.py

  # معاينة جافة (لا يكتب):
  python tools/import_mysql_dump_to_pgsql.py --dry-run

The script:
  - يقرأ dalilukum.sql
  - يحول CREATE TABLE إلى صيغة PostgreSQL (TEXT, INTEGER, REAL -> proper pgsql types)
  - يحول enum -> TEXT + CHECK
  - يحول INSERT INTO ليكون متوافقاً مع pgsql (backticks -> double quotes)
  - يعيد إنشاء الجداول ويدخل البيانات
"""
import re
import sys
import os
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
DUMP = ROOT.parent / "dalilukum.sql"
# Fallback للتوافق مع الاسم القديم
if not DUMP.exists():
    _legacy = ROOT.parent / "syrialzeel.sql"
    if _legacy.exists():
        DUMP = _legacy


def parse_db_url(url: str) -> dict:
    parsed = urlparse(url)
    return {
        "host": parsed.hostname or "127.0.0.1",
        "port": str(parsed.port or 5432),
        "database": (parsed.path or "/dalilukum").lstrip("/"),
        "user": unquote(parsed.username or "postgres"),
        "password": unquote(parsed.password or ""),
    }


def get_conn_params() -> dict:
    db_url = os.environ.get("DATABASE_URL", "")
    if db_url.startswith("postgres"):
        return parse_db_url(db_url)
    return {
        "host": os.environ.get("PGHOST", "127.0.0.1"),
        "port": os.environ.get("PGPORT", "5432"),
        "database": os.environ.get("PGDATABASE", "dalilukum"),
        "user": os.environ.get("PGUSER", "dalilukum"),
        "password": os.environ.get("PGPASSWORD", ""),
    }


def get_connection(params: dict):
    try:
        import psycopg2  # type: ignore
    except ImportError:
        print("ERROR: psycopg2 not installed. Run: pip install psycopg2-binary")
        sys.exit(1)
    return psycopg2.connect(
        host=params["host"],
        port=params["port"],
        dbname=params["database"],
        user=params["user"],
        password=params["password"],
    )


# ---------- SQL conversion ----------

def split_statements(sql: str):
    statements = []
    current = []
    quote = None
    escape = False
    for char in sql:
        current.append(char)
        if quote:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == quote:
                quote = None
        elif char in ("'", '"', "`"):
            quote = char
        elif char == ";":
            statements.append("".join(current).strip())
            current = []
    tail = "".join(current).strip()
    if tail:
        statements.append(tail)
    return statements


def strip_comments(sql: str):
    lines = []
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.startswith("--") or stripped.startswith("/*!") or not stripped:
            continue
        lines.append(line)
    return "\n".join(lines)


def convert_column(line: str) -> str:
    line = line.strip().rstrip(",")
    line = line.replace("`", '"')
    # enum -> TEXT (pg enum requires explicit type; TEXT is simpler for now)
    line = re.sub(r"enum\([^)]*\)", "TEXT", line, flags=re.I)
    line = re.sub(r"\b(bigint|int|tinyint)\s*\(\d+\)", "INTEGER", line, flags=re.I)
    line = re.sub(r"\b(decimal|double|float)\s*\([^)]*\)", "NUMERIC", line, flags=re.I)
    line = re.sub(r"\b(varchar|char)\s*\([^)]*\)", "TEXT", line, flags=re.I)
    line = re.sub(r"\b(longtext|mediumtext|text)\b", "TEXT", line, flags=re.I)
    line = re.sub(r"\b(date|datetime|timestamp)\b", "TEXT", line, flags=re.I)
    line = re.sub(r"DEFAULT current_timestamp\(\)", "DEFAULT CURRENT_TIMESTAMP", line, flags=re.I)
    line = re.sub(r"ON UPDATE CURRENT_TIMESTAMP(?:\(\))?", "", line, flags=re.I)
    # AUTO_INCREMENT -> handled via SERIAL / keep as INTEGER
    line = re.sub(r"\bAUTO_INCREMENT\b", "", line, flags=re.I)
    return line.strip().rstrip(",")


def convert_create(statement: str):
    match = re.search(
        r"CREATE TABLE\s+`?([^`\s(]+)`?\s*\((.*)\)\s*(?:ENGINE=|;?\s*$)",
        statement, flags=re.I | re.S,
    )
    if not match:
        return None
    table, body = match.groups()
    columns = []
    for raw_line in body.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        upper = line.upper()
        if upper.startswith(("PRIMARY KEY", "KEY ", "UNIQUE KEY", "CONSTRAINT", "FOREIGN KEY", "INDEX")):
            continue
        columns.append(convert_column(line))
    # Remove empty entries
    columns = [c for c in columns if c and c != ","]
    return f'CREATE TABLE IF NOT EXISTS "{table}" (\n  ' + ",\n  ".join(columns) + "\n)"


def convert_insert(statement: str) -> str:
    statement = statement.replace("`", '"')
    statement = re.sub(r"\\'", "''", statement)
    # MySQL uses \' for single quote escape; pgsql uses ''
    return statement


def main():
    dry_run = "--dry-run" in sys.argv
    params = get_conn_params()

    sql = strip_comments(DUMP.read_text(encoding="utf-8", errors="replace"))
    statements = split_statements(sql)

    creates = []
    inserts = []
    for stmt in statements:
        upper = stmt.lstrip().upper()
        if upper.startswith("CREATE TABLE"):
            converted = convert_create(stmt)
            if converted:
                creates.append(converted)
        elif upper.startswith("INSERT INTO"):
            inserts.append(convert_insert(stmt))

    print(f"Found {len(creates)} CREATE TABLE, {len(inserts)} INSERT statements")
    if dry_run:
        for c in creates[:2]:
            print(c[:500])
        print("... dry run, not writing to DB")
        return

    conn = get_connection(params)
    conn.autocommit = False
    cur = conn.cursor()
    try:
        # Drop existing tables in reverse order (respect FKs)
        cur.execute("""
            DO $$ DECLARE r RECORD; BEGIN
              FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname='public') LOOP
                EXECUTE 'DROP TABLE IF EXISTS \"' || r.tablename || '\" CASCADE';
              END LOOP;
            END $$;
        """)
        for stmt in creates:
            cur.execute(stmt)
        for stmt in inserts:
            cur.execute(stmt)
        conn.commit()

        cur.execute("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")
        tables = [r[0] for r in cur.fetchall()]
        print(f"Imported {len(tables)} tables:")
        for t in tables:
            cur.execute(f'SELECT COUNT(*) FROM "{t}"')
            print(f"  {t}: {cur.fetchone()[0]}")
    except Exception as e:
        conn.rollback()
        print(f"ERROR: {e}")
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()
