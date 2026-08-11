'use client';

import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { getDemoOrganizationProfile, certifications } from '@/lib/catalog';

export default function Dashboard() {
  const profile = getDemoOrganizationProfile();

  const avgScore = Math.round(
    profile.regulatoryCompliance.reduce((sum, c) => sum + c.score, 0) / profile.regulatoryCompliance.length
  );

  const certifiedCount = profile.certifications.filter(c => c.status === 'certified').length;
  const readyCount = profile.certifications.filter(c => c.status === 'ready').length;
  const maturity = profile.maturityAssessments[0];

  const lowestCompliance = [...profile.regulatoryCompliance].sort((a, b) => a.score - b.score)[0];

  const recommendedCert = certifications.find(c => c.code === profile.recommendedNextCert);

  return (
    <AppShell title="لوحة التحكم">
      {/* Top Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/compliance" className="card p-5 hover:shadow-lg transition group">
          <p className="text-sm text-slate-500">الامتثال التنظيمي</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-black">{avgScore}%</span>
            <span className="text-sm font-bold text-slate-400 mb-1">متوسط</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${avgScore}%` }} />
          </div>
          <p className="mt-2 text-xs text-emerald-600 font-bold group-hover:underline">عرض التفاصيل</p>
        </Link>

        <Link href="/certifications" className="card p-5 hover:shadow-lg transition group">
          <p className="text-sm text-slate-500">الشهادات</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-4xl font-black">{certifiedCount}</span>
            <span className="text-sm font-bold text-emerald-600 mb-1">حاصل عليها</span>
          </div>
          <p className="mt-3 text-sm text-blue-600 font-bold">{readyCount} جاهزة للحصول</p>
          <p className="mt-1 text-xs text-slate-400 group-hover:underline">عرض الدليل</p>
        </Link>

        <div className="card p-5">
          <p className="text-sm text-slate-500">مستوى النضج (SEAM)</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-black">{maturity?.currentLevel}</span>
            <span className="text-sm font-bold text-slate-400 mb-1">من 5</span>
          </div>
          <p className="mt-3 text-sm text-blue-600 font-bold">
            {maturity?.model.levels.find(l => l.level === maturity.currentLevel)?.nameAr}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            الهدف: المستوى {maturity?.targetLevel} ({maturity?.model.levels.find(l => l.level === maturity?.targetLevel)?.nameAr})
          </p>
        </div>

        <div className="card p-5 border-2 border-red-100">
          <p className="text-sm text-slate-500">أدنى امتثال</p>
          <div className="mt-2 text-4xl font-black text-red-600">{lowestCompliance.score}%</div>
          <p className="mt-2 text-sm font-bold text-slate-700">{lowestCompliance.regulation.nameAr}</p>
          <p className="mt-1 text-xs text-slate-400">{lowestCompliance.regulation.issuingBodyCode}</p>
        </div>
      </div>

      {/* Two Columns */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Regulatory Compliance Overview */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black">حالة الامتثال التنظيمي</h2>
            <Link href="/compliance" className="text-sm text-emerald-600 font-bold hover:underline">عرض الكل</Link>
          </div>
          <div className="space-y-3">
            {profile.regulatoryCompliance.map((item) => (
              <div key={item.regulation.code} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold truncate">{item.regulation.nameAr}</span>
                    <span className="text-sm font-black mr-2">{item.score}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.score >= 90 ? 'bg-emerald-500' :
                        item.score >= 80 ? 'bg-blue-500' :
                        item.score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
                <span className={`badge text-[10px] ${
                  item.status === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                  item.status === 'good' ? 'bg-blue-100 text-blue-700' :
                  item.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {item.status === 'excellent' ? 'ممتاز' :
                   item.status === 'good' ? 'جيد' :
                   item.status === 'warning' ? 'تحسين' : 'حرج'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Certification Readiness */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black">جاهزية الشهادات</h2>
          </div>
          <div className="space-y-3">
            {profile.certifications
              .sort((a, b) => {
                const order = { certified: 0, ready: 1, in_progress: 2, not_started: 3, expired: 4, revoked: 5 };
                return (order[a.status] ?? 9) - (order[b.status] ?? 9);
              })
              .slice(0, 5)
              .map((item) => (
                <div key={item.certification.code} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">
                      {item.status === 'certified' ? '🏆' : item.status === 'ready' ? '✓' : item.status === 'in_progress' ? '⟳' : '—'}
                    </span>
                    <span className="text-sm font-bold truncate">{item.certification.nameAr}</span>
                  </div>
                  {item.status === 'certified' ? (
                    <span className="badge bg-emerald-100 text-emerald-700 text-[10px]">معتمد</span>
                  ) : (
                    <span className="text-sm font-black">{item.readinessScore}%</span>
                  )}
                </div>
              ))}
          </div>

          {/* Recommended Next */}
          {recommendedCert && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-emerald-600">الشهادة التالية الموصى بها</p>
              <p className="text-sm font-black mt-1">{recommendedCert.nameAr}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-4">{profile.recommendedNextCertReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Maturity Level Visual */}
      {maturity && (
        <div className="mt-6 card p-6">
          <h2 className="text-lg font-black">{maturity.model.nameAr}</h2>
          <p className="text-sm text-slate-500 mb-4">{maturity.model.nameEn}</p>
          <div className="flex items-center gap-2">
            {maturity.model.levels.map((level) => {
              const isCurrent = level.level === maturity.currentLevel;
              const isBelow = level.level < maturity.currentLevel;
              const isTarget = level.level === maturity.targetLevel;
              return (
                <div key={level.level} className="flex-1">
                  <div
                    className={`rounded-2xl p-3 text-center transition-all ${
                      isCurrent ? 'bg-emerald-500 text-white shadow-lg scale-105' :
                      isBelow ? 'bg-emerald-100 text-emerald-700' :
                      isTarget ? 'bg-blue-50 text-blue-600 border-2 border-dashed border-blue-300' :
                      'bg-slate-50 text-slate-400'
                    }`}
                  >
                    <div className="text-lg font-black">{level.level}</div>
                    <div className="text-[10px] font-bold mt-1">{level.nameAr}</div>
                  </div>
                  {isCurrent && <div className="text-center text-[10px] font-bold text-emerald-600 mt-1">الحالي</div>}
                  {isTarget && !isCurrent && <div className="text-center text-[10px] font-bold text-blue-500 mt-1">الهدف</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
