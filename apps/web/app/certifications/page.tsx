'use client';

import { AppShell } from '@/components/AppShell';
import { certifications, regulationCertificationMappings, regulations } from '@/lib/catalog';

const priorityStars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

const typeLabels: Record<string, { label: string; bg: string; text: string }> = {
  international_standard: { label: 'معيار دولي', bg: 'bg-blue-100', text: 'text-blue-700' },
  national_accreditation: { label: 'اعتماد وطني', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  industry_certification: { label: 'شهادة صناعية', bg: 'bg-purple-100', text: 'text-purple-700' },
  assessment_index: { label: 'مؤشر تقييم', bg: 'bg-amber-100', text: 'text-amber-700' },
};

const coverageLabels: Record<string, { label: string; color: string }> = {
  direct: { label: 'مباشر', color: 'text-emerald-600' },
  strong: { label: 'قوي', color: 'text-blue-600' },
  partial: { label: 'جزئي', color: 'text-amber-600' },
  related: { label: 'ذو صلة', color: 'text-slate-500' },
};

export default function CertificationsPage() {
  return (
    <AppShell title="دليل الشهادات والاعتمادات">
      <p className="text-sm text-slate-500 mb-6">
        جميع الشهادات والاعتمادات المتاحة للجهات الحكومية والمنشآت في المملكة العربية السعودية
      </p>

      <div className="space-y-4">
        {certifications
          .sort((a, b) => b.priority - a.priority)
          .map((cert) => {
            const typeConfig = typeLabels[cert.certType] || typeLabels.international_standard;
            const relatedMappings = regulationCertificationMappings.filter(
              m => m.certificationCode === cert.code
            );

            return (
              <div key={cert.code} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge ${typeConfig.bg} ${typeConfig.text}`}>{typeConfig.label}</span>
                      <span className="text-xs text-amber-500 tracking-wider">{priorityStars(cert.priority)}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-black">{cert.nameAr}</h3>
                    <p className="text-sm text-slate-500">{cert.nameEn}</p>
                    {cert.descriptionEn && (
                      <p className="mt-2 text-sm text-slate-600 leading-6">{cert.descriptionEn}</p>
                    )}
                  </div>
                  <div className="mr-4 text-left shrink-0">
                    <div className="text-xs text-slate-400">جهة المنح</div>
                    <div className="text-sm font-bold mt-0.5">{cert.issuingBody}</div>
                    {cert.validityYears && (
                      <>
                        <div className="text-xs text-slate-400 mt-2">مدة الصلاحية</div>
                        <div className="text-sm font-bold mt-0.5">{cert.validityYears} سنوات</div>
                      </>
                    )}
                  </div>
                </div>

                {cert.provesWhat && (
                  <div className="mt-3 rounded-xl bg-slate-50 px-4 py-2.5 text-xs text-slate-600 leading-5">
                    <span className="font-bold text-slate-700">ماذا تثبت: </span>{cert.provesWhat}
                  </div>
                )}

                {relatedMappings.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 mb-2">المتطلبات التنظيمية ذات الصلة</p>
                    <div className="flex gap-2 flex-wrap">
                      {relatedMappings.map((mapping) => {
                        const reg = regulations.find(r => r.code === mapping.regulationCode);
                        const cov = coverageLabels[mapping.coverage || 'related'];
                        return (
                          <div key={mapping.regulationCode} className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5">
                            <span className="text-xs font-bold">{reg?.nameAr || mapping.regulationCode}</span>
                            <span className={`text-[10px] font-bold ${cov.color}`}>({cov.label})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Important Note */}
      <div className="mt-8 card p-6 border-amber-200 bg-amber-50/50">
        <h3 className="font-black text-sm text-amber-800">ملاحظة مهمة</h3>
        <p className="mt-2 text-sm text-amber-700 leading-6">
          الحصول على شهادة دولية (مثل ISO 27001) لا يعني تلقائياً الامتثال الكامل للمتطلبات التنظيمية المحلية (مثل NCA ECC).
          قد تكون الجهة حاصلة على ISO 27001 ومع ذلك لديها فجوات في ECC. العلاقة بين الشهادات والمتطلبات التنظيمية
          هي علاقة دعم وتكامل وليست بديلة.
        </p>
      </div>
    </AppShell>
  );
}
