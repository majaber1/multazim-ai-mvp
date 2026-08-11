"""Apply the initial Multazim PostgreSQL schema in a controlled transaction."""
from __future__ import annotations

import os
from pathlib import Path

import psycopg


def main() -> None:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise SystemExit("DATABASE_URL is required")
    schema_path = Path(__file__).resolve().parents[1] / "infra" / "schema.sql"
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(schema_path.read_text(encoding="utf-8"))
        connection.commit()
    print(f"Applied schema: {schema_path.name}")


if __name__ == "__main__":
    main()
