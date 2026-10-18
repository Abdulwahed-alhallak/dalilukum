"""
Import dalilukum.sql (MariaDB dump) into PostgreSQL safely.

Usage:
  # Safe upsert into existing Laravel-migrated schema (DEFAULT):
  DATABASE_URL=postgresql://user:pass@host:5432/db python tools/import_mysql_dump_to_pgsql.py

  # Or via separate PG* variables:
  PGHOST=127.0.0.1 PGPORT=5432 PGDATABASE=dalilukum PGUSER=dalilukum PGPASSWORD=xxx python tools/import_mysql_dump_to_pgsql.py

  # Dry run (no writes):
  python tools/import_mysql_dump_to_pgsql.py --dry-run

  # Destructive recreate (ONLY for empty scratch DBs without Laravel migrations):
  python tools/import_mysql_dump_to_pgsql.py --recreate-schema
"""
import re
import sys
import os
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parents[1] if (ROOT.parents[1] / "dalilukum.sql").exists() else ROOT.parent
DUMP = REPO_ROOT / "dalilukum.sql"
if not DUMP.exists():
    print("ERROR: dalilukum.sql not found.")
    import sys; sys.exit(1)


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
    line = re.sub(r"enum\([^)]*\)", "TEXT", line, flags=re.I)
    line = re.sub(r"\b(bigint|int|tinyint)\s*\(\d+\)", "INTEGER", line, flags=re.I)
    line = re.sub(r"\b(decimal|double|float)\s*\([^)]*\)", "NUMERIC", line, flags=re.I)
    line = re.sub(r"\b(varchar|char)\s*\([^)]*\)", "TEXT", line, flags=re.I)
    line = re.sub(r"\b(longtext|mediumtext|text)\b", "TEXT", line, flags=re.I)
    line = re.sub(r"\b(date|datetime|timestamp)\b", "TEXT", line, flags=re.I)
    line = re.sub(r"DEFAULT current_timestamp\(\)", "DEFAULT CURRENT_TIMESTAMP", line, flags=re.I)
    line = re.sub(r"ON UPDATE CURRENT_TIMESTAMP(?:\(\))?", "", line, flags=re.I)
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
    columns = [c for c in columns if c and c != ","]
    return f'CREATE TABLE IF NOT EXISTS "{table}" (\n  ' + ",\n  ".join(columns) + "\n)"


_BOOL_COLS = {"is_featured", "is_cover", "is_read", "has_warranty", "has_elevator", "has_parking", "is_active"}

def convert_insert(statement: str, upsert: bool = True) -> str:
    # Extract column list to know which positions are boolean — support backticks
    col_match = re.search(r'INSERT INTO\s+[`"\']?\w+[`"\']?\s*\(([^)]+)\)', statement, re.I)
    bool_indices: set[int] = set()
    if col_match:
        cols = [c.strip().strip('"').strip('`').strip("'").lower() for c in col_match.group(1).split(',')]
        bool_indices = {i for i, c in enumerate(cols) if c in _BOOL_COLS}

    statement = statement.replace("`", '"')
    statement = re.sub(r"\\'", "''", statement)
    statement = statement.replace('\\"', '"')

    if bool_indices:
        parts = re.split(r'\bVALUES\b', statement, flags=re.I, maxsplit=1)
        if len(parts) == 2:
            prefix, values_part = parts[0] + 'VALUES', parts[1]

            def fix_tuple(m: re.Match) -> str:
                vals_str = m.group(1)
                vals: list[str] = []
                cur: list[str] = []
                in_q = False
                q_char: str | None = None
                for ch in vals_str:
                    if in_q:
                        cur.append(ch)
                        if ch == q_char:
                            in_q = False
                    elif ch in ("'", '"'):
                        in_q = True
                        q_char = ch
                        cur.append(ch)
                    elif ch == ',':
                        vals.append(''.join(cur).strip())
                        cur = []
                    else:
                        cur.append(ch)
                vals.append(''.join(cur).strip())
                for idx in bool_indices:
                    if idx < len(vals):
                        v = vals[idx].strip()
                        if v == '0':
                            vals[idx] = 'false'
                        elif v == '1':
                            vals[idx] = 'true'
                return '(' + ', '.join(vals) + ')'

            values_part = re.sub(r'\(([^)]+)\)', fix_tuple, values_part)
            statement = prefix + values_part

    if upsert:
        statement = re.sub(r";\s*$", " ON CONFLICT DO NOTHING;", statement)
    return statement


def main():
    dry_run = "--dry-run" in sys.argv
    recreate_schema = "--recreate-schema" in sys.argv
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
            inserts.append(convert_insert(stmt, upsert=not recreate_schema))

    print(f"Found {len(creates)} CREATE TABLE, {len(inserts)} INSERT statements (mode={'recreate' if recreate_schema else 'safe-upsert'})")
    if dry_run:
        for c in creates[:2]:
            print(c[:500])
        print("... dry run, not writing to DB")
        return

    conn = get_connection(params)
    conn.autocommit = False
    cur = conn.cursor()
    try:
        if recreate_schema:
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
        print(f"Verified {len(tables)} tables:")
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
