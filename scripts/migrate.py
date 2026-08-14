"""Apply the initial Multazim PostgreSQL schema in a controlled transaction."""
from __future__ import annotations

import os
from pathlib import Path
import time
import hashlib

import psycopg


def main() -> None:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise SystemExit("DATABASE_URL is required")
    schema_path = Path(__file__).resolve().parents[1] / "infra" / "schema.sql"
    schema = schema_path.read_text(encoding="utf-8")
    checksum = hashlib.sha256(schema.encode()).hexdigest()
    connection = None
    for attempt in range(12):
        try:
            connection = psycopg.connect(database_url)
            break
        except psycopg.OperationalError:
            if attempt == 11:
                raise
            time.sleep(2)
    assert connection is not None
    with connection:
        with connection.cursor() as cursor:
            cursor.execute("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())")
            existing = cursor.execute("SELECT checksum FROM schema_migrations WHERE name=%s", (schema_path.name,)).fetchone()
            if existing:
                if existing[0] != checksum:
                    raise SystemExit(f"Migration {schema_path.name} changed after application; add a new migration instead")
                print(f"Migration already applied: {schema_path.name}")
                return
            cursor.execute(schema)
            cursor.execute("INSERT INTO schema_migrations(name,checksum) VALUES (%s,%s)", (schema_path.name, checksum))
        connection.commit()
    print(f"Applied schema: {schema_path.name}")


if __name__ == "__main__":
    main()
