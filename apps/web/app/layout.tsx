import './globals.css';
import type { Metadata } from 'next';
import { LocaleProvider } from '@/components/LocaleProvider';

export const metadata: Metadata = {
  title: 'ملتزم | منصة الامتثال الذكية للمملكة',
  description: 'منصة سعودية موحدة لتحديد نطاق المتطلبات التنظيمية وقياس الامتثال وإدارة الأدلة والفجوات.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased"><LocaleProvider>{children}</LocaleProvider></body>
    </html>
  );
}
