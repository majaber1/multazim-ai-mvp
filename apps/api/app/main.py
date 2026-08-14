from __future__ import annotations

from enum import StrEnum
from datetime import date, datetime, timezone
import csv
import io
from typing import Annotated, Literal
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, Header, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl


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


class EvidenceCreate(BaseModel):
    organization_id: UUID
    title: str = Field(min_length=2, max_length=250)
    universal_control_ids: list[str] = Field(min_length=1)
    classification: Literal["public", "internal", "confidential", "restricted"] = "internal"


class Evidence(EvidenceCreate):
    id: UUID
    state: Literal["uploaded", "under_review", "accepted", "rejected"]
    sha256: str | None = None


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


app = FastAPI(
    title="Multazim Compliance Intelligence API",
    version="0.2.0",
    description="Tenant-aware foundation API. Demo authentication uses explicit headers and must be replaced before production.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-User-Id", "X-Organization-Id", "X-Role"],
)

organizations: dict[UUID, Organization] = {}
evidence_store: dict[UUID, Evidence] = {}
DEMO_ORGANIZATION_ID = UUID("11111111-1111-4111-8111-111111111111")
organizations[DEMO_ORGANIZATION_ID] = Organization(
    id=DEMO_ORGANIZATION_ID,
    name_ar="شركة آفاق الرقمية السعودية",
    name_en="Saudi Digital Horizons Company",
    profile=OrganizationProfile(entity_type="government", sector="technology", handles_personal_data=True, uses_cloud=True),
)
action_store: dict[UUID, CorrectiveAction] = {}
audit_events: list[AuditEvent] = []
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
    return response


def user_context(
    x_user_id: Annotated[str, Header()],
    x_organization_id: Annotated[UUID, Header()],
    x_role: Annotated[Role, Header()],
) -> UserContext:
    return UserContext(user_id=x_user_id, organization_id=x_organization_id, role=x_role)


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
    return {"status": "ok", "service": "multazim-api", "version": app.version}


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
    values = list(payload.answers.values())
    score = round(sum(values) / len(values) * 100) if values else 0
    risk = "low" if score >= 80 else "medium" if score >= 55 else "high"
    return {"score": score, "risk": risk, "answered": len(values), "label": "Multazim estimated readiness score"}


@app.post("/v1/evidence", response_model=Evidence, status_code=201)
def create_evidence(payload: EvidenceCreate, user: Annotated[UserContext, Depends(require_roles(Role.ORG_ADMIN, Role.COMPLIANCE_MANAGER, Role.ASSESSOR))]):
    assert_tenant(payload.organization_id, user)
    evidence = Evidence(id=uuid4(), state="uploaded", **payload.model_dump())
    evidence_store[evidence.id] = evidence
    record_event(user, "evidence.created", "evidence", evidence.id)
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


@app.post("/v1/audits/website")
def audit_website(payload: WebsiteAuditRequest):
    return {"url": str(payload.url), "status": "demo", "notice": "Automated scanning is not connected in this release."}
