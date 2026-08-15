"""Two-phase smoke proof for FastAPI persistence on PostgreSQL."""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "api"))
from fastapi.testclient import TestClient  # noqa: E402
from app.main import DEMO_ORGANIZATION_ID, app  # noqa: E402

headers = {"X-User-Id": "postgres-smoke", "X-Organization-Id": str(DEMO_ORGANIZATION_ID), "X-Role": "organization_admin"}
client = TestClient(app)

if sys.argv[1] == "write":
    response = client.post("/v1/assessments", headers=headers, json={"organization_id": str(DEMO_ORGANIZATION_ID),
        "framework_code": "PG-SMOKE", "framework_version": "1", "title": "PostgreSQL restart proof",
        "scope": "Persistence integration", "assessor_ids": ["postgres-smoke"]})
    response.raise_for_status()
elif sys.argv[1] == "read":
    records = client.get("/v1/assessments", headers=headers).json()
    assert any(item["framework_code"] == "PG-SMOKE" for item in records), records
    print("PostgreSQL persistence verified after process restart")
else:
    raise SystemExit("usage: verify_postgres_persistence.py write|read")
