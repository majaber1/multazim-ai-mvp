CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE framework_status AS ENUM ('draft','active','superseded','deprecated','content_pending_verification');
CREATE TYPE applicability_class AS ENUM ('mandatory','likely_applicable','conditional','voluntary','not_applicable','needs_review');
CREATE TYPE assessment_status AS ENUM ('compliant','partially_compliant','non_compliant','not_applicable','not_assessed');

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name_ar text NOT NULL, name_en text NOT NULL,
  entity_type text NOT NULL, sector text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE organization_profiles (
  organization_id uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  attributes jsonb NOT NULL DEFAULT '{}', updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL, display_name text NOT NULL, role text NOT NULL, active boolean NOT NULL DEFAULT true,
  UNIQUE (organization_id, email)
);
CREATE TABLE regulators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, name_ar text NOT NULL,
  name_en text NOT NULL, country_code char(2) NOT NULL DEFAULT 'SA', official_url text NOT NULL
);
CREATE TABLE frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), regulator_id uuid REFERENCES regulators(id), code text UNIQUE NOT NULL,
  name_ar text NOT NULL, name_en text NOT NULL, category text NOT NULL, sector text[], default_applicability applicability_class NOT NULL
);
CREATE TABLE framework_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), framework_id uuid NOT NULL REFERENCES frameworks(id), version text NOT NULL,
  issue_date date, effective_date date, superseded_date date, status framework_status NOT NULL,
  source_url text NOT NULL, source_document text, last_verified_at timestamptz,
  UNIQUE (framework_id, version)
);
CREATE TABLE domains (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), framework_version_id uuid NOT NULL REFERENCES framework_versions(id), parent_id uuid REFERENCES domains(id), code text NOT NULL, name_ar text NOT NULL, name_en text NOT NULL);
CREATE TABLE controls (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), domain_id uuid REFERENCES domains(id), reference text NOT NULL, name_ar text, name_en text, requirement_text_ar text, requirement_text_en text, content_verified boolean NOT NULL DEFAULT false);
CREATE TABLE evidence_requirements (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), control_id uuid NOT NULL REFERENCES controls(id), description_ar text, description_en text, required boolean NOT NULL DEFAULT true);
CREATE TABLE applicability_rules (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), framework_version_id uuid NOT NULL REFERENCES framework_versions(id), expression jsonb NOT NULL, outcome applicability_class NOT NULL, reason_ar text NOT NULL, reason_en text NOT NULL, priority int NOT NULL DEFAULT 100);
CREATE TABLE organization_applicability (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, framework_version_id uuid NOT NULL REFERENCES framework_versions(id), classification applicability_class NOT NULL, reason_ar text NOT NULL, reason_en text NOT NULL, decided_by uuid REFERENCES users(id), decided_at timestamptz NOT NULL DEFAULT now(), UNIQUE (organization_id, framework_version_id));
CREATE TABLE universal_controls (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, name_ar text NOT NULL, name_en text NOT NULL, description_ar text, description_en text);
CREATE TABLE control_mappings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), universal_control_id uuid NOT NULL REFERENCES universal_controls(id), control_id uuid NOT NULL REFERENCES controls(id), confidence text NOT NULL CHECK (confidence IN ('authoritative','expert_reviewed','ai_suggested','unverified')), approved_by uuid REFERENCES users(id), UNIQUE (universal_control_id, control_id));
CREATE TABLE assessments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, framework_version_id uuid NOT NULL REFERENCES framework_versions(id), title text NOT NULL, state text NOT NULL, started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz);
CREATE TABLE assessment_responses (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE, control_id uuid NOT NULL REFERENCES controls(id), status assessment_status NOT NULL DEFAULT 'not_assessed', score numeric, maturity numeric, comments text, owner_id uuid REFERENCES users(id), reviewer_id uuid REFERENCES users(id), approved_at timestamptz, UNIQUE (assessment_id, control_id));
CREATE TABLE evidence (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, title text NOT NULL, evidence_type text NOT NULL, state text NOT NULL, object_key text NOT NULL, sha256 text NOT NULL, classification text NOT NULL, owner_id uuid REFERENCES users(id), issue_date date, expiry_date date, version text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE evidence_control_links (evidence_id uuid REFERENCES evidence(id) ON DELETE CASCADE, universal_control_id uuid REFERENCES universal_controls(id) ON DELETE CASCADE, PRIMARY KEY (evidence_id, universal_control_id));
CREATE TABLE evidence_evaluations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), evidence_id uuid NOT NULL REFERENCES evidence(id) ON DELETE CASCADE, control_id uuid NOT NULL REFERENCES controls(id), provider text, model text, result text NOT NULL, confidence numeric, citations jsonb NOT NULL DEFAULT '[]', missing_items jsonb NOT NULL DEFAULT '[]', human_decision text, reviewer_id uuid REFERENCES users(id), reviewed_at timestamptz);
CREATE TABLE risks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, title text NOT NULL, likelihood int NOT NULL, impact int NOT NULL, status text NOT NULL, owner_id uuid REFERENCES users(id));
CREATE TABLE gaps (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, assessment_response_id uuid REFERENCES assessment_responses(id), risk_id uuid REFERENCES risks(id), current_state text, target_state text, description text NOT NULL, severity text NOT NULL, status text NOT NULL);
CREATE TABLE corrective_actions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, gap_id uuid REFERENCES gaps(id), title text NOT NULL, owner_id uuid REFERENCES users(id), priority text NOT NULL, status text NOT NULL, due_date date, effort int, cost int);
CREATE TABLE audits (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, framework_version_id uuid NOT NULL REFERENCES framework_versions(id), period_start date, period_end date, state text NOT NULL, external_auditor_id uuid REFERENCES users(id));
CREATE TABLE compliance_snapshots (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, framework_version_id uuid REFERENCES framework_versions(id), score numeric NOT NULL, evidence_readiness numeric NOT NULL, risk_exposure numeric NOT NULL, captured_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE audit_log (id bigserial PRIMARY KEY, organization_id uuid REFERENCES organizations(id), actor_id uuid REFERENCES users(id), action text NOT NULL, resource_type text NOT NULL, resource_id uuid, metadata jsonb NOT NULL DEFAULT '{}', occurred_at timestamptz NOT NULL DEFAULT now());

CREATE TYPE requirement_verification_status AS ENUM ('confirmed_requirement','suggested_requirement','requires_expert_verification');
CREATE TYPE journey_readiness_status AS ENUM ('not_started','in_progress','blocked','pending_review','ready_for_submission');
CREATE TABLE business_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, sector text NOT NULL,
  name_ar text NOT NULL, name_en text NOT NULL, description_ar text, description_en text
);
CREATE TABLE licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, regulator_id uuid NOT NULL REFERENCES regulators(id),
  name_ar text NOT NULL, name_en text NOT NULL, license_model text NOT NULL, official_source text NOT NULL,
  verification_status requirement_verification_status NOT NULL
);
CREATE TABLE regulatory_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL,
  business_activity_id uuid NOT NULL REFERENCES business_activities(id), license_id uuid NOT NULL REFERENCES licenses(id),
  platform_name_ar text, platform_name_en text, platform_url text, version text NOT NULL,
  status framework_status NOT NULL DEFAULT 'draft'
);
CREATE TABLE journey_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), journey_id uuid NOT NULL REFERENCES regulatory_journeys(id) ON DELETE CASCADE,
  code text NOT NULL, requirement_type text NOT NULL, title_ar text NOT NULL, title_en text NOT NULL,
  description_ar text, description_en text, source_url text NOT NULL, source_reference text NOT NULL,
  verification_status requirement_verification_status NOT NULL, weight numeric NOT NULL CHECK (weight > 0 AND weight <= 100),
  UNIQUE (journey_id, code)
);
CREATE TABLE organization_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  journey_id uuid NOT NULL REFERENCES regulatory_journeys(id), owner_id uuid REFERENCES users(id),
  readiness_status journey_readiness_status NOT NULL DEFAULT 'not_started', readiness_score numeric NOT NULL DEFAULT 0,
  blockers jsonb NOT NULL DEFAULT '[]', started_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, journey_id)
);
CREATE TABLE organization_journey_requirements (
  organization_journey_id uuid NOT NULL REFERENCES organization_journeys(id) ON DELETE CASCADE,
  journey_requirement_id uuid NOT NULL REFERENCES journey_requirements(id), completed boolean NOT NULL DEFAULT false,
  owner_id uuid REFERENCES users(id), evidence_ids uuid[] NOT NULL DEFAULT '{}', notes text, reviewed_by uuid REFERENCES users(id), reviewed_at timestamptz,
  PRIMARY KEY (organization_journey_id, journey_requirement_id)
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_journey_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_users ON users USING (organization_id = nullif(current_setting('app.organization_id', true), '')::uuid);
CREATE POLICY tenant_assessments ON assessments USING (organization_id = nullif(current_setting('app.organization_id', true), '')::uuid);
CREATE POLICY tenant_evidence ON evidence USING (organization_id = nullif(current_setting('app.organization_id', true), '')::uuid);
CREATE POLICY tenant_gaps ON gaps USING (organization_id = nullif(current_setting('app.organization_id', true), '')::uuid);
CREATE POLICY tenant_risks ON risks USING (organization_id = nullif(current_setting('app.organization_id', true), '')::uuid);
CREATE POLICY tenant_actions ON corrective_actions USING (organization_id = nullif(current_setting('app.organization_id', true), '')::uuid);
CREATE POLICY tenant_audits ON audits USING (organization_id = nullif(current_setting('app.organization_id', true), '')::uuid);
CREATE POLICY tenant_organization_journeys ON organization_journeys USING (organization_id = nullif(current_setting('app.organization_id', true), '')::uuid);
CREATE POLICY tenant_organization_journey_requirements ON organization_journey_requirements USING (
  EXISTS (SELECT 1 FROM organization_journeys journey WHERE journey.id = organization_journey_id AND journey.organization_id = nullif(current_setting('app.organization_id', true), '')::uuid)
);
