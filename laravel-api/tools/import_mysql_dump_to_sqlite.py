import re
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parents[1] if (ROOT.parents[1] / "dalilukum.sql").exists() else ROOT.parent
DUMP = REPO_ROOT / "dalilukum.sql"
if not DUMP.exists():
    print("ERROR: dalilukum.sql not found.")
    import sys; sys.exit(1)
DB = ROOT / "database" / "database.sqlite"


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


def convert_column(line: str):
    line = line.strip().rstrip(",")
    line = line.replace("`", '"')
    line = re.sub(r"enum\([^)]*\)", "TEXT", line, flags=re.I)
    line = re.sub(r"\b(bigint|int|tinyint)\s*\(\d+\)", "INTEGER", line, flags=re.I)
    line = re.sub(r"\b(decimal|double|float)\s*\([^)]*\)", "REAL", line, flags=re.I)
    line = re.sub(r"\b(varchar|char)\s*\([^)]*\)", "TEXT", line, flags=re.I)
    line = re.sub(r"\b(longtext|mediumtext|text)\b", "TEXT", line, flags=re.I)
    line = re.sub(r"\b(date|datetime|timestamp)\b", "TEXT", line, flags=re.I)
    line = re.sub(r"DEFAULT current_timestamp\(\)", "DEFAULT CURRENT_TIMESTAMP", line, flags=re.I)
    line = re.sub(r"ON UPDATE CURRENT_TIMESTAMP(?:\(\))?", "", line, flags=re.I)
    return line


def convert_create(statement: str):
    match = re.search(r"CREATE TABLE\s+`?([^`\s(]+)`?\s*\((.*)\)\s*(?:ENGINE=|;?\s*$)", statement, flags=re.I | re.S)
    if not match:
        return None

    table, body = match.groups()
    columns = []
    for raw_line in body.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        upper = line.upper()
        if upper.startswith(("PRIMARY KEY", "KEY ", "UNIQUE KEY", "CONSTRAINT", "FOREIGN KEY")):
            continue
        columns.append(convert_column(line))

    return f'CREATE TABLE IF NOT EXISTS "{table}" (\n  ' + ",\n  ".join(columns) + "\n)"


def convert_insert(statement: str):
    statement = statement.replace("`", '"')
    statement = re.sub(r"\\'", "''", statement)
    statement = statement.replace('\\"', '"')
    return statement


def main():
    DB.parent.mkdir(parents=True, exist_ok=True)
    if DB.exists():
        DB.unlink()

    sql = strip_comments(DUMP.read_text(encoding="utf-8", errors="replace"))
    statements = split_statements(sql)

    conn = sqlite3.connect(DB)
    try:
        conn.execute("PRAGMA foreign_keys = OFF")
        for statement in statements:
            upper = statement.lstrip().upper()
            if upper.startswith("CREATE TABLE"):
                converted = convert_create(statement)
                if converted:
                    conn.execute(converted)
            elif upper.startswith("INSERT INTO"):
                conn.execute(convert_insert(statement))
        conn.commit()

        counts = {}
        for (table,) in conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
            counts[table] = conn.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]
        print(f"Imported {len(counts)} tables into {DB}")
        for table, count in counts.items():
            print(f"{table}: {count}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
