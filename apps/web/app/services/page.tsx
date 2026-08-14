import Link from 'next/link';
import {
  BellRing,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Files,
  Gauge,
  Globe2,
  Grid3X3,
  ListChecks,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Nav } from '@/components/Nav';
import { authenticatedApi, sessionToken } from '@/lib/server-api';

const groups = [
  {
    eyebrow: '01 — اكتشف',
    title: 'اعرف متطلباتك ووضعك الحالي',
    description: 'ابدأ من نطاق منشأتك، ثم انتقل إلى تقييم قابل للتوثيق بدل الاعتماد على الانطباعات.',
    services: [
      { title: 'نطاق الامتثال', description: 'تحديد الجهات والأطر والمتطلبات ذات الصلة بنشاط المنشأة وبياناتها.', href: '/universe', icon: Sparkles },
      { title: 'الأطر والمعايير', description: 'استعراض الضوابط والمتطلبات السعودية وربطها بسياق المنشأة.', href: '/frameworks', icon: ShieldCheck },
      { title: 'التقييم الذكي', description: 'تقييم عربي وإنجليزي مع حالة كل ضابط، مبررات، أدلة ودرجة اكتمال.', href: '/assessment', icon: ClipboardCheck },
      { title: 'فحص الموقع', description: 'فحص المؤشرات التقنية للخصوصية، HTTPS، ملفات الارتباط والصفحات الأساسية.', href: '/website-audit', icon: Globe2 },
    ],
  },
  {
    eyebrow: '02 — نفّذ',
    title: 'حوّل النواقص إلى عمل منظم',
    description: 'اربط كل فجوة بدليل وإجراء ومسؤول وتاريخ، وحافظ على سجل واضح للتقدم.',
    services: [
      { title: 'الفجوات وخطط المعالجة', description: 'أولويات واضحة، إجراءات تصحيحية، مسؤولون ومواعيد استحقاق.', href: '/gaps', icon: ListChecks },
      { title: 'مركز الأدلة', description: 'رفع الأدلة، إعادة استخدامها، إدارة الإصدارات والصلاحية والاستبدال.', href: '/evidence', icon: FileSearch },
      { title: 'السياسات والتقارير', description: 'مسودات سياسات بمراجعة بشرية وتقارير تنفيذية عربية وإنجليزية.', href: '/documents', icon: Files },
      { title: 'الرحلات التنظيمية', description: 'مسارات جاهزة تقود الفريق خطوة بخطوة حسب الحالة التنظيمية.', href: '/journeys', icon: CheckCircle2 },
    ],
  },
  {
    eyebrow: '03 — راقب',
    title: 'حافظ على الجاهزية باستمرار',
    description: 'شاهد الصورة الكاملة، تابع المواعيد، واستعد للمراجعة دون تجميع الملفات في آخر لحظة.',
    services: [
      { title: 'لوحة التحكم', description: 'درجة الامتثال، اتجاه الأداء، الأولويات والتنبيهات من شاشة واحدة.', href: '/dashboard', icon: Gauge },
      { title: 'مصفوفة الامتثال', description: 'ربط الضوابط بالتقييمات والأدلة والفجوات وحالة المراجعة.', href: '/matrix', icon: Grid3X3 },
      { title: 'تقويم وتنبيهات', description: 'تواريخ الاستحقاق، انتهاء الأدلة والتنبيهات المقروءة وغير المقروءة.', href: '/calendar', icon: CalendarClock },
      { title: 'غرفة التدقيق', description: 'حزمة مراجعة منظمة وسجل تدقيق يساعد على إثبات ما تم ومن اعتمده.', href: '/audits', icon: Scale },
    ],
  },
  {
    eyebrow: '04 — افهم',
    title: 'ذكاء امتثال مرتبط بمصادرك',
    description: 'إجابات موثقة بمراجع داخلية مع فصل واضح بين المساعدة الذكية والقرار البشري.',
    services: [
      { title: 'مساعد ملتزم AI', description: 'اسأل عن متطلبات منشأتك واحصل على إجابات مرتبطة بالمصادر المتاحة.', href: '/regulatory-updates', icon: Bot },
      { title: 'التحديثات التنظيمية', description: 'متابعة المصادر والتغييرات وتحويل أثرها إلى مراجعات قابلة للتنفيذ.', href: '/regulatory-updates', icon: BellRing },
    ],
  },
] as const;

