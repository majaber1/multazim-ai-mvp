import Link from 'next/link';
import { Logo } from './Logo';
export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 md:flex">
          <Link href="#features">المزايا</Link><Link href="#how">كيف يعمل</Link><Link href="#pricing">الأسعار</Link>
        </nav>
        <div className="flex gap-2"><Link href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold">دخول</Link><Link href="/assessment" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">ابدأ مجانًا</Link></div>
      </div>
    </header>
  );
}
