export const frameworks = [
  {code:'DGA-QIYAS-2025',nameAr:'قياس التحول الرقمي',nameEn:'DGA Qiyas 2025',score:83,coverage:'95 معيارًا',level:'إلزامي',tone:'emerald'},
  {code:'NCA-ECC-2-2024',nameAr:'الضوابط الأساسية للأمن السيبراني',nameEn:'NCA ECC 2-2024',score:78,coverage:'المحتوى قيد التحقق',level:'يتطلب مراجعة',tone:'amber'},
  {code:'SDAIA-PDPL',nameAr:'نظام حماية البيانات الشخصية',nameEn:'Saudi PDPL',score:74,coverage:'النظام واللوائح',level:'إلزامي',tone:'emerald'},
  {code:'ISO-27001-2022',nameAr:'نظام إدارة أمن المعلومات',nameEn:'ISO/IEC 27001:2022',score:67,coverage:'مراجع مرخصة فقط',level:'طوعي',tone:'slate'},
];
export const actions = [
  {title:'اعتماد مراجعة الحسابات ذات الصلاحيات العالية',owner:'نورة القحطاني',due:'12 أغسطس',impact:4,status:'متأخر',risk:'حرج'},
  {title:'استكمال سجل أنشطة معالجة البيانات',owner:'فريق الخصوصية',due:'17 أغسطس',impact:2,status:'قيد التنفيذ',risk:'عالٍ'},
  {title:'توثيق اختبار استعادة النسخ الاحتياطية',owner:'إدارة التقنية',due:'25 أغسطس',impact:3,status:'مخطط',risk:'متوسط'},
];
export const universalControls = [
  {code:'UC-IAM-001',name:'إدارة الحسابات ذات الصلاحيات العالية',evidence:3,frameworks:['NCA ECC','ISO 27001','SAMA CSF','CST CRF']},
  {code:'UC-BCM-004',name:'اختبار استمرارية الأعمال والتعافي',evidence:2,frameworks:['DGA Qiyas','ISO 22301','SAMA BCM']},
  {code:'UC-PRI-002',name:'سجل أنشطة معالجة البيانات',evidence:1,frameworks:['PDPL','ISO 27701']},
];
