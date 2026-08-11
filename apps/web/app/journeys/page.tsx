'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { useLocale } from '@/components/LocaleProvider';
import { browserApiUrl } from '@/lib/api';

type VerificationStatus = 'CONFIRMED_REQUIREMENT' | 'SUGGESTED_REQUIREMENT' | 'REQUIRES_EXPERT_VERIFICATION';
type Source = { id: string; title_ar: string; title_en: string; url: string };
type Requirement = { code: string; type: string; status: VerificationStatus; weight: number; title_ar: string; title_en: string; description_ar: string; description_en: string; source_id: string; source_reference: string; evidence: string[] };
type Journey = { code: string; business_activity: { name_ar: string; name_en: string }; license: { name_ar: string; name_en: string; legal_note_ar: string; legal_note_en: string }; authority: { name_ar: string; name_en: string }; platform: { name_ar: string; name_en: string; url: string }; official_sources: Source[]; requirements: Requirement[] };
type Readiness = { score: number; status: string; completed_count: number; total_count: number; blockers: Array<{ code: string }>; notice: string };

const statusCopy: Record<VerificationStatus, { ar: string; en: string; style: string }> = {
  CONFIRMED_REQUIREMENT: { ar: 'متطلب مؤكد', en: 'Confirmed requirement', style: 'bg-emerald-50 text-emerald-800' },
  SUGGESTED_REQUIREMENT: { ar: 'متطلب مقترح', en: 'Suggested requirement', style: 'bg-blue-50 text-blue-800' },
  REQUIRES_EXPERT_VERIFICATION: { ar: 'يتطلب تحقق خبير', en: 'Requires expert verification', style: 'bg-amber-50 text-amber-900' },
};

