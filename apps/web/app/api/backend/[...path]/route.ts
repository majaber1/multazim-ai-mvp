import { authenticatedApi } from '@/lib/server-api';

async function forward(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const upstreamPath = path[0] === 'v1' ? path.slice(1) : path;
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
  const query = new URL(request.url).search;
  const response = await authenticatedApi(`/v1/${upstreamPath.join('/')}${query}`, { method: request.method, headers, body });
  const outputHeaders = new Headers();
  const responseType = response.headers.get('content-type');
  const disposition = response.headers.get('content-disposition');
  if (responseType) outputHeaders.set('Content-Type', responseType);
  if (disposition) outputHeaders.set('Content-Disposition', disposition);
  return new Response(response.body, { status: response.status, headers: outputHeaders });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
