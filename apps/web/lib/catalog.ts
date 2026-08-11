import type {
  RegulatoryBody,
  Regulation,
  Certification,
  RegulationCertificationMap,
  MaturityModel,
  MasterCatalogEntry,
  ComplianceProfile,
  CertificationReadiness,
  MaturityAssessment,
  OrganizationProfile,
} from './types';

// ============================================================
// REGULATORY BODIES
// ============================================================

export const regulatoryBodies: RegulatoryBody[] = [
  { id: 'rb-nca', code: 'NCA', nameEn: 'National Cybersecurity Authority', nameAr: 'الهيئة الوطنية للأمن السيبراني', country: 'SA' },
  { id: 'rb-sdaia', code: 'SDAIA', nameEn: 'Saudi Data & AI Authority', nameAr: 'الهيئة السعودية للبيانات والذكاء الاصطناعي', country: 'SA' },
  { id: 'rb-dga', code: 'DGA', nameEn: 'Digital Government Authority', nameAr: 'هيئة الحكومة الرقمية', country: 'SA' },
  { id: 'rb-cst', code: 'CST', nameEn: 'Communications, Space & Technology Commission', nameAr: 'هيئة الاتصالات والفضاء والتقنية', country: 'SA' },
  { id: 'rb-sama', code: 'SAMA', nameEn: 'Saudi Central Bank', nameAr: 'البنك المركزي السعودي', country: 'SA' },
  { id: 'rb-iso', code: 'ISO', nameEn: 'International Organization for Standardization', nameAr: 'المنظمة الدولية للتوحيد القياسي', country: 'INT' },
  { id: 'rb-council', code: 'ROYAL', nameEn: 'Royal Decree / Council of Ministers', nameAr: 'مرسوم ملكي / مجلس الوزراء', country: 'SA' },
];

// ============================================================
// REGULATIONS & FRAMEWORKS
// ============================================================