export default function Journeys() {
  const { locale, tr, formatNumber } = useLocale();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${browserApiUrl()}/v1/journeys/TGA-TAXI-APP-MEDIATION`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error(); return response.json() as Promise<Journey>; })
      .then(data => { setJourney(data); setState('ready'); })
      .catch(error => { if (error.name !== 'AbortError') setState('error'); });
    return () => controller.abort();
  }, []);

  async function updateRequirement(code: string, checked: boolean) {
    const next = new Set(completed);
    if (checked) next.add(code); else next.delete(code);
    setCompleted(next);
    const response = await fetch(`${browserApiUrl()}/v1/journeys/TGA-TAXI-APP-MEDIATION/readiness`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed_requirement_codes: [...next] }),
    });
    if (!response.ok) throw new Error('Unable to calculate readiness');
    setReadiness(await response.json() as Readiness);
  }

  if (state === 'loading') return <AppShell title={tr('الرحلات التنظيمية', 'Regulatory Journeys')}><div role="status" className="card animate-pulse p-8 text-sm text-slate-500">{tr('جارٍ تحميل الرحلة من السجل التنظيمي...', 'Loading the journey from the regulatory register...')}</div></AppShell>;
  if (state === 'error' || !journey) return <AppShell title={tr('الرحلات التنظيمية', 'Regulatory Journeys')}><div role="alert" className="card border-red-200 bg-red-50 p-8 text-red-900"><h2 className="font-black">{tr('تعذر تحميل الرحلة', 'Unable to load the journey')}</h2><p className="mt-2 text-sm">{tr('شغّل FastAPI أو تحقق من عنوان الخدمة. لم يتم عرض متطلبات بديلة أو مخترعة.', 'Start FastAPI or verify the service URL. No substitute or invented requirements were displayed.')}</p></div></AppShell>;

  const sources = new Map(journey.official_sources.map(source => [source.id, source]));
  const score = readiness?.score ?? 0;
  return <AppShell title={tr('الرحلات التنظيمية', 'Regulatory Journeys')} subtitle={tr('ابدأ من هدفك التجاري، وسنحوّله إلى متطلبات قابلة للتنفيذ.', 'Start with a business objective and turn it into actionable requirements.')}>
    <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6"><div className="max-w-3xl"><p className="text-xs font-black text-emerald-300">{tr('الرحلة التجريبية الأولى', 'First pilot journey')}</p><h2 className="mt-3 text-2xl font-black md:text-3xl">{locale === 'ar' ? journey.business_activity.name_ar : journey.business_activity.name_en}</h2><p className="mt-3 text-sm leading-7 text-slate-300">{locale === 'ar' ? journey.license.legal_note_ar : journey.license.legal_note_en}</p></div><div className="min-w-40 rounded-2xl bg-white/10 p-5 text-center"><div className="text-4xl font-black">{formatNumber(score)}%</div><p className="mt-1 text-xs text-slate-300">{tr('جاهزية التقديم', 'Submission readiness')}</p></div></div>
      <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${score}%` }} /></div>
      <p className="mt-3 text-xs text-slate-400">{tr('مؤشر قرار داخلي؛ لا يضمن موافقة الجهة التنظيمية.', 'Internal decision-support indicator; it does not guarantee regulator approval.')}</p>
    </section>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
      <section className="space-y-4" aria-label={tr('قائمة متطلبات الرحلة', 'Journey requirements checklist')}>
        {journey.requirements.map(requirement => { const copy = statusCopy[requirement.status]; const source = sources.get(requirement.source_id); return <article key={requirement.code} className="card p-5 md:p-6"><div className="flex items-start gap-4"><input id={requirement.code} type="checkbox" checked={completed.has(requirement.code)} onChange={event => updateRequirement(requirement.code, event.target.checked).catch(() => setState('error'))} className="mt-1 h-5 w-5 accent-teal-700"/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-[11px] font-black ${copy.style}`}>{tr(copy.ar, copy.en)}</span><span className="technical-value text-[11px] text-slate-400">{requirement.code} · {formatNumber(requirement.weight)}%</span></div><label htmlFor={requirement.code} className="mt-3 block cursor-pointer font-black">{locale === 'ar' ? requirement.title_ar : requirement.title_en}</label><p className="mt-2 text-sm leading-6 text-slate-600">{locale === 'ar' ? requirement.description_ar : requirement.description_en}</p><div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-4 text-xs"><span className="font-bold text-slate-500">{requirement.source_reference}</span>{source ? <a href={source.url} target="_blank" rel="noreferrer" className="font-black text-teal-700 hover:underline">{tr('فتح المصدر الرسمي', 'Open official source')}</a> : null}</div></div></div></article>; })}
      </section>
      <aside className="space-y-4">
        <section className="card p-5"><p className="text-xs font-black text-teal-700">{tr('الجهة والقناة', 'Authority and channel')}</p><h3 className="mt-3 font-black">{locale === 'ar' ? journey.authority.name_ar : journey.authority.name_en}</h3><a href={journey.platform.url} target="_blank" rel="noreferrer" className="mt-2 block text-sm font-bold text-teal-700 hover:underline">{locale === 'ar' ? journey.platform.name_ar : journey.platform.name_en}</a></section>
        <section className="card p-5"><h3 className="font-black">{tr('حالة القائمة', 'Checklist status')}</h3><p className="mt-3 text-sm text-slate-600">{tr(`تم استكمال ${formatNumber(readiness?.completed_count ?? 0)} من ${formatNumber(journey.requirements.length)} عناصر.`, `${formatNumber(readiness?.completed_count ?? 0)} of ${formatNumber(journey.requirements.length)} items completed.`)}</p><p className="mt-2 text-sm text-slate-600">{tr(`المتبقي: ${formatNumber(readiness?.blockers.length ?? journey.requirements.length)}`, `Remaining: ${formatNumber(readiness?.blockers.length ?? journey.requirements.length)}`)}</p></section>
        <section className="card p-5"><h3 className="font-black">{tr('المصادر الرسمية', 'Official sources')}</h3><div className="mt-3 space-y-3">{journey.official_sources.map(source => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-200 p-3 text-sm font-bold hover:border-teal-300 hover:text-teal-800">{locale === 'ar' ? source.title_ar : source.title_en}</a>)}</div></section>
      </aside>
    </div>
  </AppShell>;
}
