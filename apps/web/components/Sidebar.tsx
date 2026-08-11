'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { useLocale } from './LocaleProvider';

const groups = [
  [['/dashboard','لوحة التحكم','Dashboard'],['/universe','نطاق الامتثال','My Compliance Universe']],
  [['/frameworks','الأطر والمعايير','Frameworks'],['/assessment','التقييمات','Assessments'],['/evidence','مركز الأدلة','Evidence Center'],['/gaps','الفجوات وخطط المعالجة','Gaps & Actions']],
  [['/matrix','مصفوفة الامتثال','Compliance Matrix'],['/calendar','تقويم الامتثال','Compliance Calendar'],['/audits','غرفة التدقيق','Audit Room'],['/regulatory-updates','التحديثات التنظيمية','Regulatory Updates'],['/documents','السياسات والتقارير','Policies & Reports']],
];
export function Sidebar(){const {locale}=useLocale();const pathname=usePathname();return <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-l border-slate-200 bg-white p-5 xl:flex xl:flex-col"><Logo/><div className="mt-8 flex-1 space-y-5 overflow-y-auto pe-1">{groups.map((group,i)=><nav key={i} aria-label={`Navigation group ${i+1}`} className="space-y-1 border-b border-slate-100 pb-4">{group.map(([href,ar,en])=>{const active=pathname===href;return <Link key={href} href={href} aria-current={active?'page':undefined} className={`relative block rounded-xl px-3 py-2.5 text-sm font-bold transition ${active?'bg-emerald-50 text-emerald-900 shadow-[inset_-3px_0_0_#059669]':'text-slate-600 hover:bg-slate-50 hover:text-emerald-800'}`}><span className="block">{locale==='ar'?ar:en}</span><span className={`text-[10px] font-medium ${active?'text-emerald-600':'text-slate-400'}`}>{locale==='ar'?en:ar}</span></Link>})}</nav>)}</div><div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white"><div className="flex items-center justify-between"><span className="font-bold">DEMO</span><span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950">{locale==='ar'?'بيانات تجريبية':'Demo data'}</span></div><p className="mt-2 text-xs leading-5 text-slate-400">{locale==='ar'?'شركة آفاق الرقمية السعودية — جهة خيالية':'Saudi Digital Horizons Company — fictional entity'}</p></div></aside>}
