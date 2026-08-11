from __future__ import annotations

from enum import StrEnum
from datetime import date, datetime, timezone
import csv
import hashlib
import io
import json
import os
from pathlib import Path
from typing import Annotated, Literal
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Query, Request, Response, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
import jwt
from jwt import PyJWKClient
from pydantic import BaseModel, Field, HttpUrl
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen.canvas import Canvas
from app.object_storage import put_object, scan_upload
from app.persistence import SQLiteEventStore, SQLiteModelStore, storage_health


class Role(StrEnum):
    PLATFORM_ADMIN = "platform_super_admin"
    ORG_ADMIN = "organization_admin"
    COMPLIANCE_MANAGER = "compliance_manager"
    ASSESSOR = "compliance_officer"
    AUDITOR = "external_auditor"
    VIEWER = "executive_viewer"


class UserContext(BaseModel):
    user_id: str
    organization_id: UUID
    role: Role


class OrganizationProfile(BaseModel):
    entity_type: Literal["government", "semi_government", "private", "non_profit"]
    sector: str
    handles_personal_data: bool = False
    handles_sensitive_data: bool = False
    critical_infrastructure: bool = False
    critical_systems: bool = False
    uses_cloud: bool = False
    provides_cloud_services: bool = False
    sama_regulated: bool = False
    cma_regulated: bool = False
    subject_to_e_invoicing: bool = False
    seeks_iso_certification: bool = False


class OrganizationCreate(BaseModel):
    name_ar: str = Field(min_length=2, max_length=200)
    name_en: str = Field(min_length=2, max_length=200)
    profile: OrganizationProfile


class Organization(OrganizationCreate):
    id: UUID


class ApplicabilityResult(BaseModel):
    framework_code: str
    name_ar: str
    name_en: str
    classification: Literal["MANDATORY", "LIKELY_APPLICABLE", "CONDITIONAL", "VOLUNTARY", "NOT_APPLICABLE", "NEEDS_REVIEW"]
    reason_ar: str
    reason_en: str
    source_url: str


class AssessmentRequest(BaseModel):
    answers: dict[str, bool]
    framework_code: str | None = None


class EvidenceCreate(BaseModel):
    organization_id: UUID
    title: str = Field(min_length=2, max_length=250)
    universal_control_ids: list[str] = Field(min_length=1)
    classification: Literal["public", "internal", "confidential", "restricted"] = "internal"


class Evidence(EvidenceCreate):
    id: UUID
    state: Literal["uploaded", "under_review", "accepted", "rejected"]
    sha256: str | None = None
    filename: str | None = None
    content_type: str | None = None
    size_bytes: int | None = None
    scan_status: Literal["not_applicable", "pending", "clean", "rejected"] = "not_applicable"


class ActionCreate(BaseModel):
    organization_id: UUID
    title: str = Field(min_length=3, max_length=250)
    owner: str = Field(min_length=2, max_length=120)
    due_date: date
    priority: Literal["critical", "high", "medium", "low"] = "medium"
    impacted_frameworks: list[str] = Field(default_factory=list)


class CorrectiveAction(ActionCreate):
    id: UUID
    status: Literal["open", "planned", "in_progress", "blocked", "pending_evidence", "pending_review", "completed", "accepted_risk"]


class ActionStatusUpdate(BaseModel):
    status: Literal["open", "planned", "in_progress", "blocked", "pending_evidence", "pending_review", "completed", "accepted_risk"]


class FrameworkMetric(BaseModel):
    code: str
    name_ar: str
    name_en: str
    score: int
    version: str


class DashboardSummary(BaseModel):
    organization_id: UUID
    overall_score: int
    evidence_readiness: int
    critical_gaps: int
    applicable_frameworks: int
    trend: float
    framework_scores: list[FrameworkMetric]
    actions: list[CorrectiveAction]
    risk_distribution: dict[str, int]
    disclaimer_ar: str


class EvidenceAnalysisRequest(BaseModel):
    requirement_reference: str = Field(min_length=2, max_length=100)


class EvidenceAnalysis(BaseModel):
    evidence_id: UUID
    suggestion: Literal["compliant", "partially_compliant", "insufficient", "missing"]
    confidence: float
    reasoning_ar: str
    citations: list[str]
    final_decision: None = None
    requires_human_approval: bool = True


