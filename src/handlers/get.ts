import { listDirectory } from '../actions/directory';
import { getFile } from '../actions/file';
import { CACHE, CACHE_HEADERS } from '../constants/cache';
import badRequest from '../responses/badRequest';
import { getCachedResponse } from '../utils/cache';
import { isDirectoryPath } from '../utils/path';
import { parseUrl } from '../utils/request';
import { Handler } from './handler';

const getHandler: Handler = async (request, ctx) => {
  const cachedResponse = await getCachedResponse(request, ctx.env);
  if (cachedResponse !== undefined) {
    return cachedResponse;
  }

  const url = parseUrl(request);

  if (url === undefined) {
    return badRequest();
  }

  const isPathADirectory = isDirectoryPath(url.pathname);

  const response = isPathADirectory
    ? await listDirectory(url, request, ctx)
    : await getFile(url, request, ctx);

  // Cache the response if it was successful
  if (
    response.status === 200 &&
    response.headers.get('cache-control') === CACHE_HEADERS.success
  ) {
    const cachedResponse = response.clone();

    cachedResponse.headers.set('x-cache-status', 'hit');

    ctx.execution.waitUntil(CACHE.put(request, cachedResponse));
  }

  response.headers.set('x-cache-status', 'miss');

  return response;
};

export default getHandler;
