import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'multazim-session';

export function apiBaseUrl() {
  return process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
}

export async function sessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function authenticatedApi(path: string, init: RequestInit = {}) {
  const token = await sessionToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${apiBaseUrl()}${path}`, { ...init, headers, cache: 'no-store' });
}
