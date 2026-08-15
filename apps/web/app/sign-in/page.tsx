'use client';
import { Suspense } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { Logo } from '@/components/Logo';
import { useLocale } from '@/components/LocaleProvider';

export default function SignInPage(){const{locale,setLocale,tr}=useLocale();return <main className="mesh grid min-h-screen place-items-center px-4 py-12"><section className="card w-full max-w-lg p-7 md:p-10"><div className="flex items-center justify-between"><Logo href="/"/><button onClick={()=>setLocale(locale==='ar'?'en':'ar')} className="rounded-xl border px-3 py-2 text-xs font-bold">{locale==='ar'?'EN':'عربي'}</button></div><h1 className="mt-8 text-3xl font-black">{tr('مرحباً بعودتك','Welcome back')}</h1><p className="mt-2 leading-7 text-slate-600">{tr('سجّل الدخول للعودة إلى مساحة مؤسستك ومتابعة عملك.','Sign in to return to your organization workspace and continue your work.')}</p><Suspense><AuthForm mode="signin"/></Suspense></section></main>}
