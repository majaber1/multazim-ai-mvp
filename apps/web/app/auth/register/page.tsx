'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      window.location.href = '/auth/login?registered=1';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: 40, width: '100%', maxWidth: 420 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e2e8f0', textAlign: 'center', marginBottom: 8 }}>إنشاء حساب</h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: 24 }}>ملتزم AI - منصة الامتثال</p>
        {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 16, color: '#f87171', fontSize: '0.8rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>الاسم</label>
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="محمد" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #1e293b', background: '#1a2332', color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 16, outline: 'none' }} />
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>البريد الإلكتروني</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #1e293b', background: '#1a2332', color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 16, outline: 'none', direction: 'ltr' }} />
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>كلمة المرور</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="********" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #1e293b', background: '#1a2332', color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 16, outline: 'none', direction: 'ltr' }} />
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>تأكيد كلمة المرور</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="********" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #1e293b', background: '#1a2332', color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 24, outline: 'none', direction: 'ltr' }} />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: '#818cf8', color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'جاري...' : 'إنشاء حساب'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: '#64748b' }}>لديك حساب؟ <Link href="/auth/login" style={{ color: '#818cf8' }}>تسجيل الدخول</Link></p>
      </div>
    </div>
  );
}
