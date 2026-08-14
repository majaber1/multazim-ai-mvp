'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Building2, CalendarDays, ClipboardCheck, FileCheck2, Files, Gauge, Grid3X3, LayoutList, Route, Scale, ShieldCheck, UserRound } from 'lucide-react';
import { Logo } from './Logo';
import { useLocale } from './LocaleProvider';
import { useSession } from './SessionProvider';
import { cn } from '@/lib/cn';

const groups = [
  [['/workspace','مؤسستي','My Organization',Building2],['/dashboard','نظرة عامة','Overview',Gauge],['/journeys','رحلات الامتثال','Compliance Journeys',Route]],
  [['/assessment','التقييمات','Assessments',ClipboardCheck],['/matrix','الضوابط','Controls',Grid3X3],['/gaps','المخاطر وخطط المعالجة','Risks & Actions',ShieldCheck],['/evidence','الأدلة','Evidence',FileCheck2],['/documents','السياسات والتقارير','Policies & Reports',Files]],
  [['/calendar','التقويم','Calendar',CalendarDays],['/notifications','الإشعارات','Notifications',Bell],['/audits','غرفة التدقيق','Audit Room',Scale],['/services','جميع الخدمات','All Services',LayoutList],['/profile','الملف الشخصي','My Profile',UserRound]],
] as const;

export function Sidebar({ collapsed = false }: { collapsed?: boolean }){const {locale,tr}=useLocale();const{session}=useSession();const pathname=usePathname();const organization=session?.organization?(locale==='ar'?session.organization.name_ar:session.organization.name_en):tr('مؤسستي','My organization');return <aside className={cn('sticky top-0 hidden h-screen shrink-0 border-e border-[var(--border)] bg-white p-4 transition-[width] duration-200 xl:flex xl:flex-col',collapsed?'w-20':'w-72')}><div className={cn(collapsed&&'flex justify-center')}><Logo compact={collapsed}/></div><div className="mt-7 flex-1 space-y-4 overflow-y-auto pe-1">{groups.map((group,i)=><nav key={i} aria-label={`${tr('مجموعة التنقل','Navigation group')} ${i+1}`} className="space-y-1 border-b border-slate-100 pb-4">{group.map(([href,ar,en,Icon])=>{const active=pathname===href;return <Link key={href} href={href} title={collapsed?tr(ar,en):undefined} aria-current={active?'page':undefined} className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors',active?'bg-teal-50 text-teal-900 shadow-[inset_3px_0_0_#0f766e] rtl:shadow-[inset_-3px_0_0_#0f766e]':'text-slate-600 hover:bg-slate-50 hover:text-teal-800')}><Icon aria-hidden="true" className="h-4 w-4 shrink-0"/>{collapsed?null:<span className="min-w-0"><span className="block truncate">{tr(ar,en)}</span><span className={cn('block truncate text-[10px] font-medium',active?'text-teal-600':'text-slate-400')}>{locale==='ar'?en:ar}</span></span>}</Link>})}</nav>)}</div>{collapsed?null:<div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white"><div className="text-[10px] font-bold text-emerald-300">{tr('مساحة المؤسسة','Organization workspace')}</div><p className="mt-1 truncate text-sm font-black">{organization}</p><p className="mt-1 text-xs text-slate-400">{session?.membership?.role??tr('جارٍ تحميل العضوية','Loading membership')}</p></div>}</aside>}