class PolicyDraftRequest(BaseModel):
    organization_id: UUID
    policy_type: Literal["information_security", "access_control", "privacy", "data_retention", "business_continuity", "vendor_management", "ai_governance"]


class AuditEvent(BaseModel):
    organization_id: UUID
    actor_id: str
    action: str
    resource_type: str
    resource_id: str
    occurred_at: datetime


class WebsiteAuditRequest(BaseModel):
    url: HttpUrl


class JourneyReadinessRequest(BaseModel):
    completed_requirement_codes: list[str] = Field(default_factory=list, max_length=200)


APP_ENV = os.getenv("APP_ENV", "development").lower()
IS_PRODUCTION = APP_ENV == "production"
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]
OIDC_ISSUER = os.getenv("OIDC_ISSUER", "").rstrip("/")
OIDC_AUDIENCE = os.getenv("OIDC_AUDIENCE", "")
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/tmp/multazim-evidence" if IS_PRODUCTION else ".data/evidence"))
ALLOWED_EVIDENCE_TYPES = {"application/pdf", "image/png", "image/jpeg", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}

app = FastAPI(
    title="Multazim Compliance Intelligence API",
    version="0.2.0",
    description="Tenant-aware compliance API with OIDC enforcement in production and explicit demo mode in development.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-User-Id", "X-Organization-Id", "X-Role"],
)

organizations = SQLiteModelStore("organizations", Organization)
evidence_store = SQLiteModelStore("evidence", Evidence)
DEMO_ORGANIZATION_ID = UUID("11111111-1111-4111-8111-111111111111")
organizations[DEMO_ORGANIZATION_ID] = Organization(
    id=DEMO_ORGANIZATION_ID,
    name_ar="شركة آفاق الرقمية السعودية",
    name_en="Saudi Digital Horizons Company",
    profile=OrganizationProfile(entity_type="government", sector="technology", handles_personal_data=True, uses_cloud=True),
)
action_store = SQLiteModelStore("actions", CorrectiveAction)
audit_events = SQLiteEventStore(AuditEvent)
for item in [
    CorrectiveAction(id=UUID("21111111-1111-4111-8111-111111111111"), organization_id=DEMO_ORGANIZATION_ID, title="اعتماد مراجعة الحسابات ذات الصلاحيات العالية", owner="نورة القحطاني", due_date=date(2026, 8, 12), priority="critical", impacted_frameworks=["NCA ECC", "ISO 27001", "SAMA CSF", "CST CRF"], status="open"),
    CorrectiveAction(id=UUID("21111111-1111-4111-8111-111111111112"), organization_id=DEMO_ORGANIZATION_ID, title="استكمال سجل أنشطة معالجة البيانات", owner="فريق الخصوصية", due_date=date(2026, 8, 17), priority="high", impacted_frameworks=["PDPL", "ISO 27701"], status="in_progress"),
    CorrectiveAction(id=UUID("21111111-1111-4111-8111-111111111113"), organization_id=DEMO_ORGANIZATION_ID, title="توثيق اختبار استعادة النسخ الاحتياطية", owner="إدارة التقنية", due_date=date(2026, 8, 25), priority="medium", impacted_frameworks=["DGA Qiyas", "ISO 22301", "SAMA BCM"], status="planned"),
]:
    action_store[item.id] = item


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains" if IS_PRODUCTION else "max-age=0"
    return response


def user_context(
    authorization: Annotated[str | None, Header()] = None,
    x_user_id: Annotated[str | None, Header()] = None,
    x_organization_id: Annotated[UUID | None, Header()] = None,
    x_role: Annotated[Role | None, Header()] = None,
) -> UserContext:
    if authorization and authorization.lower().startswith("bearer "):
        if not OIDC_ISSUER or not OIDC_AUDIENCE:
            raise HTTPException(status_code=503, detail="OIDC is not configured")
        try:
            token = authorization.split(" ", 1)[1]
            signing_key = PyJWKClient(f"{OIDC_ISSUER}/.well-known/jwks.json").get_signing_key_from_jwt(token)
            claims = jwt.decode(token, signing_key.key, algorithms=["RS256"], audience=OIDC_AUDIENCE, issuer=OIDC_ISSUER)
            return UserContext(user_id=str(claims["sub"]), organization_id=UUID(str(claims["organization_id"])), role=Role(claims["role"]))
        except (KeyError, ValueError, jwt.PyJWTError) as exc:
            raise HTTPException(status_code=401, detail="Invalid access token") from exc
    if not IS_PRODUCTION and x_user_id and x_organization_id and x_role:
        return UserContext(user_id=x_user_id, organization_id=x_organization_id, role=x_role)
    raise HTTPException(status_code=401, detail="Bearer authentication required")