export const regulations: Regulation[] = [
  // === NCA ===
  {
    id: 'reg-ecc', code: 'NCA-ECC', nameEn: 'Essential Cybersecurity Controls', nameAr: 'الضوابط الأساسية للأمن السيبراني',
    descriptionEn: 'Mandatory cybersecurity controls for all government and critical infrastructure entities',
    descriptionAr: 'الضوابط الأساسية للأمن السيبراني للجهات الحكومية والبنية التحتية الحيوية',
    regType: 'standard', complianceNature: 'mandatory', issuingBodyCode: 'NCA',
    certificationAvailable: false, officialAssessment: true, officialAccreditation: false,
    domains: [
      { code: 'ECC-1', nameEn: 'Cybersecurity Governance', nameAr: 'حوكمة الأمن السيبراني', controls: [
        { code: 'ECC-1-1', nameEn: 'Cybersecurity Strategy', nameAr: 'استراتيجية الأمن السيبراني', complianceNature: 'mandatory' },
        { code: 'ECC-1-2', nameEn: 'Cybersecurity Management', nameAr: 'إدارة الأمن السيبراني', complianceNature: 'mandatory' },
        { code: 'ECC-1-3', nameEn: 'Cybersecurity Policies and Procedures', nameAr: 'سياسات وإجراءات الأمن السيبراني', complianceNature: 'mandatory' },
        { code: 'ECC-1-4', nameEn: 'Cybersecurity Roles and Responsibilities', nameAr: 'أدوار ومسؤوليات الأمن السيبراني', complianceNature: 'mandatory' },
        { code: 'ECC-1-5', nameEn: 'Cybersecurity Risk Management', nameAr: 'إدارة مخاطر الأمن السيبراني', complianceNature: 'mandatory' },
        { code: 'ECC-1-6', nameEn: 'Cybersecurity in Project Management', nameAr: 'الأمن السيبراني في إدارة المشاريع', complianceNature: 'mandatory' },
        { code: 'ECC-1-7', nameEn: 'Compliance with Standards', nameAr: 'الامتثال للمعايير والتشريعات', complianceNature: 'mandatory' },
        { code: 'ECC-1-8', nameEn: 'Periodic Review and Audit', nameAr: 'المراجعة والتدقيق الدوري', complianceNature: 'mandatory' },
        { code: 'ECC-1-9', nameEn: 'Cybersecurity in HR', nameAr: 'الأمن السيبراني في الموارد البشرية', complianceNature: 'mandatory' },
        { code: 'ECC-1-10', nameEn: 'Cybersecurity Awareness and Training', nameAr: 'التوعية والتدريب في الأمن السيبراني', complianceNature: 'mandatory' },
      ]},
      { code: 'ECC-2', nameEn: 'Cybersecurity Defense', nameAr: 'تعزيز الأمن السيبراني', controls: [
        { code: 'ECC-2-1', nameEn: 'Asset Management', nameAr: 'إدارة الأصول', complianceNature: 'mandatory' },
        { code: 'ECC-2-2', nameEn: 'Identity and Access Management', nameAr: 'إدارة الهوية والوصول', complianceNature: 'mandatory' },
        { code: 'ECC-2-3', nameEn: 'Information System Protection', nameAr: 'حماية أنظمة المعلومات', complianceNature: 'mandatory' },
        { code: 'ECC-2-4', nameEn: 'Email Protection', nameAr: 'حماية البريد الإلكتروني', complianceNature: 'mandatory' },
        { code: 'ECC-2-5', nameEn: 'Network Security Management', nameAr: 'إدارة أمن الشبكات', complianceNature: 'mandatory' },
        { code: 'ECC-2-6', nameEn: 'Mobile Devices Security', nameAr: 'أمن الأجهزة المحمولة', complianceNature: 'mandatory' },
        { code: 'ECC-2-7', nameEn: 'Data Protection and Privacy', nameAr: 'حماية البيانات والخصوصية', complianceNature: 'mandatory' },
        { code: 'ECC-2-8', nameEn: 'Cryptography', nameAr: 'التشفير', complianceNature: 'mandatory' },
        { code: 'ECC-2-9', nameEn: 'Backup Management', nameAr: 'إدارة النسخ الاحتياطي', complianceNature: 'mandatory' },
        { code: 'ECC-2-10', nameEn: 'Vulnerability Management', nameAr: 'إدارة الثغرات', complianceNature: 'mandatory' },
        { code: 'ECC-2-11', nameEn: 'Penetration Testing', nameAr: 'اختبار الاختراق', complianceNature: 'mandatory' },
        { code: 'ECC-2-12', nameEn: 'Security Event Logs Management', nameAr: 'إدارة سجلات الأحداث الأمنية', complianceNature: 'mandatory' },
        { code: 'ECC-2-13', nameEn: 'Security Incident and Event Management', nameAr: 'إدارة أحداث وحوادث الأمن السيبراني', complianceNature: 'mandatory' },
        { code: 'ECC-2-14', nameEn: 'Physical Security', nameAr: 'الأمن المادي', complianceNature: 'mandatory' },
        { code: 'ECC-2-15', nameEn: 'Web Application Security', nameAr: 'أمن تطبيقات الويب', complianceNature: 'mandatory' },
      ]},
      { code: 'ECC-3', nameEn: 'Cybersecurity Resilience', nameAr: 'صمود الأمن السيبراني', controls: [
        { code: 'ECC-3-1', nameEn: 'Cybersecurity Resilience Aspects of BCP', nameAr: 'جوانب صمود الأمن السيبراني في استمرارية الأعمال', complianceNature: 'mandatory' },
        { code: 'ECC-3-2', nameEn: 'Cybersecurity Incident Response', nameAr: 'الاستجابة لحوادث الأمن السيبراني', complianceNature: 'mandatory' },
      ]},
      { code: 'ECC-4', nameEn: 'Third-Party Cybersecurity', nameAr: 'الأمن السيبراني للأطراف الخارجية', controls: [
        { code: 'ECC-4-1', nameEn: 'Third-Party and Cloud Cybersecurity', nameAr: 'الأمن السيبراني للحوسبة السحابية والأطراف الخارجية', complianceNature: 'mandatory' },
        { code: 'ECC-4-2', nameEn: 'ICS/OT Cybersecurity', nameAr: 'الأمن السيبراني لأنظمة التحكم الصناعي', complianceNature: 'mandatory' },
      ]},
    ],
  },
  {
    id: 'reg-ccc', code: 'NCA-CCC', nameEn: 'Cloud Cybersecurity Controls', nameAr: 'ضوابط الأمن السيبراني للحوسبة السحابية',
    descriptionEn: 'Cybersecurity controls specific to cloud computing services',
    regType: 'standard', complianceNature: 'mandatory', issuingBodyCode: 'NCA',
    certificationAvailable: false, officialAssessment: true, officialAccreditation: false,
  },
  {
    id: 'reg-dcc', code: 'NCA-DCC', nameEn: 'Data Cybersecurity Controls', nameAr: 'ضوابط الأمن السيبراني للبيانات',
    descriptionEn: 'Controls for data lifecycle security and protection',
    regType: 'standard', complianceNature: 'mandatory', issuingBodyCode: 'NCA',
    certificationAvailable: false, officialAssessment: true, officialAccreditation: false,
  },
  {
    id: 'reg-cscc', code: 'NCA-CSCC', nameEn: 'Critical Systems Cybersecurity Controls', nameAr: 'ضوابط الأمن السيبراني للأنظمة الحساسة',
    descriptionEn: 'Cybersecurity controls for critical national infrastructure systems',
    regType: 'standard', complianceNature: 'mandatory', issuingBodyCode: 'NCA',
    certificationAvailable: false, officialAssessment: true, officialAccreditation: false,
  },

  // === SDAIA / PDPL ===
  {
    id: 'reg-pdpl', code: 'PDPL', nameEn: 'Personal Data Protection Law', nameAr: 'نظام حماية البيانات الشخصية',
    descriptionEn: 'Saudi Arabia\'s comprehensive personal data protection law (Royal Decree M/19)',
    descriptionAr: 'نظام حماية البيانات الشخصية - المرسوم الملكي رقم م/19',
    regType: 'law', complianceNature: 'mandatory', issuingBodyCode: 'SDAIA',
    certificationAvailable: false, officialAssessment: true, officialAccreditation: false,
    domains: [
      { code: 'PDPL-1', nameEn: 'Data Collection & Processing', nameAr: 'جمع ومعالجة البيانات', controls: [
        { code: 'PDPL-1-1', nameEn: 'Lawful Basis for Processing', nameAr: 'الأساس النظامي للمعالجة', complianceNature: 'mandatory' },
        { code: 'PDPL-1-2', nameEn: 'Purpose Limitation', nameAr: 'تحديد الغرض', complianceNature: 'mandatory' },
        { code: 'PDPL-1-3', nameEn: 'Data Minimization', nameAr: 'تقليل البيانات', complianceNature: 'mandatory' },
        { code: 'PDPL-1-4', nameEn: 'Consent Management', nameAr: 'إدارة الموافقة', complianceNature: 'mandatory' },
      ]},
      { code: 'PDPL-2', nameEn: 'Data Subject Rights', nameAr: 'حقوق أصحاب البيانات', controls: [
        { code: 'PDPL-2-1', nameEn: 'Right to Access', nameAr: 'حق الوصول', complianceNature: 'mandatory' },
        { code: 'PDPL-2-2', nameEn: 'Right to Correction', nameAr: 'حق التصحيح', complianceNature: 'mandatory' },
        { code: 'PDPL-2-3', nameEn: 'Right to Deletion', nameAr: 'حق الحذف', complianceNature: 'mandatory' },
        { code: 'PDPL-2-4', nameEn: 'Right to Data Portability', nameAr: 'حق نقل البيانات', complianceNature: 'mandatory' },
      ]},
      { code: 'PDPL-3', nameEn: 'Data Transfer', nameAr: 'نقل البيانات', controls: [
        { code: 'PDPL-3-1', nameEn: 'Cross-Border Transfer Rules', nameAr: 'قواعد النقل عبر الحدود', complianceNature: 'mandatory' },
        { code: 'PDPL-3-2', nameEn: 'Transfer Safeguards', nameAr: 'ضمانات النقل', complianceNature: 'mandatory' },
      ]},
      { code: 'PDPL-4', nameEn: 'Organizational Measures', nameAr: 'الإجراءات التنظيمية', controls: [
        { code: 'PDPL-4-1', nameEn: 'Privacy Impact Assessment', nameAr: 'تقييم أثر الخصوصية', complianceNature: 'mandatory' },
        { code: 'PDPL-4-2', nameEn: 'Data Breach Notification', nameAr: 'الإبلاغ عن تسرب البيانات', complianceNature: 'mandatory' },
        { code: 'PDPL-4-3', nameEn: 'Records of Processing', nameAr: 'سجلات المعالجة', complianceNature: 'mandatory' },
        { code: 'PDPL-4-4', nameEn: 'Data Protection Officer', nameAr: 'مسؤول حماية البيانات', complianceNature: 'recommended' },
      ]},
    ],
  },
  {
    id: 'reg-pdpl-impl', code: 'PDPL-IR', nameEn: 'PDPL Implementing Regulations', nameAr: 'اللائحة التنفيذية لنظام حماية البيانات الشخصية',
    regType: 'regulation', complianceNature: 'mandatory', issuingBodyCode: 'SDAIA', parentRegulationCode: 'PDPL',
    certificationAvailable: false, officialAssessment: true, officialAccreditation: false,
  },
  {
    id: 'reg-pdtl', code: 'PDTL', nameEn: 'Personal Data Transfer Regulation', nameAr: 'لائحة نقل البيانات الشخصية',
    descriptionEn: 'Rules governing cross-border transfer of personal data',
    regType: 'regulation', complianceNature: 'mandatory', issuingBodyCode: 'SDAIA', parentRegulationCode: 'PDPL',
    certificationAvailable: false, officialAssessment: true, officialAccreditation: false,
  },
  {
    id: 'reg-ndmo-dg', code: 'NDMO-DG', nameEn: 'National Data Governance Interim Regulations', nameAr: 'الأحكام المؤقتة لحوكمة البيانات الوطنية',
    regType: 'regulation', complianceNature: 'mandatory', issuingBodyCode: 'SDAIA',
    certificationAvailable: false, officialAssessment: false, officialAccreditation: false,
  },

  // === DGA ===
  {
    id: 'reg-nora', code: 'DGA-NORA', nameEn: 'National Reference Architecture (NORA)', nameAr: 'البنية المرجعية الوطنية',
    descriptionEn: 'National reference architecture framework for government digital transformation',
    regType: 'framework', complianceNature: 'mandatory', issuingBodyCode: 'DGA',
    certificationAvailable: false, officialAssessment: false, officialAccreditation: true,
  },
  {
    id: 'reg-qiyas', code: 'DGA-QIYAS', nameEn: 'Qiyas - Digital Government Index', nameAr: 'قياس - مؤشر الحكومة الرقمية',
    descriptionEn: 'DGA index measuring digital government maturity and service quality',
    descriptionAr: 'مؤشر الحكومة الرقمية الذي يقيس نضج الحكومة الرقمية وجودة الخدمات',
    regType: 'index', complianceNature: 'mandatory', issuingBodyCode: 'DGA',
    certificationAvailable: false, officialAssessment: true, officialAccreditation: false,
  },

  // === SDAIA NDI ===
  {
    id: 'reg-ndi', code: 'SDAIA-NDI', nameEn: 'National Data Index (Nadee)', nameAr: 'مؤشر البيانات الوطني (نضيء)',
    descriptionEn: 'National index measuring data maturity across government entities',
    regType: 'index', complianceNature: 'mandatory', issuingBodyCode: 'SDAIA',
    certificationAvailable: false, officialAssessment: true, officialAccreditation: false,
  },

  // === AI Governance ===
  {
    id: 'reg-aige', code: 'SDAIA-AIGE', nameEn: 'AI Governance & Ethics Framework', nameAr: 'إطار حوكمة وأخلاقيات الذكاء الاصطناعي',
    descriptionEn: 'Saudi framework for responsible AI governance and ethics',
    regType: 'framework', complianceNature: 'recommended', issuingBodyCode: 'SDAIA',
    certificationAvailable: false, officialAssessment: false, officialAccreditation: false,
  },
];

