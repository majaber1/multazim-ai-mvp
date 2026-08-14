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


def test_framework_scoring_uses_strategy():
    response = client.post("/v1/assessments/score", json={
        "framework_code": "SDAIA-PDPL", "answers": {"privacy": True, "consent": False, "retention": True}
    })
    assert response.status_code == 200
    assert response.json()["method"] == "framework_weighted"
    assert response.json()["score"] == 67


def test_binary_evidence_upload_is_hashed_and_tenant_scoped(tmp_path, monkeypatch):
    from app import main
    org_id = uuid4()
    monkeypatch.setattr(main, "UPLOAD_DIR", tmp_path)
    response = client.post("/v1/evidence/upload", headers=headers(org_id), data={
        "organization_id": str(org_id), "title": "Access review PDF",
        "universal_control_id": "UC-IAM-001", "classification": "confidential",
    }, files={"file": ("review.pdf", b"%PDF-1.4 test evidence", "application/pdf")})
    assert response.status_code == 201
    payload = response.json()
    assert payload["sha256"] and payload["size_bytes"] == 22
    assert payload["state"] == "under_review"
    assert client.get(f"/v1/evidence/{payload['id']}", headers=headers(uuid4())).status_code == 404


def test_notifications_and_audit_package_exports():
    from app.main import DEMO_ORGANIZATION_ID
    notifications = client.get("/v1/notifications", headers=headers(DEMO_ORGANIZATION_ID))
    assert notifications.status_code == 200 and notifications.json()
    package = client.get("/v1/audits/package.json", headers=headers(DEMO_ORGANIZATION_ID))
    assert package.status_code == 200
    assert package.headers["content-disposition"].endswith("multazim-audit-package.json")


def test_pdf_excel_and_catalog_exports():
    from app.main import DEMO_ORGANIZATION_ID
    auth = headers(DEMO_ORGANIZATION_ID)
    pdf = client.get("/v1/reports/executive.pdf", headers=auth)
    assert pdf.status_code == 200 and pdf.content.startswith(b"%PDF")
    xlsx = client.get("/v1/reports/executive.xlsx", headers=auth)
    assert xlsx.status_code == 200 and xlsx.content.startswith(b"PK")
    catalog = client.get("/v1/frameworks/catalog")
    assert catalog.status_code == 200 and catalog.json()["count"] == 5


def test_catalog_exposes_official_sources_and_supports_filters():
    nca = client.get("/v1/frameworks/catalog", params={"regulator": "nca"})
    assert nca.status_code == 200
    assert nca.json()["count"] == 2
    assert all(item["regulator"] == "NCA" for item in nca.json()["records"])
    assert all(item["official_source"].startswith("https://") for item in nca.json()["records"])

    searched = client.get("/v1/frameworks/catalog", params={"q": "personal data"})
    assert searched.status_code == 200
    assert [item["code"] for item in searched.json()["records"]] == ["SDAIA-PDPL"]

    verified = client.get("/v1/frameworks/catalog", params={"verification_status": "VERIFIED_METADATA"})
    assert verified.status_code == 200
    assert verified.json()["count"] == 2


def test_transportation_journey_is_sourced_classified_and_scores_readiness():
    listing = client.get("/v1/journeys", params={"q": "taxi"})
    assert listing.status_code == 200 and listing.json()["count"] == 1
    assert listing.json()["records"][0]["requirements_count"] == 8

    detail = client.get("/v1/journeys/TGA-TAXI-APP-MEDIATION")
    assert detail.status_code == 200
    journey = detail.json()
    source_ids = {source["id"] for source in journey["official_sources"]}
    assert all(requirement["source_id"] in source_ids for requirement in journey["requirements"])
    statuses = {requirement["status"] for requirement in journey["requirements"]}
    assert statuses == {"CONFIRMED_REQUIREMENT", "SUGGESTED_REQUIREMENT", "REQUIRES_EXPERT_VERIFICATION"}

    confirmed = [requirement["code"] for requirement in journey["requirements"] if requirement["status"] == "CONFIRMED_REQUIREMENT"]
    readiness = client.post("/v1/journeys/TGA-TAXI-APP-MEDIATION/readiness", json={"completed_requirement_codes": confirmed})
    assert readiness.status_code == 200
    assert readiness.json()["score"] == 75
    assert readiness.json()["status"] == "in_progress"
    assert len(readiness.json()["blockers"]) == 3

    invalid = client.post("/v1/journeys/TGA-TAXI-APP-MEDIATION/readiness", json={"completed_requirement_codes": ["UNKNOWN"]})
    assert invalid.status_code == 422