export const metadata = {
  title: 'خدمات ملتزم AI | منصة الامتثال السعودية',
  description: 'جميع خدمات ملتزم AI: التقييم، الأدلة، الفجوات، السياسات، التقارير، التدقيق والذكاء التنظيمي.',
};

export default async function ServicesPage() {
  const signedIn = Boolean(await sessionToken());
  let organizationName = '';
  if (signedIn) {
    const response = await authenticatedApi('/v1/me');
    if (response.ok) {
      const account = await response.json();
      organizationName = account.organization?.name_ar ?? '';
    }
  }
  return (
    <div className="mesh min-h-screen">
      <Nav />
      <main>
        {signedIn ? <div className="border-b border-emerald-200 bg-emerald-50"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"><span><b>سياق المؤسسة:</b> {organizationName || 'أكمل إنشاء مؤسستك'}</span><Link href={organizationName?'/workspace':'/organization/new'} className="font-black text-emerald-800">العودة إلى مساحة المؤسسة ←</Link></div></div> : null}
        <section className="mx-auto max-w-7xl px-5 pb-16 pt-20 text-center">
          <span className="badge bg-emerald-100 text-emerald-800">منصة امتثال متكاملة للسوق السعودي</span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            من معرفة المتطلبات إلى إثبات الامتثال، <span className="text-emerald-700">كلها في مكان واحد.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            ملتزم يجمع التقييم والأدلة وخطط المعالجة والسياسات والمراقبة المستمرة في رحلة واضحة لفريقك.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href={signedIn?'/assessment':'/sign-up'} className="rounded-2xl bg-emerald-600 px-6 py-4 font-black text-white shadow-lg shadow-emerald-200">{signedIn?'ابدأ التقييم':'أنشئ حساباً'}</Link>
            <Link href={signedIn?'/workspace':'/sign-in'} className="rounded-2xl border border-slate-300 bg-white px-6 py-4 font-black">{signedIn?'مساحة المؤسسة':'تسجيل الدخول'}</Link>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            {[['13+','خدمة مترابطة'],['عربي','وإنجليزي'],['24/7','متابعة مستمرة'],['مسار واحد','من الفجوة للإغلاق']].map(([value,label]) => (
              <div key={label} className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur">
                <div className="text-xl font-black text-slate-950">{value}</div><div className="mt-1 text-xs font-bold text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-7xl space-y-20 px-5">
            {groups.map((group) => (
              <div key={group.eyebrow}>
                <div className="grid gap-4 md:grid-cols-[.8fr_1.2fr] md:items-end">
                  <div><div className="eyebrow">{group.eyebrow}</div><h2 className="mt-3 text-3xl font-black md:text-4xl">{group.title}</h2></div>
                  <p className="max-w-2xl text-base leading-7 text-slate-600 md:justify-self-end">{group.description}</p>
                </div>
                <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  {group.services.map(({ title, description, href, icon: Icon }) => (
                    <Link key={title} href={href} className="group card flex min-h-64 flex-col p-6 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white"><Icon className="h-6 w-6" /></div>
                      <h3 className="mt-5 text-xl font-black">{title}</h3>
                      <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{description}</p>
                      <span className="mt-5 text-sm font-black text-emerald-700">افتح الخدمة ←</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-20">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl md:p-12">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div><div className="flex items-center gap-2 text-emerald-300"><Sparkles className="h-5 w-5"/><span className="text-sm font-black">ابدأ بخطوة عملية اليوم</span></div><h2 className="mt-4 text-3xl font-black">اعرف أولويات الامتثال في منشأتك.</h2><p className="mt-3 max-w-2xl leading-7 text-slate-300">أكمل التقييم الأولي، اربط الأدلة، واحصل على خطة واضحة لما يجب تنفيذه بعد ذلك.</p></div>
              <Link href={signedIn?'/assessment':'/sign-up'} className="rounded-2xl bg-emerald-400 px-7 py-4 text-center font-black text-slate-950 hover:bg-emerald-300">{signedIn?'ابدأ التقييم':'ابدأ مجاناً'}</Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-white py-8 text-center text-sm text-slate-500">ملتزم AI — منصة مساندة للامتثال، وليست بديلاً عن الاستشارة القانونية أو الضريبية.</footer>
    </div>
  );
}
