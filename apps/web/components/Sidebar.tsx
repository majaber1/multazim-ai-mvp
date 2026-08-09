'use client';
import Link from 'next/link';
import { Logo } from './Logo';
import { useLocale } from './LocaleProvider';

const groups = [
  [['/dashboard','لوحة التحكم','Dashboard'],['/universe','نطاق الامتثال','My Compliance Universe']],
  [['/frameworks','الأطر والمعايير','Frameworks'],['/assessment','التقييمات','Assessments'],['/evidence','مركز الأدلة','Evidence Center'],['/gaps','الفجوات وخطط المعالجة','Gaps & Actions']],
  [['/matrix','مصفوفة الامتثال','Compliance Matrix'],['/calendar','تقويم الامتثال','Compliance Calendar'],['/audits','غرفة التدقيق','Audit Room'],['/regulatory-updates','التحديثات التنظيمية','Regulatory Updates'],['/documents','السياسات والتقارير','Policies & Reports']],
];
export function Sidebar(){const {locale}=useLocale();return <aside className="hidden min-h-screen w-72 shrink-0 border-l border-slate-200 bg-white p-5 xl:block"><Logo/><div className="mt-8 space-y-5">{groups.map((group,i)=><nav key={i} className="space-y-1 border-b border-slate-100 pb-4">{group.map(([href,ar,en])=><Link key={href} href={href} className="block rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"><span className="block">{locale==='ar'?ar:en}</span><span className="text-[10px] font-medium text-slate-400">{locale==='ar'?en:ar}</span></Link>)}</nav>)}</div><div className="rounded-2xl bg-slate-950 p-4 text-white"><div className="flex items-center justify-between"><span className="font-bold">DEMO</span><span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950">{locale==='ar'?'بيانات تجريبية':'Demo data'}</span></div><p className="mt-2 text-xs leading-5 text-slate-400">{locale==='ar'?'شركة آفاق الرقمية السعودية — جهة خيالية':'Saudi Digital Horizons Company — fictional entity'}</p></div></aside>}
