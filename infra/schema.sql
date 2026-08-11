CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CORE ENTITIES
-- ============================================================

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  name_ar text,
  sector text,
  org_type text CHECK (org_type IN ('government','semi_government','private','nonprofit')),
  annual_revenue numeric,
  employee_count int,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE regulatory_bodies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  country text DEFAULT 'SA',
  website text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- REGULATIONS & LAWS
-- ============================================================

CREATE TYPE regulation_type AS ENUM ('law','regulation','standard','guideline','index','framework');
CREATE TYPE compliance_nature AS ENUM ('mandatory','recommended','optional');

CREATE TABLE regulations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  description_en text,
  description_ar text,
  reg_type regulation_type NOT NULL,
  compliance_nature compliance_nature NOT NULL DEFAULT 'mandatory',
  issuing_body_id uuid REFERENCES regulatory_bodies(id),
  effective_date date,
  version text,
  parent_regulation_id uuid REFERENCES regulations(id),
  certification_available boolean DEFAULT false,
  official_assessment boolean DEFAULT false,
  official_accreditation boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE regulation_domains (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  regulation_id uuid NOT NULL REFERENCES regulations(id) ON DELETE CASCADE,
  code text NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  description_en text,
  sort_order int DEFAULT 0
);

CREATE TABLE regulation_controls (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id uuid NOT NULL REFERENCES regulation_domains(id) ON DELETE CASCADE,
  regulation_id uuid NOT NULL REFERENCES regulations(id) ON DELETE CASCADE,
  code text NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  description_en text,
  description_ar text,
  compliance_nature compliance_nature NOT NULL DEFAULT 'mandatory',
  sort_order int DEFAULT 0,
  UNIQUE (regulation_id, code)
);

-- ============================================================
-- CERTIFICATIONS & ACCREDITATIONS
-- ============================================================

CREATE TYPE cert_type AS ENUM ('international_standard','national_accreditation','industry_certification','assessment_index');
CREATE TYPE cert_status AS ENUM ('not_started','in_progress','ready','certified','expired','revoked');

CREATE TABLE certifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  description_en text,
  description_ar text,
  cert_type cert_type NOT NULL,
  issuing_body text NOT NULL,
  domain text NOT NULL,
  proves_what text,
  validity_years int,
  priority int DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE regulation_certification_map (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  regulation_id uuid NOT NULL REFERENCES regulations(id) ON DELETE CASCADE,
  certification_id uuid NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  coverage text CHECK (coverage IN ('direct','strong','partial','related')),
  notes text,
  UNIQUE (regulation_id, certification_id)
);

-- ============================================================
-- MATURITY MODELS
-- ============================================================

CREATE TABLE maturity_models (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  description_en text,
  regulation_id uuid REFERENCES regulations(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE maturity_levels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id uuid NOT NULL REFERENCES maturity_models(id) ON DELETE CASCADE,
  level int NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  description_en text,
  certification_eligible boolean DEFAULT false,
  UNIQUE (model_id, level)
);

-- ============================================================
-- CONTROL CROSS-MAPPING
-- ============================================================

CREATE TABLE control_mappings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_control_id uuid NOT NULL REFERENCES regulation_controls(id) ON DELETE CASCADE,
  target_control_id uuid NOT NULL REFERENCES regulation_controls(id) ON DELETE CASCADE,
  mapping_strength text CHECK (mapping_strength IN ('exact','strong','partial','related')),
  notes text,
  UNIQUE (source_control_id, target_control_id)
);

-- ============================================================
-- EVIDENCE & DOCUMENTS
-- ============================================================

CREATE TYPE evidence_type AS ENUM ('policy','procedure','record','screenshot','report','certificate','audit_report','other');
CREATE TYPE evidence_status AS ENUM ('draft','pending_review','approved','rejected','expired');

CREATE TABLE evidence (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  title_ar text,
  evidence_type evidence_type NOT NULL,
  status evidence_status NOT NULL DEFAULT 'draft',
  file_path text,
  content text,
  embedding vector(1536),
  uploaded_by text,
  approved_by text,
  valid_from date,
  valid_until date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE evidence_control_map (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id uuid NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  control_id uuid NOT NULL REFERENCES regulation_controls(id) ON DELETE CASCADE,
  coverage_percentage int DEFAULT 100 CHECK (coverage_percentage BETWEEN 0 AND 100),
  notes text,
  UNIQUE (evidence_id, control_id)
);

-- ============================================================
-- ORGANIZATION COMPLIANCE STATE
-- ============================================================

CREATE TYPE implementation_status AS ENUM ('not_implemented','partial','implemented','not_applicable');

CREATE TABLE org_control_status (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  control_id uuid NOT NULL REFERENCES regulation_controls(id) ON DELETE CASCADE,
  status implementation_status NOT NULL DEFAULT 'not_implemented',
  notes text,
  assessed_at timestamptz,
  assessed_by text,
  UNIQUE (organization_id, control_id)
);

CREATE TABLE org_compliance_scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  regulation_id uuid NOT NULL REFERENCES regulations(id) ON DELETE CASCADE,
  score int NOT NULL CHECK (score BETWEEN 0 AND 100),
  total_controls int,
  implemented_controls int,
  partial_controls int,
  not_applicable_controls int,
  assessed_at timestamptz DEFAULT now(),
  UNIQUE (organization_id, regulation_id)
);

CREATE TABLE org_certifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  certification_id uuid NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  status cert_status NOT NULL DEFAULT 'not_started',
  readiness_score int CHECK (readiness_score BETWEEN 0 AND 100),
  certificate_number text,
  issued_date date,
  expiry_date date,
  certifying_body text,
  notes text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (organization_id, certification_id)
);

CREATE TABLE org_maturity_assessments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  model_id uuid NOT NULL REFERENCES maturity_models(id) ON DELETE CASCADE,
  current_level int NOT NULL,
  target_level int,
  assessed_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE (organization_id, model_id)
);

-- ============================================================
-- ASSESSMENTS, FINDINGS, TASKS (enhanced from original)
-- ============================================================

CREATE TABLE assessments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  regulation_id uuid REFERENCES regulations(id),
  score int NOT NULL,
  risk text NOT NULL,
  assessment_type text DEFAULT 'self',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE findings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE,
  control_id uuid REFERENCES regulation_controls(id),
  title text NOT NULL,
  severity text NOT NULL,
  status text NOT NULL,
  remediation text,
  due_date date
);

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  finding_id uuid REFERENCES findings(id),
  title text NOT NULL,
  title_ar text,
  priority text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  assigned_to text,
  due_date date,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_reg_controls_regulation ON regulation_controls(regulation_id);
CREATE INDEX idx_reg_controls_domain ON regulation_controls(domain_id);
CREATE INDEX idx_evidence_org ON evidence(organization_id);
CREATE INDEX idx_evidence_control_map ON evidence_control_map(control_id);
CREATE INDEX idx_org_control_status ON org_control_status(organization_id, control_id);
CREATE INDEX idx_org_compliance_scores ON org_compliance_scores(organization_id);
CREATE INDEX idx_org_certifications ON org_certifications(organization_id);
CREATE INDEX idx_control_mappings_source ON control_mappings(source_control_id);
CREATE INDEX idx_control_mappings_target ON control_mappings(target_control_id);
