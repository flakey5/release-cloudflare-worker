import { CACHE_HEADERS } from '../constants/cache';
import { Context } from '../context';
import {
  GetFileResult,
  HeadResult,
  HttpHeaders,
  ReadDirectoryResult,
  Provider,
} from './provider';

function buildHttpHeadersFromHeadersObject(headers: Headers): HttpHeaders {
  return {
    etag: headers.get('etag') ?? '',
    'accept-range': headers.get('accept-range') ?? 'bytes',
    'access-control-allow-origin':
      headers.get('access-control-allow-origin') ?? '',
    'cache-control': CACHE_HEADERS.failure, // We don't want to cache these requests
    'last-modified': headers.get('last-modified') ?? '',
    'content-language': headers.get('content-language') ?? '',
    'content-disposition': headers.get('content-disposition') ?? '',
    'content-length': headers.get('content-length') ?? '0',
  };
}

/**
 * Provides assets from the old infrastructure. Used as a fallback if R2 fails
 *  for some extra resiliency.
 */
export class OriginProvider implements Provider {
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  async head(_: Request, path: string): Promise<HeadResult> {
    const res = await fetch(this.ctx.env.ORIGIN_HOST + path, {
      method: 'HEAD',
    });

    if (res.status === 404) {
      return { exists: false };
    }

    return {
      exists: true,
      httpStatus: res.status,
      httpHeaders: buildHttpHeadersFromHeadersObject(res.headers),
    };
  }

  async getFile(request: Request, path: string): Promise<GetFileResult> {
    const { headers: reqHeaders } = request;
    const res = await fetch(this.ctx.env.ORIGIN_HOST + path, {
      headers: {
        'user-agent': 'release-cloudflare-worker',
        'if-match': reqHeaders.get('if-match') ?? '',
        'if-none-match': reqHeaders.get('if-none-match') ?? '',
        'if-modified-since': reqHeaders.get('if-modified-since') ?? '',
        'if-unmodified-since': reqHeaders.get('if-unmodified-since') ?? '',
        // if-range isn't supported by R2, don't include it here either
      },
    });

    if (res.status === 404) {
      return { exists: false };
    }

    return {
      exists: true,
      body: res.body,
      httpStatus: res.status,
      httpHeaders: buildHttpHeadersFromHeadersObject(res.headers),
    };
  }

  async readDirectory(
    request: Request,
    path: string
  ): Promise<ReadDirectoryResult> {
    const { headers: reqHeaders } = request;
    const res = await fetch(this.ctx.env.ORIGIN_HOST + path, {
      headers: {
        'user-agent': 'release-cloudflare-worker',
        'if-match': reqHeaders.get('if-match') ?? '',
        'if-none-match': reqHeaders.get('if-none-match') ?? '',
        'if-modified-since': reqHeaders.get('if-modified-since') ?? '',
        'if-unmodified-since': reqHeaders.get('if-unmodified-since') ?? '',
        // if-range isn't supported by R2, don't include it here either
      },
    });

    if (res.status === 404) {
      return { exists: false };
    }

    return {
      exists: true,
      body: res.body,
      httpStatus: res.status,
      httpHeaders: buildHttpHeadersFromHeadersObject(res.headers),
    };
  }
}
