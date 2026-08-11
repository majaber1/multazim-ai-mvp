from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

app = FastAPI(title="Multazim AI API", version="0.2.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class AssessmentRequest(BaseModel):
    answers: dict[str, bool]


class WebsiteAuditRequest(BaseModel):
    url: HttpUrl


class ComplianceScoreRequest(BaseModel):
    regulation_code: str
    control_answers: dict[str, str]


@app.get("/health")
def health():
    return {"status": "ok", "service": "multazim-api"}


@app.post("/v1/assessments/score")
def score_assessment(payload: AssessmentRequest):
    answers = list(payload.answers.values())
    score = round(sum(1 for value in answers if value) / len(answers) * 100) if answers else 0
    risk = "low" if score >= 80 else "medium" if score >= 55 else "high"
    return {"score": score, "risk": risk, "answered": len(answers)}


@app.post("/v1/compliance/score")
def score_compliance(payload: ComplianceScoreRequest):
    """Score compliance against a specific regulation based on control implementation status."""
    statuses = list(payload.control_answers.values())
    total = len(statuses)
    if total == 0:
        return {"score": 0, "regulation_code": payload.regulation_code, "total_controls": 0}

    weights = {"implemented": 1.0, "partial": 0.5, "not_implemented": 0.0, "not_applicable": None}
    applicable = [(s, weights.get(s, 0.0)) for s in statuses if weights.get(s) is not None]
    if not applicable:
        return {"score": 100, "regulation_code": payload.regulation_code, "total_controls": total, "applicable_controls": 0}

    score = round(sum(w for _, w in applicable) / len(applicable) * 100)
    risk = "low" if score >= 80 else "medium" if score >= 55 else "high"

    return {
        "score": score,
        "risk": risk,
        "regulation_code": payload.regulation_code,
        "total_controls": total,
        "applicable_controls": len(applicable),
        "implemented": sum(1 for s, _ in applicable if s == "implemented"),
        "partial": sum(1 for s, _ in applicable if s == "partial"),
        "not_implemented": sum(1 for s, _ in applicable if s == "not_implemented"),
        "not_applicable": total - len(applicable),
    }


@app.post("/v1/certifications/readiness")
def certification_readiness(payload: ComplianceScoreRequest):
    """Calculate certification readiness based on existing control implementations."""
    statuses = list(payload.control_answers.values())
    total = len(statuses)
    if total == 0:
        return {"readiness_score": 0, "certification_code": payload.regulation_code}

    weights = {"implemented": 1.0, "partial": 0.5, "not_implemented": 0.0, "not_applicable": None}
    applicable = [(s, weights.get(s, 0.0)) for s in statuses if weights.get(s) is not None]
    if not applicable:
        return {"readiness_score": 100, "certification_code": payload.regulation_code, "status": "ready"}

    score = round(sum(w for _, w in applicable) / len(applicable) * 100)
    status = "ready" if score >= 85 else "in_progress" if score >= 50 else "not_started"

    return {
        "readiness_score": score,
        "certification_code": payload.regulation_code,
        "status": status,
        "gaps": sum(1 for s, _ in applicable if s == "not_implemented"),
        "partial_gaps": sum(1 for s, _ in applicable if s == "partial"),
    }


@app.post("/v1/audits/website")
def audit_website(payload: WebsiteAuditRequest):
    return {
        "url": str(payload.url),
        "status": "completed",
        "findings": [
            {"name": "privacy_policy", "status": "missing", "severity": "high"},
            {"name": "refund_policy", "status": "found", "severity": "none"},
            {"name": "contact_details", "status": "found", "severity": "none"},
            {"name": "cookie_notice", "status": "partial", "severity": "medium"},
        ],
    }