// ============================================================
// CERTIFICATIONS & ACCREDITATIONS
// ============================================================

export const certifications: Certification[] = [
  {
    id: 'cert-27001', code: 'ISO-27001', nameEn: 'ISO/IEC 27001:2022', nameAr: 'آيزو 27001:2022',
    descriptionEn: 'Information Security Management System (ISMS)',
    certType: 'international_standard', issuingBody: 'Accredited Certification Body', domain: 'Information Security',
    provesWhat: 'Existence of an integrated ISMS managing information security risks',
    validityYears: 3, priority: 5,
  },
  {
    id: 'cert-27701', code: 'ISO-27701', nameEn: 'ISO/IEC 27701:2025', nameAr: 'آيزو 27701:2025',
    descriptionEn: 'Privacy Information Management System (PIMS)',
    certType: 'international_standard', issuingBody: 'Accredited Certification Body', domain: 'Privacy',
    provesWhat: 'Privacy information management maturity and accountability for PII controllers/processors',
    validityYears: 3, priority: 5,
  },
  {
    id: 'cert-22301', code: 'ISO-22301', nameEn: 'ISO 22301:2019', nameAr: 'آيزو 22301',
    descriptionEn: 'Business Continuity Management System (BCMS)',
    certType: 'international_standard', issuingBody: 'Accredited Certification Body', domain: 'Business Continuity',
    provesWhat: 'Organizational resilience and business continuity capability',
    validityYears: 3, priority: 5,
  },
  {
    id: 'cert-ea', code: 'DGA-EA-CERT', nameEn: 'National EA Accreditation Certificate', nameAr: 'شهادة اعتماد البنية المؤسسية الوطنية',
    descriptionEn: 'DGA national accreditation for entities achieving SEAM Level 3+ in enterprise architecture',
    certType: 'national_accreditation', issuingBody: 'DGA', domain: 'Enterprise Architecture',
    provesWhat: 'Maturity in applying enterprise architecture per SEAM framework',
    priority: 5,
  },
  {
    id: 'cert-37301', code: 'ISO-37301', nameEn: 'ISO 37301:2021', nameAr: 'آيزو 37301',
    descriptionEn: 'Compliance Management System',
    certType: 'international_standard', issuingBody: 'Accredited Certification Body', domain: 'Compliance',
    provesWhat: 'Institutional compliance management maturity',
    validityYears: 3, priority: 4,
  },
  {
    id: 'cert-42001', code: 'ISO-42001', nameEn: 'ISO/IEC 42001:2023', nameAr: 'آيزو 42001:2023',
    descriptionEn: 'Artificial Intelligence Management System (AIMS)',
    certType: 'international_standard', issuingBody: 'Accredited Certification Body', domain: 'AI Governance',
    provesWhat: 'Responsible AI governance and risk management',
    validityYears: 3, priority: 4,
  },
  {
    id: 'cert-20000', code: 'ISO-20000', nameEn: 'ISO/IEC 20000-1:2018', nameAr: 'آيزو 20000-1',
    descriptionEn: 'IT Service Management System (SMS)',
    certType: 'international_standard', issuingBody: 'Accredited Certification Body', domain: 'IT Service Management',
    provesWhat: 'IT service management capability and ITSM maturity',
    validityYears: 3, priority: 4,
  },
  {
    id: 'cert-9001', code: 'ISO-9001', nameEn: 'ISO 9001:2015', nameAr: 'آيزو 9001',
    descriptionEn: 'Quality Management System (QMS)',
    certType: 'international_standard', issuingBody: 'Accredited Certification Body', domain: 'Quality',
    provesWhat: 'Quality management processes and continuous improvement',
    validityYears: 3, priority: 3,
  },
  {
    id: 'cert-37001', code: 'ISO-37001', nameEn: 'ISO 37001:2016', nameAr: 'آيزو 37001',
    descriptionEn: 'Anti-Bribery Management System',
    certType: 'international_standard', issuingBody: 'Accredited Certification Body', domain: 'Governance / Integrity',
    provesWhat: 'Anti-bribery and anti-corruption management',
    validityYears: 3, priority: 3,
  },
];

