import './globals.css';
import type { Metadata } from 'next';
import { Geist, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { LocaleProvider } from '@/components/LocaleProvider';
import { SessionProvider } from '@/components/SessionProvider';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const arabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'], variable: '--font-arabic', display: 'swap' });

export const metadata: Metadata = {
  title: 'ملتزم | منصة الامتثال الذكية للمملكة',
  description: 'منصة سعودية موحدة لتحديد نطاق المتطلبات التنظيمية وقياس الامتثال وإدارة الأدلة والفجوات.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth" className={`${geist.variable} ${arabic.variable}`}>
      <body className="font-sans antialiased"><LocaleProvider><SessionProvider>{children}</SessionProvider></LocaleProvider></body>
    </html>
  );
}