def require_roles(*roles: Role):
    def checker(user: Annotated[UserContext, Depends(user_context)]) -> UserContext:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return user
    return checker


def assert_tenant(resource_org_id: UUID, user: UserContext) -> None:
    if user.role != Role.PLATFORM_ADMIN and resource_org_id != user.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")


def record_event(user: UserContext, action: str, resource_type: str, resource_id: UUID) -> None:
    audit_events.append(AuditEvent(organization_id=user.organization_id, actor_id=user.user_id, action=action,
        resource_type=resource_type, resource_id=str(resource_id), occurred_at=datetime.now(timezone.utc)))


def determine_applicability(profile: OrganizationProfile) -> list[ApplicabilityResult]:
    results: list[ApplicabilityResult] = []

    def add(code: str, ar: str, en: str, level: str, why_ar: str, why_en: str, source: str):
        results.append(ApplicabilityResult(framework_code=code, name_ar=ar, name_en=en,
            classification=level, reason_ar=why_ar, reason_en=why_en, source_url=source))

    if profile.entity_type == "government":
        add("DGA-QIYAS-2025", "المعايير الأساسية للتحول الرقمي 2025", "Digital Transformation Basic Standards 2025", "MANDATORY",
            "الجهة مصنفة كجهة حكومية ضمن نطاق قياس.", "The organization is classified as a government entity within Qiyas scope.", "https://dga.gov.sa/en/Standards_Of_Digital_Transformation")
    else:
        add("DGA-QIYAS-2025", "المعايير الأساسية للتحول الرقمي 2025", "Digital Transformation Basic Standards 2025", "NOT_APPLICABLE",
            "قياس موجه للجهات الحكومية؛ يلزم التحقق إذا كان للجهة تكليف خاص.", "Qiyas targets government entities; review any specific mandate separately.", "https://dga.gov.sa/en/Standards_Of_Digital_Transformation")
    if profile.handles_personal_data:
        add("SDAIA-PDPL", "نظام حماية البيانات الشخصية", "Personal Data Protection Law", "MANDATORY",
            "أفادت الجهة بأنها تعالج بيانات شخصية.", "The organization declared that it processes personal data.", "https://sdaia.gov.sa/en/SDAIA/about/Pages/RegulationsAndPolicies.aspx")
    if profile.sama_regulated:
        add("SAMA-CSF", "إطار الأمن السيبراني", "SAMA Cyber Security Framework", "MANDATORY",
            "أفادت الجهة بأنها خاضعة لرقابة البنك المركزي السعودي.", "The organization declared that it is regulated by the Saudi Central Bank.", "https://rulebook.sama.gov.sa/en/cyber-security-framework-2")
    if profile.uses_cloud:
        add("NCA-CCC-2-2024", "ضوابط الأمن السيبراني للحوسبة السحابية", "Cloud Cybersecurity Controls", "CONDITIONAL",
            "تستخدم الجهة خدمات سحابية؛ يجب تحديد دور المستفيد أو مقدم الخدمة.", "The organization uses cloud services; tenant/provider role must be confirmed.", "https://nca.gov.sa/en/regulatory-documents/controls-list/ccc/")
    add("NCA-ECC-2-2024", "الضوابط الأساسية للأمن السيبراني", "Essential Cybersecurity Controls", "NEEDS_REVIEW",
        "يتطلب تحديد نطاق انطباق الضوابط حسب طبيعة الجهة وأصولها.", "Applicability requires review of the entity mandate and information assets.", "https://nca.gov.sa/en/regulatory-documents/controls-list/ecc/")
    add("ISO-27001-2022", "نظام إدارة أمن المعلومات", "ISO/IEC 27001", "VOLUNTARY" if profile.seeks_iso_certification else "CONDITIONAL",
        "معيار شهادة دولي وليس متطلبًا سعوديًا افتراضيًا.", "An international certification standard, not a Saudi requirement by default.", "https://www.iso.org/standard/27001")
    return results


