'use client';

import { AppShell } from '@/components/AppShell';
import { getDemoOrganizationProfile, certifications } from '@/lib/catalog';

const statusColors = {
  excellent: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-500', label: 'ممتاز' },
  good: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500', label: 'جيد' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-500', label: 'تحسين' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500', label: 'حرج' },
};

const certStatusConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  certified: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'معتمد', icon: '🏆' },
  ready: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'جاهز', icon: '✓' },
  in_progress: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'جاري', icon: '⟳' },
  not_started: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'لم يبدأ', icon: '—' },
};

export default function CompliancePage() {
  const profile = getDemoOrganizationProfile();

  const avgScore = Math.round(
    profile.regulatoryCompliance.reduce((sum, c) => sum + c.score, 0) / profile.regulatoryCompliance.length
  );

  const certifiedCount = profile.certifications.filter(c => c.status === 'certified').length;
  const readyCount = profile.certifications.filter(c => c.status === 'ready').length;

  return (
    <AppShell title="ملف الامتثال والشهادات">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm text-slate-500">متوسط الامتثال التنظيمي</p>
          <div className="mt-2 text-4xl font-black">{avgScore}%</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${avgScore}%` }} />
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">الشهادات الحاصل عليها</p>
          <div className="mt-2 text-4xl font-black">{certifiedCount}</div>
          <p className="mt-2 text-sm text-emerald-600 font-bold">{readyCount} جاهزة للحصول</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">مستوى النضج (SEAM)</p>
          <div className="mt-2 text-4xl font-black">
            المستوى {profile.maturityAssessments[0]?.currentLevel}
          </div>
          <p className="mt-2 text-sm text-blue-600 font-bold">
            {profile.maturityAssessments[0]?.model.levels.find(
              l => l.level === profile.maturityAssessments[0]?.currentLevel
            )?.nameAr}
          </p>
        </div>
        <div className="card p-5 border-2 border-emerald-200 bg-emerald-50/50">
          <p className="text-sm text-emerald-700 font-bold">الشهادة التالية الموصى بها</p>
          <div className="mt-2 text-lg font-black text-emerald-800">
            {certifications.find(c => c.code === profile.recommendedNextCert)?.nameAr || profile.recommendedNextCert}
          </div>
          <p className="mt-2 text-xs text-emerald-600 leading-5">{profile.recommendedNextCertReason}</p>
        </div>
      </div>

      {/* Regulatory Compliance Section */}
      <div className="mt-8">
        <h2 className="text-xl font-black">الامتثال التنظيمي السعودي</h2>
        <p className="mt-1 text-sm text-slate-500">حالة الامتثال لكل متطلب تنظيمي</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profile.regulatoryCompliance.map((item) => {
            const colors = statusColors[item.status];
            return (
              <div key={item.regulation.code} className={`card p-5 border-r-4 ${colors.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-400">{item.regulation.issuingBodyCode}</p>
                    <h3 className="mt-1 font-black text-sm leading-5">{item.regulation.nameAr}</h3>
                    <p className="mt-0.5 text-xs text-slate-500 truncate">{item.regulation.nameEn}</p>
                  </div>
                  <div className="mr-3 text-left">
                    <div className="text-2xl font-black">{item.score}%</div>
                    <span className={`badge text-[10px] ${colors.bg} ${colors.text}`}>{colors.label}</span>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.score >= 90 ? 'bg-emerald-500' :
                      item.score >= 80 ? 'bg-blue-500' :
                      item.score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  {item.regulation.certificationAvailable === false && item.regulation.officialAssessment && (
                    <span className="text-[10px] text-slate-400">تقييم رسمي</span>
                  )}
                  {item.regulation.regType === 'index' && (
                    <span className="text-[10px] text-slate-400">مؤشر / تقييم</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Maturity Section */}
      {profile.maturityAssessments.map((ma) => (
        <div key={ma.model.code} className="mt-8">
          <h2 className="text-xl font-black">{ma.model.nameAr}</h2>
          <p className="mt-1 text-sm text-slate-500">{ma.model.nameEn}</p>
          <div className="mt-4 card p-6">
            <div className="flex items-center gap-2">
              {ma.model.levels.map((level) => {
                const isCurrent = level.level === ma.currentLevel;
                const isBelow = level.level < ma.currentLevel;
                const isTarget = level.level === ma.targetLevel;
                return (
                  <div key={level.level} className="flex-1">
                    <div
                      className={`rounded-2xl p-3 text-center transition-all ${
                        isCurrent
                          ? 'bg-emerald-500 text-white shadow-lg scale-105'
                          : isBelow
                          ? 'bg-emerald-100 text-emerald-700'
                          : isTarget
                          ? 'bg-blue-50 text-blue-600 border-2 border-dashed border-blue-300'
                          : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      <div className="text-lg font-black">{level.level}</div>
                      <div className="text-[10px] font-bold mt-1">{level.nameAr}</div>
                      {level.certificationEligible && (
                        <div className="text-[9px] mt-1 opacity-70">مؤهل للاعتماد</div>
                      )}
                    </div>
                    {isCurrent && <div className="text-center text-[10px] font-bold text-emerald-600 mt-1">الحالي</div>}
                    {isTarget && !isCurrent && <div className="text-center text-[10px] font-bold text-blue-500 mt-1">الهدف</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Certifications Section */}
      <div className="mt-8">
        <h2 className="text-xl font-black">الشهادات والاعتمادات</h2>
        <p className="mt-1 text-sm text-slate-500">حالة الجاهزية لكل شهادة</p>
        <div className="mt-4 space-y-3">
          {profile.certifications
            .sort((a, b) => {
              const order = { certified: 0, ready: 1, in_progress: 2, not_started: 3, expired: 4, revoked: 5 };
              return (order[a.status] ?? 9) - (order[b.status] ?? 9);
            })
            .map((item) => {
              const cfg = certStatusConfig[item.status] || certStatusConfig.not_started;
              return (
                <div key={item.certification.code} className="card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${cfg.bg}`}>
                        {cfg.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm">{item.certification.nameAr}</h3>
                        <p className="text-xs text-slate-500">{item.certification.nameEn}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.certification.domain}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mr-4">
                      <div className="text-left">
                        {item.status !== 'certified' && (
                          <>
                            <div className="text-lg font-black">{item.readinessScore}%</div>
                            <div className="w-20 h-1.5 rounded-full bg-slate-100 mt-1">
                              <div
                                className={`h-full rounded-full ${
                                  item.readinessScore >= 80 ? 'bg-emerald-500' :
                                  item.readinessScore >= 60 ? 'bg-amber-500' : 'bg-red-400'
                                }`}
                                style={{ width: `${item.readinessScore}%` }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <span className={`badge ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                    </div>
                  </div>
                  {item.recommendation && (
                    <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700 leading-5 border border-emerald-100">
                      <span className="font-bold">توصية: </span>{item.recommendation}
                    </div>
                  )}
                  {item.relatedRegulations.length > 0 && (
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      {item.relatedRegulations.map(code => (
                        <span key={code} className="badge bg-slate-100 text-slate-500 text-[10px]">{code}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Important distinction note */}
      <div className="mt-8 card p-6 bg-slate-50">
        <h3 className="font-black text-sm">فهم الفرق بين المفاهيم</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'الامتثال', titleEn: 'Compliance', desc: 'ملتزم بالقانون / الضابط', color: 'bg-blue-500' },
            { title: 'التقييم', titleEn: 'Assessment', desc: 'تم تقييمي ونتيجتي واضحة', color: 'bg-amber-500' },
            { title: 'النضج', titleEn: 'Maturity', desc: 'مستواي في نموذج النضج', color: 'bg-purple-500' },
            { title: 'الشهادة / الاعتماد', titleEn: 'Certification', desc: 'جهة مستقلة منحتني شهادة', color: 'bg-emerald-500' },
          ].map(item => (
            <div key={item.titleEn} className="flex gap-3">
              <div className={`mt-1 h-3 w-3 rounded-full ${item.color} shrink-0`} />
              <div>
                <div className="font-black text-sm">{item.title}</div>
                <div className="text-[10px] text-slate-400">{item.titleEn}</div>
                <div className="text-xs text-slate-600 mt-1 leading-4">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
