import { NextResponse } from 'next/server';
import { apiBaseUrl, SESSION_COOKIE, sessionToken } from '@/lib/server-api';

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  if (!['signup', 'signin', 'logout'].includes(action)) return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  const token = await sessionToken();
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const body = action === 'logout' ? undefined : await request.text();
  const upstream = await fetch(`${apiBaseUrl()}/v1/auth/${action}`, { method: 'POST', headers, body, cache: 'no-store' });
  const payload = upstream.status === 204 ? null : await upstream.json().catch(() => ({ detail: 'Authentication service unavailable' }));
  const sessionValue = payload?.token as string | undefined;
  if (payload?.token) delete payload.token;
  const response = payload ? NextResponse.json(payload, { status: upstream.status }) : new NextResponse(null, { status: upstream.status });
  if (upstream.ok && action !== 'logout' && sessionValue) {
    response.cookies.set(SESSION_COOKIE, sessionValue, { httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', path: '/', expires: payload.expires_at ? new Date(payload.expires_at) : undefined, priority: 'high' });
  }
  if (action === 'logout') response.cookies.delete(SESSION_COOKIE);
  return response;
}
