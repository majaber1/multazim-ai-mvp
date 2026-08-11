export type RegulationType = 'law' | 'regulation' | 'standard' | 'guideline' | 'index' | 'framework';
export type ComplianceNature = 'mandatory' | 'recommended' | 'optional';
export type CertType = 'international_standard' | 'national_accreditation' | 'industry_certification' | 'assessment_index';
export type CertStatus = 'not_started' | 'in_progress' | 'ready' | 'certified' | 'expired' | 'revoked';
export type ImplementationStatus = 'not_implemented' | 'partial' | 'implemented' | 'not_applicable';
export type Coverage = 'direct' | 'strong' | 'partial' | 'related';
export type EvidenceType = 'policy' | 'procedure' | 'record' | 'screenshot' | 'report' | 'certificate' | 'audit_report' | 'other';

export interface RegulatoryBody {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  country: string;
}

export interface Regulation {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  regType: RegulationType;
  complianceNature: ComplianceNature;
  issuingBodyCode: string;
  parentRegulationCode?: string;
  certificationAvailable: boolean;
  officialAssessment: boolean;
  officialAccreditation: boolean;
  domains?: RegulationDomain[];
}

export interface RegulationDomain {
  code: string;
  nameEn: string;
  nameAr: string;
  controls?: RegulationControl[];
}

export interface RegulationControl {
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  complianceNature: ComplianceNature;
}

export interface Certification {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  certType: CertType;
  issuingBody: string;
  domain: string;
  provesWhat?: string;
  validityYears?: number;
  priority: number;
}

export interface RegulationCertificationMap {
  regulationCode: string;
  certificationCode: string;
  coverage: Coverage;
  notes?: string;
}

export interface MaturityModel {
  code: string;
  nameEn: string;
  nameAr: string;
  regulationCode?: string;
  levels: MaturityLevel[];
}

export interface MaturityLevel {
  level: number;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  certificationEligible: boolean;
}

export interface ComplianceProfile {
  regulation: Regulation;
  score: number;
  status: 'critical' | 'warning' | 'good' | 'excellent';
}

export interface CertificationReadiness {
  certification: Certification;
  status: CertStatus;
  readinessScore: number;
  existingEvidencePercentage: number;
  relatedRegulations: string[];
  recommendation?: string;
}

export interface MaturityAssessment {
  model: MaturityModel;
  currentLevel: number;
  targetLevel: number;
}

export interface OrganizationProfile {
  regulatoryCompliance: ComplianceProfile[];
  certifications: CertificationReadiness[];
  maturityAssessments: MaturityAssessment[];
  recommendedNextCert?: string;
  recommendedNextCertReason?: string;
}

export interface MasterCatalogEntry {
  code: string;
  nameEn: string;
  nameAr: string;
  category: 'regulation' | 'framework' | 'index' | 'certification';
  issuingBody: string;
  certificationAvailable: boolean;
  officialAccreditation: boolean;
  relatedCertification?: string;
  certificationBody?: string;
  coverage?: Coverage;
}
