import fileNotFound from '../responses/fileNotFound';
import { Context } from '../context';
import { getPrimaryProvider } from '../providers/providerFactory';

export async function getFile(
  url: URL,
  request: Request,
  ctx: Context
): Promise<Response> {
  const provider = getPrimaryProvider(ctx);
  const result = await provider.getFile(request, url.pathname);

  if (!result.exists) {
    return fileNotFound(request);
  }

  return new Response(result.body, {
    status: result.httpStatus,
    headers: result.httpHeaders,
  });
}

export async function headFile(
  url: URL,
  request: Request,
  ctx: Context
): Promise<Response> {
  const provider = getPrimaryProvider(ctx);
  const result = await provider.head(request, url.pathname);

  if (!result.exists) {
    return fileNotFound(request);
  }

  return new Response(undefined, {
    status: result.httpStatus,
    headers: result.httpHeaders,
  });
}
