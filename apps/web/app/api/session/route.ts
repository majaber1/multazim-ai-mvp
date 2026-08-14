import { authenticatedApi } from '@/lib/server-api';

export async function GET() {
  const response = await authenticatedApi('/v1/me');
  return new Response(await response.text(), { status: response.status, headers: { 'Content-Type': 'application/json' } });
}