def test_assessment_campaign_response_and_transparent_score_are_tenant_scoped():
    org_id, other_org = uuid4(), uuid4()
    created = client.post("/v1/assessments", headers=headers(org_id), json={
        "organization_id": str(org_id), "framework_code": "NCA-ECC-2-2024", "framework_version": "2-2024",
        "title": "Quarterly readiness", "scope": "Technology department", "assessor_ids": ["assessor-1"]
    })
    assert created.status_code == 201
    assessment_id = created.json()["id"]
    response = client.put(f"/v1/assessments/{assessment_id}/responses/NCA-1", headers=headers(org_id), json={
        "control_code": "NCA-1", "status": "non_compliant", "mandatory": True, "weight": 2,
        "rationale": "Required process is not operating", "review_state": "submitted"
    })
    assert response.status_code == 200
    client.put(f"/v1/assessments/{assessment_id}/responses/NCA-2", headers=headers(org_id), json={
        "control_code": "NCA-2", "status": "not_assessed", "weight": 1
    })
    score = client.get(f"/v1/assessments/{assessment_id}/score", headers=headers(org_id))
    assert score.status_code == 200
    assert score.json()["readiness"] == 0
    assert score.json()["mandatory_control_penalty"] == 5
    assert score.json()["assessment_completeness"] == 50
    assert client.get(f"/v1/assessments/{assessment_id}/score", headers=headers(other_org)).status_code == 404


def test_gap_mapping_coverage_and_applicability_override_workflow():
    org_id = uuid4()
    override = client.put(f"/v1/organizations/{org_id}/applicability/NCA-ECC/override", headers=headers(org_id), json={
        "classification": "NEEDS_REVIEW", "justification": "Legal counsel must confirm the entity mandate."
    })
    assert override.status_code == 200 and override.json()["actor_id"] == "test-user"
    gap = client.post("/v1/gaps", headers=headers(org_id), json={
        "organization_id": str(org_id), "framework_code": "NCA-ECC", "control_code": "NCA-1",
        "finding": "Access reviews are not evidenced", "severity": "high", "owner": "Security team",
        "due_date": "2026-01-01", "remediation_plan": "Complete and approve the quarterly review"
    })
    assert gap.status_code == 201
    assert client.get("/v1/gaps", headers=headers(org_id), params={"overdue": True}).json()
    evidence = client.post("/v1/evidence", headers=headers(org_id), json={
        "organization_id": str(org_id), "title": "Access review", "universal_control_ids": ["UC-IAM-001"]
    }).json()
    mapping = client.post("/v1/control-mappings", headers=headers(org_id), json={
        "organization_id": str(org_id), "canonical_control_code": "UC-IAM-001",
        "framework_control_codes": ["NCA-1", "ISO-A.5.18", "DGA-7.2"], "mapping_type": "supports",
        "confidence": "expert_reviewed", "source": "Human-reviewed mapping record", "version": "1"
    })
    assert mapping.status_code == 201 and mapping.json()["approved"] is True
    coverage = client.get(f"/v1/evidence/{evidence['id']}/coverage", headers=headers(org_id))
    assert coverage.status_code == 200 and coverage.json()["requirements_count"] == 3
    assert client.get(f"/v1/evidence/{evidence['id']}/coverage", headers=headers(uuid4())).status_code == 404
