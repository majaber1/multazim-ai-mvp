from __future__ import annotations

import json
import os
import sqlite3
from collections.abc import Iterator, MutableMapping
from pathlib import Path
from typing import Generic, TypeVar
from uuid import UUID
import psycopg

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class SQLiteModelStore(MutableMapping[UUID, T], Generic[T]):
    """Small durable repository used by the single-container/local edition."""

    def __init__(self, name: str, model: type[T]) -> None:
        default_path = "/tmp/multazim.db" if os.getenv("VERCEL") else ".data/multazim.db"
        database_path = Path(os.getenv("SQLITE_PATH", default_path))
        database_path.parent.mkdir(parents=True, exist_ok=True)
        self.connection = sqlite3.connect(database_path, check_same_thread=False)
        self.connection.execute(
            "CREATE TABLE IF NOT EXISTS model_store "
            "(store TEXT NOT NULL, id TEXT NOT NULL, payload TEXT NOT NULL, "
            "PRIMARY KEY (store, id))"
        )
        self.connection.commit()
        self.name = name
        self.model = model

    def __getitem__(self, key: UUID) -> T:
        row = self.connection.execute(
            "SELECT payload FROM model_store WHERE store = ? AND id = ?",
            (self.name, str(key)),
        ).fetchone()
        if not row:
            raise KeyError(key)
        return self.model.model_validate_json(row[0])

    def __setitem__(self, key: UUID, value: T) -> None:
        self.connection.execute(
            "INSERT INTO model_store(store, id, payload) VALUES (?, ?, ?) "
            "ON CONFLICT(store, id) DO UPDATE SET payload = excluded.payload",
            (self.name, str(key), value.model_dump_json()),
        )
        self.connection.commit()

    def __delitem__(self, key: UUID) -> None:
        cursor = self.connection.execute(
            "DELETE FROM model_store WHERE store = ? AND id = ?", (self.name, str(key))
        )
        self.connection.commit()
        if not cursor.rowcount:
            raise KeyError(key)

    def __iter__(self) -> Iterator[UUID]:
        rows = self.connection.execute(
            "SELECT id FROM model_store WHERE store = ?", (self.name,)
        ).fetchall()
        return iter(UUID(row[0]) for row in rows)

    def __len__(self) -> int:
        return int(self.connection.execute(
            "SELECT COUNT(*) FROM model_store WHERE store = ?", (self.name,)
        ).fetchone()[0])


class SQLiteEventStore:
    def __init__(self, model: type[T]) -> None:
        self.store = SQLiteModelStore("audit_events", model)

    def append(self, value: T) -> None:
        # Audit events do not expose an ID, so derive a stable append-only key.
        key = UUID(bytes=__import__("hashlib").md5(
            value.model_dump_json().encode("utf-8"), usedforsecurity=False
        ).digest())
        self.store[key] = value

    def __iter__(self):
        return iter(self.store.values())


class PostgreSQLModelStore(MutableMapping[UUID, T], Generic[T]):
    """PostgreSQL-backed service repository selected whenever DATABASE_URL is set."""

    def __init__(self, name: str, model: type[T]) -> None:
        self.name, self.model = name, model
        self.database_url = os.environ["DATABASE_URL"]
        with psycopg.connect(self.database_url) as connection:
            connection.execute("CREATE TABLE IF NOT EXISTS application_model_store (store text NOT NULL, id uuid NOT NULL, organization_id uuid, payload jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(store,id))")

    def __getitem__(self, key: UUID) -> T:
        with psycopg.connect(self.database_url) as connection:
            row = connection.execute("SELECT payload FROM application_model_store WHERE store=%s AND id=%s", (self.name, key)).fetchone()
        if not row:
            raise KeyError(key)
        return self.model.model_validate(row[0])

    def __setitem__(self, key: UUID, value: T) -> None:
        payload = value.model_dump(mode="json")
        organization_id = payload.get("organization_id") or (str(key) if self.name == "organizations" else None)
        with psycopg.connect(self.database_url) as connection:
            connection.execute("INSERT INTO application_model_store(store,id,organization_id,payload) VALUES (%s,%s,%s,%s::jsonb) ON CONFLICT(store,id) DO UPDATE SET organization_id=excluded.organization_id,payload=excluded.payload,updated_at=now()",
                (self.name, key, organization_id, json.dumps(payload)))

    def __delitem__(self, key: UUID) -> None:
        with psycopg.connect(self.database_url) as connection:
            cursor = connection.execute("DELETE FROM application_model_store WHERE store=%s AND id=%s", (self.name, key))
            if not cursor.rowcount:
                raise KeyError(key)

    def __iter__(self) -> Iterator[UUID]:
        with psycopg.connect(self.database_url) as connection:
            rows = connection.execute("SELECT id FROM application_model_store WHERE store=%s", (self.name,)).fetchall()
        return iter(row[0] for row in rows)

    def __len__(self) -> int:
        with psycopg.connect(self.database_url) as connection:
            return int(connection.execute("SELECT count(*) FROM application_model_store WHERE store=%s", (self.name,)).fetchone()[0])


def model_store(name: str, model: type[T]) -> MutableMapping[UUID, T]:
    return PostgreSQLModelStore(name, model) if os.getenv("DATABASE_URL") else SQLiteModelStore(name, model)


class EventStore:
    def __init__(self, model: type[T]) -> None:
        self.store = model_store("audit_events", model)

    def append(self, value: T) -> None:
        key = UUID(bytes=__import__("hashlib").md5(value.model_dump_json().encode("utf-8"), usedforsecurity=False).digest())
        self.store[key] = value

    def __iter__(self):
        return iter(self.store.values())


def storage_health() -> dict[str, object]:
    if os.getenv("DATABASE_URL"):
        try:
            with psycopg.connect(os.environ["DATABASE_URL"]) as connection:
                connection.execute("SELECT 1")
            return {"engine": "postgresql", "persistent": True, "ready": True}
        except psycopg.Error:
            return {"engine": "postgresql", "persistent": True, "ready": False}
    default_path = "/tmp/multazim.db" if os.getenv("VERCEL") else ".data/multazim.db"
    path = Path(os.getenv("SQLITE_PATH", default_path))
    return {"engine": "sqlite", "path": str(path), "persistent": not bool(os.getenv("VERCEL"))}
