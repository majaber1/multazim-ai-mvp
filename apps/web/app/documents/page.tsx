'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { browserApiUrl, DEMO_ORGANIZATION_ID, demoHeaders } from '@/lib/api';
import { StatusChip } from '@/components/StatusChip';
import { useLocale } from '@/components/LocaleProvider';

const types = [
  ['privacy', 'سياسة الخصوصية', 'Privacy policy'],
  ['information_security', 'سياسة أمن المعلومات', 'Information security policy'],
  ['access_control', 'سياسة التحكم بالوصول', 'Access control policy'],
  ['business_continuity', 'سياسة استمرارية الأعمال', 'Business continuity policy'],
  ['vendor_management', 'سياسة إدارة الموردين', 'Vendor management policy'],
  ['ai_governance', 'سياسة حوكمة الذكاء الاصطناعي', 'AI governance policy'],
] as const;

const reportFormats = [
  ['pdf', 'PDF', 'application/pdf'],
  ['xlsx', 'Excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ['csv', 'CSV', 'text/csv'],
] as const;

export default function Documents() {
  const { locale } = useLocale();
  const [type, setType] = useState('privacy');
  const [draft, setDraft] = useState<{ title_ar: string; notice_ar: string; sections: string[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const ar = locale === 'ar';

  async function generate() {
    setSaving(true);
    try {
      const response = await fetch(`${browserApiUrl()}/v1/policies/draft`, {
        method: 'POST', headers: demoHeaders,
        body: JSON.stringify({ organization_id: DEMO_ORGANIZATION_ID, policy_type: type }),
      });
      if (!response.ok) throw new Error('Policy draft request failed');
      setDraft(await response.json());
    } finally { setSaving(false); }
  }

  async function download(format: string) {
    const response = await fetch(`${browserApiUrl()}/v1/reports/executive.${format}`, { headers: demoHeaders });
    if (!response.ok) throw new Error('Report download failed');
    const url = URL.createObjectURL(await response.blob());
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `multazim-executive-report.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <AppShell title={ar ? 'السياسات والتقارير' : 'Policies & Reports'}>
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="card p-6">
        <StatusChip tone="amber">{ar ? 'مسودة تتطلب اعتمادًا' : 'Draft requires approval'}</StatusChip>
        <h2 className="mt-4 text-xl font-black">{ar ? 'مولد مسودات السياسات' : 'Policy draft generator'}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{ar ? 'ينشئ هيكلًا أوليًا فقط، ولا يحل محل المراجعة القانونية والأمنية.' : 'Creates a structured first draft; legal and security review remain required.'}</p>
        <label className="mt-5 block text-sm font-bold">{ar ? 'نوع السياسة' : 'Policy type'}
          <select value={type} onChange={event => setType(event.target.value)} className="mt-2 w-full rounded-xl border p-3 font-normal">
            {types.map(([value, arabic, english]) => <option key={value} value={value}>{ar ? arabic : english}</option>)}
          </select>
        </label>
        <button onClick={generate} disabled={saving} className="mt-4 w-full rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-60">
          {saving ? (ar ? 'جارٍ الإنشاء...' : 'Generating...') : (ar ? 'إنشاء المسودة' : 'Generate draft')}
        </button>
        {draft ? <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><h3 className="font-black">{draft.title_ar}</h3><p className="mt-2 text-xs leading-5 text-emerald-900">{draft.notice_ar}</p><ol className="mt-3 list-inside list-decimal space-y-1 text-sm">{draft.sections.map(section => <li key={section}>{section}</li>)}</ol></div> : null}
      </section>
      <section className="card p-6">
        <StatusChip tone="blue">{ar ? 'تقارير قابلة للتدقيق' : 'Audit-ready exports'}</StatusChip>
        <h2 className="mt-4 text-xl font-black">{ar ? 'التقرير التنفيذي' : 'Executive report'}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{ar ? 'تنزيل تقرير PDF للإدارة أو مصنف Excel للتحليل أو CSV للأنظمة.' : 'Download a management PDF, analysis-ready Excel workbook, or machine-readable CSV.'}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {reportFormats.map(([format, label]) => <button key={format} onClick={() => download(format)} className="rounded-xl border border-emerald-700 px-4 py-3 text-center font-black text-emerald-800 hover:bg-emerald-50">{label}</button>)}
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">{ar ? 'تتضمن التقارير نسخة الإطار والدرجات التقديرية والقيود، ولا تمثل شهادة أو نتيجة رسمية.' : 'Reports include framework versions, estimated scores, and limitations; they are not certifications or official regulator results.'}</p>
      </section>
    </div>
  </AppShell>;
}
