'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, ChevronsLeft, ChevronsRight, Menu, Search, UserRound, X } from 'lucide-react';
import { Logo } from './Logo';
import { Sidebar } from './Sidebar';
import { useLocale } from './LocaleProvider';

const routes = [
  ['/dashboard','لوحة التحكم','Dashboard'],['/journeys','الرحلات التنظيمية','Regulatory Journeys'],['/universe','نطاق الامتثال','Compliance Scope'],['/frameworks','الأطر والمعايير','Frameworks'],['/assessment','التقييمات','Assessments'],['/evidence','مركز الأدلة','Evidence Center'],['/gaps','الفجوات وخطط المعالجة','Gaps & Actions'],['/matrix','مصفوفة الامتثال','Compliance Matrix'],['/calendar','تقويم الامتثال','Compliance Calendar'],['/audits','غرفة التدقيق','Audit Room'],['/regulatory-updates','التحديثات التنظيمية','Regulatory Updates'],['/documents','السياسات والتقارير','Policies & Reports'],
] as const;
const mobileRoutes = routes.slice(0, 2).concat([routes[4], routes[5], routes[7]]);

export function AppShell({ children, title, subtitle = 'شركة آفاق الرقمية السعودية — بيانات تجريبية' }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const { locale, setLocale, t, tr } = useLocale();
  const pathname = usePathname();
  const [collapsed,setCollapsed]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [notificationsOpen,setNotificationsOpen]=useState(false);
  const matches=useMemo(()=>routes.filter(([,ar,en])=>`${ar} ${en}`.toLowerCase().includes(query.toLowerCase())),[query]);
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();setSearchOpen(true)}if(event.key==='Escape'){setSearchOpen(false);setNotificationsOpen(false)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[]);
  return <div className="flex min-h-screen bg-[var(--background)]">
    <Sidebar collapsed={collapsed}/>
    <main className="min-w-0 flex-1 pb-20 xl:pb-0">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/92 px-4 py-3 backdrop-blur-xl md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3"><button onClick={()=>setCollapsed(value=>!value)} className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 xl:inline-flex" aria-label={tr('طي القائمة الجانبية','Collapse sidebar')}>{collapsed?(locale==='ar'?<ChevronsLeft className="h-4 w-4"/>:<ChevronsRight className="h-4 w-4"/>):(locale==='ar'?<ChevronsRight className="h-4 w-4"/>:<ChevronsLeft className="h-4 w-4"/>)}</button><div className="hidden min-w-0 xl:block"><div className="mb-1 text-[10px] font-bold text-slate-400"><Link href="/dashboard" className="hover:text-teal-700">{tr('الرئيسية','Home')}</Link><span aria-hidden="true"> / </span><span>{t(title)}</span></div><h1 className="truncate text-xl font-black">{t(title)}</h1><p className="mt-0.5 truncate text-xs text-slate-500">{t(subtitle)}</p></div><div className="xl:hidden"><Logo/></div></div>
          <div className="relative flex items-center gap-2"><button onClick={()=>setSearchOpen(true)} className="hidden min-w-48 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 hover:border-teal-300 sm:flex"><span className="flex items-center gap-2"><Search className="h-4 w-4"/>{tr('بحث سريع','Quick search')}</span><kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px]">⌘K</kbd></button><button onClick={()=>setNotificationsOpen(value=>!value)} aria-expanded={notificationsOpen} aria-label={tr('الإشعارات','Notifications')} className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Bell className="h-4 w-4"/><span className="absolute -end-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500"/></button><button onClick={()=>setLocale(locale==='ar'?'en':'ar')} aria-label={tr('Switch to English','التبديل إلى العربية')} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:border-teal-300">{locale==='ar'?'EN':'عربي'}</button><div className="hidden items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-white md:flex"><UserRound className="h-4 w-4"/><span className="text-xs font-bold">{tr('مدير الامتثال','Compliance Admin')}</span></div>{notificationsOpen?<div className="absolute end-10 top-12 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"><div className="flex items-center justify-between"><b className="text-sm">{tr('الإشعارات','Notifications')}</b><button onClick={()=>setNotificationsOpen(false)} aria-label={tr('إغلاق','Close')}><X className="h-4 w-4"/></button></div><p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{tr('إجراءان يستحقان خلال 14 يومًا.','Two actions are due within 14 days.')}</p><Link onClick={()=>setNotificationsOpen(false)} href="/calendar" className="mt-3 block text-xs font-bold text-teal-700">{tr('فتح تقويم الامتثال','Open compliance calendar')}</Link></div>:null}</div>
        </div>
      </header>
      <div className="mx-auto min-w-0 max-w-7xl p-4 md:p-7"><div className="mb-5 xl:hidden"><h1 className="text-2xl font-black">{t(title)}</h1><p className="mt-1 text-xs text-slate-500">{t(subtitle)}</p></div><div className="section-enter min-w-0">{children}</div></div>
      <nav aria-label={tr('تنقل الجوال','Mobile navigation')} className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-12px_35px_-25px_rgba(15,23,42,.5)] backdrop-blur-xl xl:hidden">{mobileRoutes.map(([href,ar,en])=>{const active=pathname===href;return <Link key={href} href={href} aria-current={active?'page':undefined} className={`rounded-xl px-1 py-2 text-center text-[10px] font-black transition ${active?'bg-teal-50 text-teal-800':'text-slate-500'}`}>{tr(ar,en)}</Link>})}</nav>
    </main>
    {searchOpen?<div className="fixed inset-0 z-[70] grid place-items-start bg-slate-950/45 px-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={tr('البحث في المنصة','Search the platform')}><div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-center gap-3 border-b p-4"><Search className="h-5 w-5 text-slate-400"/><input autoFocus value={query} onChange={event=>setQuery(event.target.value)} placeholder={tr('ابحث عن صفحة أو وحدة...','Search for a page or module...')} className="min-w-0 flex-1 border-0 bg-transparent outline-none"/><button onClick={()=>setSearchOpen(false)} aria-label={tr('إغلاق','Close')}><X className="h-5 w-5"/></button></div><div className="max-h-80 overflow-y-auto p-2">{matches.length?matches.map(([href,ar,en])=><Link onClick={()=>{setSearchOpen(false);setQuery('')}} key={href} href={href} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold hover:bg-teal-50"><span>{tr(ar,en)}</span><span className="text-xs font-normal text-slate-400">{locale==='ar'?en:ar}</span></Link>):<p className="p-6 text-center text-sm text-slate-500">{tr('لا توجد نتائج مطابقة.','No matching results.')}</p>}</div></div></div>:null}
  </div>;
}