// ============================================================
// REGULATION <-> CERTIFICATION MAPPING
// ============================================================

export const regulationCertificationMappings: RegulationCertificationMap[] = [
  { regulationCode: 'NCA-ECC', certificationCode: 'ISO-27001', coverage: 'partial', notes: 'ISO 27001 covers many ECC controls but is not a substitute for NCA compliance assessment' },
  { regulationCode: 'NCA-CCC', certificationCode: 'ISO-27001', coverage: 'partial', notes: 'Partial coverage; cloud-specific controls may need additional standards' },
  { regulationCode: 'NCA-DCC', certificationCode: 'ISO-27001', coverage: 'partial', notes: 'Data security controls overlap but DCC has Saudi-specific requirements' },
  { regulationCode: 'PDPL', certificationCode: 'ISO-27701', coverage: 'strong', notes: 'ISO 27701 provides strong evidence for PDPL compliance but does not replace legal compliance' },
  { regulationCode: 'PDTL', certificationCode: 'ISO-27701', coverage: 'partial', notes: 'Covers privacy management but not specific Saudi transfer mechanisms' },
  { regulationCode: 'DGA-NORA', certificationCode: 'DGA-EA-CERT', coverage: 'direct', notes: 'National EA Accreditation Certificate is the direct certification for NORA/SEAM' },
  { regulationCode: 'NCA-ECC', certificationCode: 'ISO-22301', coverage: 'partial', notes: 'Supports ECC-3 Cybersecurity Resilience domain' },
  { regulationCode: 'SDAIA-AIGE', certificationCode: 'ISO-42001', coverage: 'strong', notes: 'ISO 42001 provides strong framework alignment for AI governance' },
];