@app.get("/health")
def health():
    oidc_ready = bool(OIDC_ISSUER and OIDC_AUDIENCE)
    return {"status": "ok", "service": "multazim-api", "version": app.version, "environment": APP_ENV,
        "api_url": os.getenv("PUBLIC_API_URL", "http://localhost:8000"), "storage": storage_health(),
        "checks": {"database_configured": True, "oidc_configured": oidc_ready,
        "persistent_object_storage": True, "demo_headers_enabled": not IS_PRODUCTION}}


@app.post("/v1/organizations", response_model=Organization, status_code=201)
def create_organization(payload: OrganizationCreate):
    organization = Organization(id=uuid4(), **payload.model_dump())
    organizations[organization.id] = organization
    return organization


@app.put("/v1/organizations/{organization_id}/profile", response_model=Organization)
def update_organization_profile(
    organization_id: UUID,
    profile: OrganizationProfile,
    user: Annotated[UserContext, Depends(require_roles(Role.ORG_ADMIN, Role.COMPLIANCE_MANAGER))],
):
    assert_tenant(organization_id, user)
    organization = organizations.get(organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Resource not found")
    updated = organization.model_copy(update={"profile": profile})
    organizations[organization_id] = updated
    record_event(user, "profile.updated", "organization", organization_id)
    return updated


@app.post("/v1/applicability", response_model=list[ApplicabilityResult])
def applicability(profile: OrganizationProfile):
    return determine_applicability(profile)


@app.get("/v1/organizations/{organization_id}/applicability", response_model=list[ApplicabilityResult])
def organization_applicability(organization_id: UUID, user: Annotated[UserContext, Depends(user_context)]):
    assert_tenant(organization_id, user)
    organization = organizations.get(organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Resource not found")
    return determine_applicability(organization.profile)


@app.get("/v1/dashboard", response_model=DashboardSummary)
def dashboard(user: Annotated[UserContext, Depends(user_context)]):
    tenant_actions = [item for item in action_store.values() if item.organization_id == user.organization_id]
    return DashboardSummary(
        organization_id=user.organization_id, overall_score=76, evidence_readiness=68,
        critical_gaps=sum(item.priority == "critical" and item.status != "completed" for item in tenant_actions),
        applicable_frameworks=4, trend=4.2,
        framework_scores=[
            FrameworkMetric(code="DGA-QIYAS-2025", name_ar="قياس التحول الرقمي", name_en="DGA Qiyas", score=83, version="2025"),
            FrameworkMetric(code="NCA-ECC-2-2024", name_ar="الضوابط الأساسية للأمن السيبراني", name_en="NCA ECC", score=78, version="2-2024"),
            FrameworkMetric(code="SDAIA-PDPL", name_ar="نظام حماية البيانات الشخصية", name_en="Saudi PDPL", score=74, version="current"),
            FrameworkMetric(code="ISO-27001-2022", name_ar="نظام إدارة أمن المعلومات", name_en="ISO/IEC 27001", score=67, version="2022"),
        ], actions=tenant_actions, risk_distribution={"critical": 3, "high": 8, "medium": 14},
        disclaimer_ar="بيانات تجريبية ودرجات ملتزم تقديرية وليست تقييمًا رسميًا صادرًا من جهة تنظيمية.",
    )


@app.get("/v1/actions", response_model=list[CorrectiveAction])
def list_actions(user: Annotated[UserContext, Depends(user_context)]):
    return [item for item in action_store.values() if item.organization_id == user.organization_id]


@app.post("/v1/actions", response_model=CorrectiveAction, status_code=201)
def create_action(payload: ActionCreate, user: Annotated[UserContext, Depends(require_roles(Role.ORG_ADMIN, Role.COMPLIANCE_MANAGER, Role.ASSESSOR))]):
    assert_tenant(payload.organization_id, user)
    item = CorrectiveAction(id=uuid4(), status="open", **payload.model_dump())
    action_store[item.id] = item
    record_event(user, "action.created", "corrective_action", item.id)
    return item


@app.patch("/v1/actions/{action_id}", response_model=CorrectiveAction)
def update_action(action_id: UUID, payload: ActionStatusUpdate, user: Annotated[UserContext, Depends(require_roles(Role.ORG_ADMIN, Role.COMPLIANCE_MANAGER, Role.ASSESSOR))]):
    item = action_store.get(action_id)
    if not item:
        raise HTTPException(status_code=404, detail="Resource not found")
    assert_tenant(item.organization_id, user)
    updated = item.model_copy(update={"status": payload.status})
    action_store[action_id] = updated
    record_event(user, "action.status_updated", "corrective_action", action_id)
    return updated


@app.post("/v1/assessments/score")
def score_assessment(payload: AssessmentRequest):
    weights_by_framework = {
        "NCA-ECC-2-2024": {"governance": 1.4, "risk": 1.3, "access": 1.4, "operations": 1.2},
        "SDAIA-PDPL": {"privacy": 1.6, "consent": 1.4, "retention": 1.3, "breach": 1.5},
        "ISO-27001-2022": {"governance": 1.3, "risk": 1.4, "improvement": 1.2},
        "DGA-QIYAS-2025": {"strategy": 1.3, "services": 1.3, "data": 1.2},
    }
    weights = weights_by_framework.get(payload.framework_code or "", {})
    denominator = sum(weights.get(key, 1.0) for key in payload.answers)
    numerator = sum(weights.get(key, 1.0) for key, value in payload.answers.items() if value)
    score = round(numerator / denominator * 100) if denominator else 0
    risk = "low" if score >= 80 else "medium" if score >= 55 else "high"
    return {"score": score, "risk": risk, "answered": len(payload.answers), "framework_code": payload.framework_code,
        "method": "framework_weighted" if payload.framework_code in weights_by_framework else "equal_weight",
        "label": "Multazim estimated readiness score"}


@app.post("/v1/evidence", response_model=Evidence, status_code=201)
def create_evidence(payload: EvidenceCreate, user: Annotated[UserContext, Depends(require_roles(Role.ORG_ADMIN, Role.COMPLIANCE_MANAGER, Role.ASSESSOR))]):
    assert_tenant(payload.organization_id, user)
    evidence = Evidence(id=uuid4(), state="uploaded", **payload.model_dump())
    evidence_store[evidence.id] = evidence
    record_event(user, "evidence.created", "evidence", evidence.id)
    return evidence


@app.post("/v1/evidence/upload", response_model=Evidence, status_code=201)
async def upload_evidence(
    organization_id: Annotated[UUID, Form()], title: Annotated[str, Form(min_length=2, max_length=250)],
    universal_control_id: Annotated[str, Form(min_length=2)], classification: Annotated[str, Form()] = "internal",
    file: UploadFile = File(...),
    user: UserContext = Depends(require_roles(Role.ORG_ADMIN, Role.COMPLIANCE_MANAGER, Role.ASSESSOR)),
):
    assert_tenant(organization_id, user)
    if classification not in {"public", "internal", "confidential", "restricted"}:
        raise HTTPException(status_code=422, detail="Invalid classification")
    if file.content_type not in ALLOWED_EVIDENCE_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported evidence file type")
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Evidence file exceeds upload limit")
    digest = hashlib.sha256(content).hexdigest()
    evidence_id = uuid4()
    clean, scan_reason = scan_upload(content)
    if not clean:
        raise HTTPException(status_code=422, detail=f"Unsafe evidence file: {scan_reason}")
    safe_suffix = Path(file.filename or "evidence").suffix.lower()[:10]
    put_object(f"{organization_id}/{evidence_id}{safe_suffix}", content)
    evidence = Evidence(id=evidence_id, organization_id=organization_id, title=title,
        universal_control_ids=[universal_control_id], classification=classification, state="under_review",
        sha256=digest, filename=Path(file.filename or "evidence").name, content_type=file.content_type,
        size_bytes=len(content), scan_status="clean")
    evidence_store[evidence.id] = evidence
    record_event(user, "evidence.file_uploaded", "evidence", evidence.id)
    return evidence


@app.get("/v1/evidence", response_model=list[Evidence])
def list_evidence(user: Annotated[UserContext, Depends(user_context)]):
    return [item for item in evidence_store.values() if item.organization_id == user.organization_id]


@app.get("/v1/evidence/{evidence_id}", response_model=Evidence)
def get_evidence(evidence_id: UUID, user: Annotated[UserContext, Depends(user_context)]):
    evidence = evidence_store.get(evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Resource not found")
    assert_tenant(evidence.organization_id, user)
    return evidence


@app.post("/v1/evidence/{evidence_id}/analysis", response_model=EvidenceAnalysis)
def analyze_evidence(evidence_id: UUID, payload: EvidenceAnalysisRequest, user: Annotated[UserContext, Depends(require_roles(Role.ORG_ADMIN, Role.COMPLIANCE_MANAGER, Role.ASSESSOR))]):
    evidence = evidence_store.get(evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Resource not found")
    assert_tenant(evidence.organization_id, user)
    record_event(user, "evidence.analysis_requested", "evidence", evidence_id)
    return EvidenceAnalysis(evidence_id=evidence_id, suggestion="insufficient", confidence=0.35,
        reasoning_ar=f"لم يتم توصيل مزود تحليل المستندات بعد؛ لا يمكن التحقق من المتطلب {payload.requirement_reference} من بيانات الوصف وحدها.",
        citations=[], requires_human_approval=True)


@app.get("/v1/calendar")
def compliance_calendar(user: Annotated[UserContext, Depends(user_context)]):
    return [{"id": str(item.id), "type": "corrective_action", "title": item.title, "date": item.due_date,
        "priority": item.priority, "status": item.status} for item in action_store.values() if item.organization_id == user.organization_id]


@app.get("/v1/audit-log", response_model=list[AuditEvent])
def audit_log(user: Annotated[UserContext, Depends(require_roles(Role.ORG_ADMIN, Role.COMPLIANCE_MANAGER, Role.AUDITOR))]):
    return [event for event in audit_events if event.organization_id == user.organization_id]


@app.get("/v1/notifications")
def notifications(user: Annotated[UserContext, Depends(user_context)]):
    today = date.today()
    return [{"id": str(item.id), "severity": "critical" if item.due_date < today else item.priority,
        "title": item.title, "type": "overdue_action" if item.due_date < today else "upcoming_action",
        "date": item.due_date} for item in action_store.values()
        if item.organization_id == user.organization_id and item.status != "completed" and (item.due_date - today).days <= 14]


@app.get("/v1/audits/package.json")
def audit_package(user: Annotated[UserContext, Depends(require_roles(Role.ORG_ADMIN, Role.COMPLIANCE_MANAGER, Role.AUDITOR))]):
    payload = {"generated_at": datetime.now(timezone.utc).isoformat(), "organization_id": str(user.organization_id),
        "evidence": [item.model_dump(mode="json") for item in evidence_store.values() if item.organization_id == user.organization_id],
        "actions": [item.model_dump(mode="json") for item in action_store.values() if item.organization_id == user.organization_id],
        "audit_log": [item.model_dump(mode="json") for item in audit_events if item.organization_id == user.organization_id],
        "notice": "Decision-support export; human review and source-document verification remain required."}
    return Response(content=json.dumps(payload, ensure_ascii=False, indent=2), media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=multazim-audit-package.json"})


@app.post("/v1/policies/draft")
def policy_draft(payload: PolicyDraftRequest, user: Annotated[UserContext, Depends(require_roles(Role.ORG_ADMIN, Role.COMPLIANCE_MANAGER))]):
    assert_tenant(payload.organization_id, user)
    policy_id = uuid4()
    record_event(user, "policy.draft_generated", "policy", policy_id)
    return {"id": policy_id, "policy_type": payload.policy_type, "status": "draft_requires_approval",
        "title_ar": "مسودة سياسة للاعتماد", "notice_ar": "مسودة إرشادية تتطلب مراجعة واعتماد الجهة والمستشار القانوني والأمني حسب الاختصاص.",
        "sections": ["الغرض والنطاق", "الأدوار والمسؤوليات", "المتطلبات", "المراقبة والمراجعة", "إدارة الاستثناءات"]}


@app.get("/v1/reports/executive.csv")
def executive_report(user: Annotated[UserContext, Depends(user_context)]):
    summary = dashboard(user)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Multazim Executive Compliance Report", "DEMO / بيانات تجريبية"])
    writer.writerow(["Organization ID", str(user.organization_id)])
    writer.writerow(["Generated At", datetime.now(timezone.utc).isoformat()])
    writer.writerow(["Overall Multazim Estimated Score", summary.overall_score])
    writer.writerow(["Evidence Readiness", summary.evidence_readiness])
    writer.writerow([])
    writer.writerow(["Framework", "Version", "Estimated Score"])
    for framework in summary.framework_scores:
        writer.writerow([framework.name_en, framework.version, framework.score])
    writer.writerow([])
    writer.writerow(["Limitation", "Not an official regulator score or certification"])
    return Response(content="\ufeff" + output.getvalue(), media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=multazim-executive-report.csv"})


@app.get("/v1/reports/executive.xlsx")
def executive_report_xlsx(user: Annotated[UserContext, Depends(user_context)]):
    summary = dashboard(user)
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Executive Summary"
    rows = [
        ["Multazim Executive Compliance Report", "DEMO / Decision Support"],
        ["Organization ID", str(user.organization_id)],
        ["Generated At", datetime.now(timezone.utc).isoformat()],
        ["Overall Estimated Score", summary.overall_score],
        ["Evidence Readiness", summary.evidence_readiness],
        [],
        ["Framework", "Version", "Estimated Score"],
        *[[item.name_en, item.version, item.score] for item in summary.framework_scores],
        [],
        ["Limitation", "Not an official regulator score or certification"],
    ]
    for row in rows:
        sheet.append(row)
    sheet["A1"].font = Font(bold=True, color="FFFFFF", size=14)
    sheet["A1"].fill = PatternFill("solid", fgColor="047857")
    for cell in sheet[7]:
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="0F766E")
    sheet.column_dimensions["A"].width = 38
    sheet.column_dimensions["B"].width = 48
    sheet.column_dimensions["C"].width = 20
    output = io.BytesIO()
    workbook.save(output)
    return Response(content=output.getvalue(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=multazim-executive-report.xlsx"})


@app.get("/v1/reports/executive.pdf")
def executive_report_pdf(user: Annotated[UserContext, Depends(user_context)]):
    summary = dashboard(user)
    output = io.BytesIO()
    pdf = Canvas(output, pagesize=A4)
    width, height = A4
    pdf.setFillColor(HexColor("#064e3b"))
    pdf.rect(0, height - 110, width, 110, fill=1, stroke=0)
    pdf.setFillColor(HexColor("#ffffff"))
    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(42, height - 55, "Multazim Executive Compliance Report")
    pdf.setFont("Helvetica", 9)
    pdf.drawString(42, height - 78, "Decision-support report — not a regulator score or certification")
    pdf.setFillColor(HexColor("#111827"))
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(42, height - 150, f"Overall estimated score: {summary.overall_score}%")
    pdf.drawString(300, height - 150, f"Evidence readiness: {summary.evidence_readiness}%")
    y = height - 195
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(42, y, "Framework")
    pdf.drawString(350, y, "Version")
    pdf.drawString(450, y, "Score")
    pdf.setFont("Helvetica", 10)
    for framework in summary.framework_scores:
        y -= 26
        pdf.drawString(42, y, framework.name_en)
        pdf.drawString(350, y, framework.version)
        pdf.drawString(450, y, f"{framework.score}%")
    y -= 42
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(42, y, "Priority corrective actions")
    pdf.setFont("Helvetica", 9)
    for action in summary.actions[:5]:
        y -= 22
        pdf.drawString(42, y, action.title[:62])
        pdf.drawRightString(width - 42, y, f"{action.priority} | {action.due_date.isoformat()}")
    pdf.setFont("Helvetica", 8)
    pdf.setFillColor(HexColor("#6b7280"))
    pdf.drawString(42, 38, f"Generated {datetime.now(timezone.utc).isoformat()} | Organization {user.organization_id}")
    pdf.save()
    return Response(content=output.getvalue(), media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=multazim-executive-report.pdf"})


@app.get("/v1/frameworks/catalog")
def framework_catalog(
    q: Annotated[str | None, Query(max_length=120)] = None,
    regulator: Annotated[str | None, Query(max_length=40)] = None,
    verification_status: Annotated[str | None, Query(max_length=40)] = None,
):
    root = Path(__file__).resolve().parents[3] / "regulatory_catalog"
    records = []
    for path in sorted(root.rglob("*.json")):
        if path.name == "schema.json":
            continue
        item = json.loads(path.read_text(encoding="utf-8"))
        record = {
            "code": item["code"], "regulator": item["regulator"],
            "version": item["version"], "name_ar": item["name_ar"], "name_en": item["name_en"],
            "official_source": item["official_source"], "verification_status": item["status"],
            "facts": item.get("facts", {}), "controls_count": len(item.get("controls", [])),
        }
        searchable = " ".join(str(record[key]) for key in ("code", "regulator", "name_ar", "name_en", "version")).casefold()
        if q and q.casefold() not in searchable:
            continue
        if regulator and record["regulator"].casefold() != regulator.casefold():
            continue
        if verification_status and record["verification_status"].casefold() != verification_status.casefold():
            continue
        records.append(record)
    return {"count": len(records), "records": records,
        "notice": "Source metadata only; detailed control text requires licensed/official source verification."}


def load_regulatory_journeys() -> list[dict]:
    root = Path(__file__).resolve().parents[3] / "regulatory_journeys"
    return [json.loads(path.read_text(encoding="utf-8")) for path in sorted(root.rglob("*.json")) if path.name != "schema.json"]


@app.get("/v1/journeys")
def regulatory_journeys(q: Annotated[str | None, Query(max_length=120)] = None):
    records = []
    for item in load_regulatory_journeys():
        summary = {
            "code": item["code"], "business_activity": item["business_activity"], "license": item["license"],
            "authority": item["authority"], "platform": item["platform"],
            "requirements_count": len(item["requirements"]),
            "confirmed_count": sum(requirement["status"] == "CONFIRMED_REQUIREMENT" for requirement in item["requirements"]),
        }
        searchable = " ".join((item["code"], item["business_activity"]["name_ar"], item["business_activity"]["name_en"], item["authority"]["code"])).casefold()
        if not q or q.casefold() in searchable:
            records.append(summary)
    return {"count": len(records), "records": records}


@app.get("/v1/journeys/{journey_code}")
def regulatory_journey(journey_code: str):
    journey = next((item for item in load_regulatory_journeys() if item["code"].casefold() == journey_code.casefold()), None)
    if not journey:
        raise HTTPException(status_code=404, detail="Regulatory journey not found")
    return journey


@app.post("/v1/journeys/{journey_code}/readiness")
def journey_readiness(journey_code: str, payload: JourneyReadinessRequest):
    journey = regulatory_journey(journey_code)
    valid_codes = {requirement["code"] for requirement in journey["requirements"]}
    completed = set(payload.completed_requirement_codes)
    unknown = sorted(completed - valid_codes)
    if unknown:
        raise HTTPException(status_code=422, detail={"unknown_requirement_codes": unknown})
    score = sum(requirement["weight"] for requirement in journey["requirements"] if requirement["code"] in completed)
    blockers = [
        {"code": requirement["code"], "title_ar": requirement["title_ar"], "title_en": requirement["title_en"], "verification_status": requirement["status"]}
        for requirement in journey["requirements"] if requirement["code"] not in completed
    ]
    return {
        "journey_code": journey["code"], "score": score,
        "status": "ready_for_submission" if score == 100 else "in_progress" if score else "not_started",
        "completed_count": len(completed), "total_count": len(valid_codes), "blockers": blockers,
        "notice": "Readiness is decision support and does not guarantee regulator approval.",
    }


@app.post("/v1/audits/website")
def audit_website(payload: WebsiteAuditRequest):
    return {"url": str(payload.url), "status": "demo", "notice": "Automated scanning is not connected in this release."}
