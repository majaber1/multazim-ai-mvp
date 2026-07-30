from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

app = FastAPI(title="Multazim AI API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class AssessmentRequest(BaseModel):
    answers: dict[str, bool]

class WebsiteAuditRequest(BaseModel):
    url: HttpUrl

@app.get("/health")
def health():
    return {"status": "ok", "service": "multazim-api"}

@app.post("/v1/assessments/score")
def score_assessment(payload: AssessmentRequest):
    answers = list(payload.answers.values())
    score = round(sum(1 for value in answers if value) / len(answers) * 100) if answers else 0
    risk = "low" if score >= 80 else "medium" if score >= 55 else "high"
    return {"score": score, "risk": risk, "answered": len(answers)}

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
