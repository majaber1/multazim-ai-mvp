from __future__ import annotations

import json
import os
import sqlite3
from collections.abc import Iterator, MutableMapping
from pathlib import Path
from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class SQLiteModelStore(MutableMapping[UUID, T], Generic[T]):
    """Small durable repository used by the single-container/local edition."""

    def __init__(self, name: str, model: type[T]) -> None:
        database_path = Path(os.getenv("SQLITE_PATH", ".data/multazim.db"))
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


def storage_health() -> dict[str, object]:
    path = Path(os.getenv("SQLITE_PATH", ".data/multazim.db"))
    return {"engine": "sqlite", "path": str(path), "persistent": True}