// ============================================================
// MATURITY MODELS
// ============================================================

export const maturityModels: MaturityModel[] = [
  {
    code: 'SEAM', nameEn: 'Saudi Enterprise Architecture Maturity', nameAr: 'نموذج نضج البنية المؤسسية السعودي',
    regulationCode: 'DGA-NORA',
    levels: [
      { level: 1, nameEn: 'Initial', nameAr: 'أولي', descriptionEn: 'No formal EA processes or governance', certificationEligible: false },
      { level: 2, nameEn: 'Development', nameAr: 'تطوير', descriptionEn: 'EA concepts being introduced, initial governance', certificationEligible: false },
      { level: 3, nameEn: 'Functioning', nameAr: 'فاعل', descriptionEn: 'Established EA framework with active governance', certificationEligible: true },
      { level: 4, nameEn: 'Managed', nameAr: 'مُدار', descriptionEn: 'EA integrated into decision-making, measured outcomes', certificationEligible: true },
      { level: 5, nameEn: 'Optimized', nameAr: 'مُحسّن', descriptionEn: 'Continuous improvement, innovation-driven EA', certificationEligible: true },
    ],
  },
];

// ============================================================
// MASTER CATALOG (flat view for UI)
// ============================================================

export const masterCatalog: MasterCatalogEntry[] = [
  { code: 'NCA-ECC', nameEn: 'Essential Cybersecurity Controls', nameAr: 'الضوابط الأساسية للأمن السيبراني', category: 'regulation', issuingBody: 'NCA', certificationAvailable: false, officialAccreditation: false, relatedCertification: 'ISO 27001', certificationBody: 'Accredited CB', coverage: 'partial' },
  { code: 'NCA-CCC', nameEn: 'Cloud Cybersecurity Controls', nameAr: 'ضوابط الحوسبة السحابية', category: 'regulation', issuingBody: 'NCA', certificationAvailable: false, officialAccreditation: false, relatedCertification: 'ISO 27001 + Cloud Standards', certificationBody: 'Accredited CB', coverage: 'partial' },
  { code: 'NCA-DCC', nameEn: 'Data Cybersecurity Controls', nameAr: 'ضوابط أمن البيانات', category: 'regulation', issuingBody: 'NCA', certificationAvailable: false, officialAccreditation: false, relatedCertification: 'ISO 27001', certificationBody: 'Accredited CB', coverage: 'partial' },
  { code: 'PDPL', nameEn: 'Personal Data Protection Law', nameAr: 'نظام حماية البيانات الشخصية', category: 'regulation', issuingBody: 'SDAIA', certificationAvailable: false, officialAccreditation: false, relatedCertification: 'ISO 27701', certificationBody: 'Accredited CB', coverage: 'strong' },
  { code: 'PDTL', nameEn: 'Personal Data Transfer Regulation', nameAr: 'لائحة نقل البيانات الشخصية', category: 'regulation', issuingBody: 'SDAIA', certificationAvailable: false, officialAccreditation: false, relatedCertification: 'ISO 27701', certificationBody: 'Accredited CB', coverage: 'partial' },
  { code: 'DGA-NORA', nameEn: 'National Reference Architecture', nameAr: 'البنية المرجعية الوطنية', category: 'framework', issuingBody: 'DGA', certificationAvailable: false, officialAccreditation: true, relatedCertification: 'National EA Accreditation', certificationBody: 'DGA', coverage: 'direct' },
  { code: 'DGA-QIYAS', nameEn: 'Qiyas - Digital Government Index', nameAr: 'قياس', category: 'index', issuingBody: 'DGA', certificationAvailable: false, officialAccreditation: false },
  { code: 'SDAIA-NDI', nameEn: 'National Data Index (Nadee)', nameAr: 'نضيء', category: 'index', issuingBody: 'SDAIA', certificationAvailable: false, officialAccreditation: false },
  { code: 'ISO-27001', nameEn: 'ISO/IEC 27001:2022', nameAr: 'آيزو 27001', category: 'certification', issuingBody: 'ISO', certificationAvailable: true, officialAccreditation: false, relatedCertification: 'ISO 27001 Certificate', certificationBody: 'Accredited CB', coverage: 'direct' },
  { code: 'ISO-27701', nameEn: 'ISO/IEC 27701:2025', nameAr: 'آيزو 27701', category: 'certification', issuingBody: 'ISO', certificationAvailable: true, officialAccreditation: false, relatedCertification: 'ISO 27701 Certificate', certificationBody: 'Accredited CB', coverage: 'direct' },
  { code: 'ISO-22301', nameEn: 'ISO 22301:2019', nameAr: 'آيزو 22301', category: 'certification', issuingBody: 'ISO', certificationAvailable: true, officialAccreditation: false, relatedCertification: 'ISO 22301 Certificate', certificationBody: 'Accredited CB', coverage: 'direct' },
  { code: 'ISO-37301', nameEn: 'ISO 37301:2021', nameAr: 'آيزو 37301', category: 'certification', issuingBody: 'ISO', certificationAvailable: true, officialAccreditation: false, relatedCertification: 'ISO 37301 Certificate', certificationBody: 'Accredited CB', coverage: 'direct' },
  { code: 'ISO-42001', nameEn: 'ISO/IEC 42001:2023', nameAr: 'آيزو 42001', category: 'certification', issuingBody: 'ISO', certificationAvailable: true, officialAccreditation: false, relatedCertification: 'ISO 42001 Certificate', certificationBody: 'Accredited CB', coverage: 'direct' },
];

