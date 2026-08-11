import Link from 'next/link';
import { Logo } from './Logo';

const items = [
  ['/dashboard', 'لوحة التحكم'],
  ['/compliance', 'ملف الامتثال'],
  ['/regulations', 'المتطلبات التنظيمية'],
  ['/certifications', 'الشهادات والاعتمادات'],
  ['/assessment', 'التقييم'],
  ['/documents', 'المستندات'],
  ['/website-audit', 'فحص الموقع'],
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-l border-slate-200 bg-white p-6 lg:block">
      <Logo />
      <div className="mt-10 space-y-1">
        {items.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="block rounded-2xl px-4 py-3 font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition"
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-10 rounded-3xl bg-slate-900 p-5 text-white">
        <div className="font-black">الخطة المجانية</div>
        <p className="mt-2 text-sm text-slate-300">أكمل ملف منشأتك لرفع دقة التوصيات.</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
          <div className="h-full w-2/3 bg-emerald-400" />
        </div>
      </div>
    </aside>
  );
}
