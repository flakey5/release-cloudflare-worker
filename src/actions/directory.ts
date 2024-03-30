import { CACHE_HEADERS } from '../constants/cache';
import directoryNotFound from '../responses/directoryNotFound';
import directoryListing from '../responses/directoryListing';
import { Context } from '../context';
import { getPrimaryProvider } from '../providers/providerFactory';
import { enforceDirectoryPathRestrictions } from '../utils/path';

export async function listDirectory(
  url: URL,
  request: Request,
  ctx: Context
): Promise<Response> {
  const errorResponse = enforceDirectoryPathRestrictions(url, request, ctx.env);
  if (errorResponse !== undefined) {
    return errorResponse;
  }

  const provider = getPrimaryProvider(ctx);
  const result = await provider.readDirectory(request, url.pathname);

  if (!result.exists) {
    return directoryNotFound(request);
  }

  if ('body' in result) {
    // We already have a body to return (aka r2 requests failed and this is the
    //  result from OriginProvider)
    return new Response(result.body, {
      status: result.httpStatus,
      headers: result.httpHeaders,
    });
  }

  // TODO: check for index.html in result.files

  return directoryListing(url, result);
}

export async function headDirectory(
  url: URL,
  request: Request,
  ctx: Context
): Promise<Response> {
  const errorResponse = enforceDirectoryPathRestrictions(url, request, ctx.env);
  if (errorResponse !== undefined) {
    return errorResponse;
  }

  const provider = getPrimaryProvider(ctx);
  const result = await provider.readDirectory(request, url.pathname);

  if (!result.exists) {
    return directoryNotFound(request);
  }

  if ('body' in result) {
    // We already have a body to return (aka r2 requests failed and this is the
    //  result from OriginProvider)
    return new Response(undefined, {
      status: result.httpStatus,
      headers: result.httpHeaders,
    });
  }

  let directoryLastModified: Date | undefined = undefined;
  for (const file of result.files) {
    if (
      directoryLastModified === undefined ||
      file.lastModified > directoryLastModified
    ) {
      directoryLastModified = file.lastModified;
    }
  }

  return new Response(undefined, {
    headers: {
      'last-modified': (directoryLastModified ?? new Date()).toUTCString(),
      'content-type': 'text/html',
      'cache-control': CACHE_HEADERS.success,
    },
  });
}
