import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ملتزم AI | امتثال المنشآت بوضوح',
  description: 'منصة ذكية لتقييم الامتثال، فحص المواقع، وإنشاء مسودات السياسات.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
