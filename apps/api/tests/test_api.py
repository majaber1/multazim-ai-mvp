from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def headers(org_id, role="organization_admin"):
    return {"X-User-Id": "test-user", "X-Organization-Id": str(org_id), "X-Role": role}


def test_health_and_security_headers():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers["x-frame-options"] == "DENY"


def test_government_applicability_is_explained():
    response = client.post("/v1/applicability", json={"entity_type": "government", "sector": "government", "handles_personal_data": True})
    assert response.status_code == 200
    results = {item["framework_code"]: item for item in response.json()}
    assert results["DGA-QIYAS-2025"]["classification"] == "MANDATORY"
    assert results["SDAIA-PDPL"]["reason_en"]


def test_evidence_is_tenant_isolated():
    org_a, org_b = uuid4(), uuid4()
    created = client.post("/v1/evidence", headers=headers(org_a), json={
        "organization_id": str(org_a), "title": "Access review", "universal_control_ids": ["UC-IAM-001"]
    })
    assert created.status_code == 201
    evidence_id = created.json()["id"]
    assert client.get(f"/v1/evidence/{evidence_id}", headers=headers(org_a)).status_code == 200
    assert client.get(f"/v1/evidence/{evidence_id}", headers=headers(org_b)).status_code == 404


def test_read_only_auditor_cannot_create_evidence():
    org_id = uuid4()
    response = client.post("/v1/evidence", headers=headers(org_id, "external_auditor"), json={
        "organization_id": str(org_id), "title": "Attempt", "universal_control_ids": ["UC-IAM-001"]
    })
    assert response.status_code == 403


def test_dashboard_and_actions_are_tenant_scoped():
    from app.main import DEMO_ORGANIZATION_ID
    response = client.get("/v1/dashboard", headers=headers(DEMO_ORGANIZATION_ID))
    assert response.status_code == 200
    assert response.json()["actions"]
    other = client.get("/v1/actions", headers=headers(uuid4()))
    assert other.status_code == 200
    assert other.json() == []


def test_profile_update_recalculates_applicability():
    from app.main import DEMO_ORGANIZATION_ID
    profile = {"entity_type": "private", "sector": "finance", "handles_personal_data": True, "sama_regulated": True}
    updated = client.put(f"/v1/organizations/{DEMO_ORGANIZATION_ID}/profile", headers=headers(DEMO_ORGANIZATION_ID), json=profile)
    assert updated.status_code == 200
    result = client.get(f"/v1/organizations/{DEMO_ORGANIZATION_ID}/applicability", headers=headers(DEMO_ORGANIZATION_ID))
    codes = {item["framework_code"]: item["classification"] for item in result.json()}
    assert codes["SAMA-CSF"] == "MANDATORY"
    assert codes["DGA-QIYAS-2025"] == "NOT_APPLICABLE"


def test_report_calendar_and_audit_log():
    from app.main import DEMO_ORGANIZATION_ID
    report = client.get("/v1/reports/executive.csv", headers=headers(DEMO_ORGANIZATION_ID))
    assert report.status_code == 200
    assert "Not an official regulator score" in report.text
    calendar = client.get("/v1/calendar", headers=headers(DEMO_ORGANIZATION_ID))
    assert calendar.status_code == 200 and calendar.json()
    audit = client.get("/v1/audit-log", headers=headers(DEMO_ORGANIZATION_ID))
    assert audit.status_code == 200


def test_policy_is_draft_and_ai_cannot_make_final_decision():
    from app.main import DEMO_ORGANIZATION_ID
    policy = client.post("/v1/policies/draft", headers=headers(DEMO_ORGANIZATION_ID), json={"organization_id": str(DEMO_ORGANIZATION_ID), "policy_type": "privacy"})
    assert policy.status_code == 200
    assert policy.json()["status"] == "draft_requires_approval"
    evidence = client.post("/v1/evidence", headers=headers(DEMO_ORGANIZATION_ID), json={"organization_id": str(DEMO_ORGANIZATION_ID), "title": "Privacy register", "universal_control_ids": ["UC-PRI-002"]}).json()
    analysis = client.post(f"/v1/evidence/{evidence['id']}/analysis", headers=headers(DEMO_ORGANIZATION_ID), json={"requirement_reference": "PDPL-DEMO"})
    assert analysis.status_code == 200
    assert analysis.json()["requires_human_approval"] is True
    assert analysis.json()["final_decision"] is None
