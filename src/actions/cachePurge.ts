import { z } from 'zod';
import { Context } from '../context';
import { parseBodyJson } from '../utils/request';

const CachePurgeBodySchema = z.object({
  paths: z.array(z.string()),
});
type CachePurgeBody = z.infer<typeof CachePurgeBodySchema>;

export async function cachePurge(
  url: URL,
  request: Request,
  ctx: Context
): Promise<Response> {
  const apiKey = request.headers.get('x-api-key');

  if (apiKey !== ctx.env.CACHE_PURGE_API_KEY) {
    return new Response(undefined, { status: 403 });
  }

  const body = await parseBodyJson(request, CachePurgeBodySchema);

  if (body instanceof Response) {
    return body;
  }

  const baseUrl = `${url.protocol}//${url.host}`;
  const promises: Promise<boolean>[] = [];

  for (const path of body.paths) {
    // const urlPaths = mapBucket
  }

  return new Response(undefined, { status: 204 });
}
