import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { StatusChip } from '@/components/StatusChip';
import { getComplianceHistory, getDashboard } from '@/lib/dashboard-api';

export const dynamic = 'force-dynamic';

const statusAr: Record<string, string> = { open: 'مفتوح', planned: 'مخطط', in_progress: 'قيد التنفيذ', completed: 'مكتمل', blocked: 'متعثر' };
const roadmap = [
  { title: 'هوية مؤسسية وSSO', state: 'يحتاج إعداد', detail: 'OIDC جاهز برمجيًا وينتظر بيانات المزود.' },
  { title: 'قاعدة البيانات والتخزين', state: 'يحتاج ربط', detail: 'المخطط والترحيل جاهزان؛ يلزم PostgreSQL وObject Storage.' },
  { title: 'تحليل الأدلة', state: 'قيد التحضير', detail: 'الرفع والبصمة جاهزان؛ يلزم مزود AI وفحص برمجيات ضارة.' },
];

function Icon({ name }: { name: 'score' | 'evidence' | 'gap' | 'scope' }) {
  const paths = {
    score: <path d="M4 19V9m5 10V5m5 14v-7m5 7V3" />,
    evidence: <><path d="M6 3h9l3 3v15H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
    gap: <><path d="M12 3 2.8 19h18.4z" /><path d="M12 9v4m0 3h.01" /></>,
    scope: <><circle cx="12" cy="12" r="9" /><path d="M12 7v10M7 12h10" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function ExecutiveMetric({ label, value, detail, icon, accent }: { label: string; value: string; detail: string; icon: 'score' | 'evidence' | 'gap' | 'scope'; accent: string }) {
  return <article className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white p-5 shadow-[0_18px_55px_-30px_rgba(15,23,42,.35)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_-28px_rgba(15,23,42,.42)]"><div className={`absolute inset-x-0 top-0 h-1 ${accent}`} /><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p></div><div className="rounded-2xl bg-slate-950 p-3 text-white"><Icon name={icon} /></div></div><p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p></article>;
}

function Sparkline({values}:{values:number[]}) {
  if(values.length<2)return <div className="my-5 rounded-xl border border-dashed border-white/20 p-4 text-xs text-slate-400">سجل تاريخي غير كافٍ - سيظهر الاتجاه بعد قياسين فعليين على الأقل.</div>;
  const step=270/(values.length-1);const points=values.map((value,index)=>`${index*step},${100-value}`).join(' ');
  return <svg role="img" aria-label="اتجاه درجة الامتثال من القياسات المحفوظة" viewBox="0 0 270 60" className="h-24 w-full overflow-visible"><defs><linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#10b981" stopOpacity=".28"/><stop offset="1" stopColor="#10b981" stopOpacity="0"/></linearGradient></defs><path d={`M0 60 L${points.replaceAll(' ', ' L')} L270 60 Z`} fill="url(#trend-fill)"/><polyline points={points} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{values.map((value,index)=><circle key={index} cx={index*step} cy={100-value} r={index===values.length-1?4:2.4} fill={index===values.length-1?'#064e3b':'#10b981'}/>)}</svg>;
}

export default async function Dashboard() {
  const [{ data, live },history] = await Promise.all([getDashboard(),getComplianceHistory()]);
  if(!data)return <AppShell title="لوحة التحكم"><section className="card p-8"><h2 className="text-xl font-black">لا توجد بيانات امتثال بعد</h2><p className="mt-2 text-slate-600">ابدأ أول تقييم جاهزية لبناء لوحة مؤسستك.</p><Link href="/assessment" className="mt-5 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-black text-white">ابدأ التقييم الأول</Link></section></AppShell>;
  const totalRisks = Object.values(data.risk_distribution).reduce((sum, value) => sum + value, 0);
  return <AppShell title="لوحة الامتثال التنفيذية">
    <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_30px_80px_-35px_rgba(2,6,23,.75)] md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
        <div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">مركز القيادة</span><StatusChip tone={live ? 'emerald' : 'amber'}>{live ? 'متصل مباشرة' : 'وضع العرض الاحتياطي'}</StatusChip></div><h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight md:text-4xl">صورة واحدة لاتخاذ قرار امتثال أسرع وأكثر وضوحًا.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">راقب الجاهزية، ركّز فرق العمل على أعلى المخاطر، وتتبع الأدلة المشتركة بين الأطر السعودية والدولية.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/gaps" className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300">عرض خطة المعالجة</Link><Link href="/documents" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10">تصدير التقرير التنفيذي</Link></div></div>
        <div className="rounded-3xl border border-white/10 bg-white/[.06] p-5 backdrop-blur"><div className="flex items-end justify-between"><div><p className="text-xs text-slate-400">درجة ملتزم التقديرية</p><p className="mt-2 text-5xl font-black">{data.overall_score}<span className="text-xl text-emerald-300">%</span></p></div><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">{history.length} قياسات</span></div><Sparkline values={history.map(item=>item.overall_readiness)}/><div className="flex justify-between text-[10px] text-slate-500"><span>{history[0]?.captured_at.slice(0,10)??'—'}</span><span>{history.at(-1)?.captured_at.slice(0,10)??'—'}</span></div></div>
      </div>
    </section>

    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500"/><span><b>تنبيه منهجي:</b> {data.disclaimer_ar}</span></div>

    <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <ExecutiveMetric label="الامتثال الإجمالي" value={`${data.overall_score}%`} detail={history.length >= 2 ? `التغير بين آخر قياسين: ${data.trend}%` : 'يُحسب من استجابات التقييم المحفوظة'} icon="score" accent="bg-emerald-500"/>
      <ExecutiveMetric label="جاهزية الأدلة" value={`${data.evidence_readiness}%`} detail="الأدلة المقبولة والقابلة لإعادة الاستخدام" icon="evidence" accent="bg-cyan-500"/>
      <ExecutiveMetric label="الفجوات الحرجة" value={String(data.critical_gaps)} detail="تحتاج قرارًا أو معالجة فورية" icon="gap" accent="bg-rose-500"/>
      <ExecutiveMetric label="الأطر المنطبقة" value={String(data.applicable_frameworks)} detail="وفق ملف الجهة ونطاق أعمالها" icon="scope" accent="bg-violet-500"/>
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
      <article className="card p-6 md:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">تغطية الأطر</p><h2 className="mt-2 text-xl font-black">مستوى الجاهزية حسب الإطار</h2></div><Link href="/matrix" className="text-xs font-black text-emerald-700 hover:underline">فتح مصفوفة الامتثال ←</Link></div><div className="mt-7 space-y-6">{data.framework_scores.map((framework,index)=><div key={framework.code}><div className="mb-2 flex items-end justify-between gap-4"><div><b className="text-sm text-slate-900">{framework.name_ar}</b><p className="mt-1 text-[11px] text-slate-400" dir="ltr">{framework.name_en} · {framework.version}</p></div><b className="text-lg">{framework.score}%</b></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${['bg-emerald-500','bg-cyan-500','bg-violet-500','bg-amber-500'][index%4]}`} style={{width:`${framework.score}%`}}/></div></div>)}{data.framework_scores.length === 0 ? <p className="rounded-2xl border border-dashed p-5 text-sm text-slate-500">لا توجد نتائج أطر بعد. ابدأ تقييماً واحفظ الاستجابات لعرض المؤشرات.</p> : null}</div></article>
      <article className="card p-6 md:p-7"><p className="eyebrow">المخاطر المفتوحة</p><div className="mt-3 flex items-end justify-between"><div><h2 className="text-xl font-black">توزيع المخاطر</h2><p className="mt-1 text-xs text-slate-500">{totalRisks} مخاطرة تحت المتابعة</p></div><div className="grid h-20 w-20 place-items-center rounded-full bg-[conic-gradient(#ef4444_0_12%,#f97316_12%_44%,#f59e0b_44%_100%)]"><div className="grid h-14 w-14 place-items-center rounded-full bg-white text-lg font-black">{totalRisks}</div></div></div><div className="mt-7 grid grid-cols-3 gap-2">{[['critical','حرج','text-rose-700','bg-rose-50'],['high','عالٍ','text-orange-700','bg-orange-50'],['medium','متوسط','text-amber-700','bg-amber-50']].map(([key,label,text,bg])=><div key={key} className={`rounded-2xl p-3 text-center ${bg}`}><div className={`text-2xl font-black ${text}`}>{data.risk_distribution[key]??0}</div><div className="mt-1 text-[10px] font-bold text-slate-500">{label}</div></div>)}</div><div className="mt-6 rounded-2xl bg-slate-950 p-4 text-white"><p className="text-xs font-black text-emerald-300">أفضل فرصة للتحسين</p><p className="mt-2 text-sm leading-6 text-slate-300">إغلاق مراجعة الحسابات المميزة يرفع الجاهزية عبر أربعة أطر مترابطة.</p></div></article>
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
      <article className="card p-6"><div className="flex items-center justify-between"><div><p className="eyebrow">صحة البرنامج</p><h2 className="mt-2 text-xl font-black">مسارات العمل</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{data.framework_scores.length} مسارات مقاسة</span></div><div className="mt-6 space-y-5">{data.framework_scores.map((item,index)=><div key={item.code}><div className="mb-2 flex justify-between text-xs"><b>{item.name_ar}</b><span className="font-black text-slate-500">{item.score}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${['bg-emerald-500','bg-cyan-500','bg-violet-500','bg-amber-500'][index%4]}`} style={{width:`${item.score}%`}}/></div></div>)}{data.framework_scores.length === 0 ? <p className="text-sm text-slate-500">ستظهر مسارات العمل بعد حفظ أول استجابة تقييم.</p> : null}</div></article>
      <article className="card overflow-hidden"><div className="flex items-center justify-between border-b px-6 py-5"><div><p className="eyebrow">التنفيذ</p><h2 className="mt-1 text-xl font-black">إجراءات الأولوية</h2></div><Link href="/gaps" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black hover:border-emerald-300 hover:text-emerald-700">عرض الكل</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-right text-sm"><thead className="bg-slate-50/80 text-[11px] text-slate-500"><tr>{['الإجراء','المالك','الموعد','الأثر','الحالة'].map(label=><th key={label} className="px-5 py-3 font-bold">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{data.actions.map(action=><tr key={action.id} className="transition hover:bg-slate-50/70"><td className="max-w-xs px-5 py-4 font-bold text-slate-900">{action.title}</td><td className="px-5 py-4 text-slate-600">{action.owner}</td><td className="px-5 py-4 text-xs text-slate-500" dir="ltr">{action.due_date}</td><td className="px-5 py-4"><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold">{action.impacted_frameworks.length} أطر</span></td><td className="px-5 py-4"><StatusChip tone={action.priority==='critical'?'red':'amber'}>{statusAr[action.status]??action.status}</StatusChip></td></tr>)}</tbody></table></div></article>
    </section>

    <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 md:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">جاهزية الإنتاج</p><h2 className="mt-2 text-xl font-black">ما تبقى لإكمال المنصة</h2><p className="mt-2 text-sm text-slate-500">الواجهات ومسارات الحوكمة جاهزة؛ العناصر التالية تحتاج موارد خارجية قبل إطلاق عملاء حقيقيين.</p></div><Link href="/regulatory-updates" className="text-xs font-black text-emerald-700 hover:underline">عرض سجل التغطية التنظيمية</Link></div><div className="mt-6 grid gap-3 lg:grid-cols-3">{roadmap.map((item,index)=><article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-xs font-black text-white">{index+1}</span><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-800">{item.state}</span></div><h3 className="mt-4 font-black">{item.title}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{item.detail}</p></article>)}</div></section>
  </AppShell>;
}
