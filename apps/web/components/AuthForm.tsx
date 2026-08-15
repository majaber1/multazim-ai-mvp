'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from './LocaleProvider';

export function AuthForm({ mode }: { mode: 'signup' | 'signin' }) {
  const { tr } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSaving(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    if (mode === 'signup' && password !== String(form.get('confirm_password') ?? '')) {
      setError(tr('كلمتا المرور غير متطابقتين.','Passwords do not match.')); setSaving(false); return;
    }
    const payload = mode === 'signup'
      ? { full_name: form.get('full_name'), email: form.get('email'), password }
      : { email: form.get('email'), password, remember: form.get('remember') === 'on' };
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail ?? tr('تعذر إكمال الطلب.','Unable to complete the request.'));
      const requested = search.get('next');
      router.replace(data.organization ? (requested || '/workspace') : '/organization/new');
      router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : tr('حدث خطأ غير متوقع.','An unexpected error occurred.')); }
    finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="mt-8 space-y-5">
    {mode === 'signup' ? <label className="block text-sm font-bold">{tr('الاسم الكامل','Full name')}<input name="full_name" autoComplete="name" required minLength={2} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label> : null}
    <label className="block text-sm font-bold">{tr('البريد الإلكتروني للعمل','Work email')}<input name="email" type="email" autoComplete="email" required dir="ltr" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-left" /></label>
    <label className="block text-sm font-bold">{tr('كلمة المرور','Password')}<input name="password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={10} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">{tr('10 أحرف على الأقل.','At least 10 characters.')}</span></label>
    {mode === 'signup' ? <label className="block text-sm font-bold">{tr('تأكيد كلمة المرور','Confirm password')}<input name="confirm_password" type="password" autoComplete="new-password" required minLength={10} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label> : <label className="flex items-center gap-2 text-sm"><input name="remember" type="checkbox" className="h-4 w-4" />{tr('تذكر جلستي لمدة 30 يوماً','Remember me for 30 days')}</label>}
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}
    <button disabled={saving} className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-black text-white disabled:opacity-60">{saving ? tr('جارٍ الحفظ...','Saving...') : mode === 'signup' ? tr('إنشاء الحساب','Create account') : tr('تسجيل الدخول','Sign in')}</button>
    <p className="text-center text-sm text-slate-600">{mode === 'signup' ? tr('لديك حساب؟','Already have an account?') : tr('ليس لديك حساب؟','New to Multazim?')} <Link className="font-black text-emerald-700" href={mode === 'signup' ? '/sign-in' : '/sign-up'}>{mode === 'signup' ? tr('تسجيل الدخول','Sign in') : tr('إنشاء حساب','Create account')}</Link></p>
  </form>;
}
