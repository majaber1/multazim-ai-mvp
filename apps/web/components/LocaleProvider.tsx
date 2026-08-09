'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Locale = 'ar' | 'en';
type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (value: string) => string };

const translations: Record<string, string> = {
  'لوحة التحكم': 'Dashboard',
  'نطاق الامتثال الخاص بي': 'My Compliance Universe',
  'الأطر والمعايير': 'Frameworks',
  'التقييمات': 'Assessments',
  'مركز الأدلة': 'Evidence Center',
  'الفجوات وخطط المعالجة': 'Gaps & Actions',
  'مصفوفة الامتثال': 'Compliance Matrix',
  'تقويم الامتثال': 'Compliance Calendar',
  'غرفة التدقيق': 'Audit Room',
  'التحديثات التنظيمية': 'Regulatory Updates',
  'السياسات والتقارير': 'Policies & Reports',
  'شركة آفاق الرقمية السعودية — بيانات تجريبية': 'Saudi Digital Horizons Company — Demo data',
  'تحديث نطاق الامتثال': 'Update compliance scope',
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>('ar');
  useEffect(() => {
    const saved = window.localStorage.getItem('multazim-locale');
    if (saved === 'ar' || saved === 'en') updateLocale(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem('multazim-locale', locale);
    document.cookie = `multazim-locale=${locale};path=/;max-age=31536000;samesite=lax`;
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale: updateLocale, t: (text: string) => locale === 'en' ? translations[text] ?? text : text }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale must be used inside LocaleProvider');
  return value;
}