// ============================================================
// DEMO ORGANIZATION DATA
// ============================================================

export function getDemoOrganizationProfile(): OrganizationProfile {
  const regulatoryCompliance: ComplianceProfile[] = [
    { regulation: regulations.find(r => r.code === 'NCA-ECC')!, score: 82, status: 'warning' },
    { regulation: regulations.find(r => r.code === 'PDPL')!, score: 91, status: 'excellent' },
    { regulation: regulations.find(r => r.code === 'DGA-QIYAS')!, score: 84, status: 'good' },
    { regulation: regulations.find(r => r.code === 'SDAIA-NDI')!, score: 78, status: 'warning' },
    { regulation: regulations.find(r => r.code === 'DGA-NORA')!, score: 87, status: 'good' },
    { regulation: regulations.find(r => r.code === 'NCA-DCC')!, score: 76, status: 'warning' },
    { regulation: regulations.find(r => r.code === 'NCA-CCC')!, score: 69, status: 'warning' },
  ];

  const certs: CertificationReadiness[] = [
    {
      certification: certifications.find(c => c.code === 'ISO-27001')!, status: 'certified', readinessScore: 100,
      existingEvidencePercentage: 100, relatedRegulations: ['NCA-ECC', 'NCA-CCC', 'NCA-DCC'],
    },
    {
      certification: certifications.find(c => c.code === 'ISO-22301')!, status: 'ready', readinessScore: 86,
      existingEvidencePercentage: 86, relatedRegulations: ['NCA-ECC'],
    },
    {
      certification: certifications.find(c => c.code === 'ISO-27701')!, status: 'in_progress', readinessScore: 72,
      existingEvidencePercentage: 81, relatedRegulations: ['PDPL', 'PDTL', 'NCA-DCC'],
      recommendation: 'الشهادة التالية الموصى بها — 81% من الأدلة المطلوبة موجودة من PDPL + NCA DCC + ISO 27001',
    },
    {
      certification: certifications.find(c => c.code === 'ISO-42001')!, status: 'not_started', readinessScore: 54,
      existingEvidencePercentage: 54, relatedRegulations: ['SDAIA-AIGE'],
    },
    {
      certification: certifications.find(c => c.code === 'ISO-37301')!, status: 'not_started', readinessScore: 61,
      existingEvidencePercentage: 61, relatedRegulations: [],
    },
    {
      certification: certifications.find(c => c.code === 'DGA-EA-CERT')!, status: 'ready', readinessScore: 90,
      existingEvidencePercentage: 90, relatedRegulations: ['DGA-NORA'],
    },
  ];

  const maturityAssessments: MaturityAssessment[] = [
    { model: maturityModels[0], currentLevel: 3, targetLevel: 4 },
  ];

  return {
    regulatoryCompliance,
    certifications: certs,
    maturityAssessments,
    recommendedNextCert: 'ISO-27701',
    recommendedNextCertReason: '81% من الأدلة المطلوبة موجودة أصلاً من PDPL + NCA DCC + ISO 27001',
  };
}
