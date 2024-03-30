import { CACHE } from '../constants/cache';
import { Env } from '../env';

export async function getCachedResponse(
  request: Request,
  env: Pick<Env, 'CACHING'>
): Promise<Response | undefined> {
  if (!env.CACHING) {
    return undefined;
  }

  const response = await CACHE.match(request);
  return response;
}
