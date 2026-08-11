'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { Sidebar } from './Sidebar';
import { useLocale } from './LocaleProvider';

const mobileRoutes = [
  ['/dashboard', 'الرئيسية', 'Dashboard'],
  ['/universe', 'النطاق', 'Scope'],
  ['/evidence', 'الأدلة', 'Evidence'],
  ['/gaps', 'الفجوات', 'Gaps'],
  ['/calendar', 'التقويم', 'Calendar'],
] as const;

export function AppShell({ children, title, subtitle = 'شركة آفاق الرقمية السعودية — بيانات تجريبية' }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const { locale, setLocale, t } = useLocale();
  const pathname = usePathname();
  return <div className="flex min-h-screen bg-[#f5f7f6]">
    <Sidebar/>
    <main className="min-w-0 flex-1 pb-20 xl:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="hidden xl:block"><h1 className="text-xl font-black md:text-2xl">{t(title)}</h1><p className="mt-1 text-xs text-slate-500">{t(subtitle)}</p></div>
          <div className="xl:hidden"><Logo/></div>
          <div className="flex items-center gap-2"><button onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')} aria-label="Switch language" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:border-emerald-300">{locale === 'ar' ? 'EN' : 'عربي'}</button><Link href="/universe" className="hidden rounded-xl bg-emerald-700 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-emerald-800 sm:block">{t('تحديث نطاق الامتثال')}</Link></div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl p-4 md:p-7"><div className="mb-5 xl:hidden"><h1 className="text-2xl font-black">{t(title)}</h1><p className="mt-1 text-xs text-slate-500">{t(subtitle)}</p></div>{children}</div>
      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-12px_35px_-25px_rgba(15,23,42,.5)] backdrop-blur-xl xl:hidden">{mobileRoutes.map(([href, ar, en]) => { const active = pathname === href; return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`rounded-xl px-1 py-2 text-center text-[10px] font-black transition ${active ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500'}`}>{locale === 'ar' ? ar : en}</Link>; })}</nav>
    </main>
  </div>;
}
