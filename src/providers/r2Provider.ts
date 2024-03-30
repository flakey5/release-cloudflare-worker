import { R2_RETRY_LIMIT } from '../constants/limits';
import { Context } from '../context';
import { objectHasBody } from '../utils/object';
import {
  GetFileResult,
  HeadResult,
  HttpHeaders,
  ReadDirectoryResult,
  Provider,
} from './provider';
import { S3Provider } from './s3Provider';

function buildHttpHeadersFromR2HttpMetadata(object: R2Object): HttpHeaders {
  const { httpMetadata } = object;

  return {
    etag: object.httpEtag,
    'accept-range': 'bytes',
    // https://github.com/nodejs/build/blob/e3df25d6a23f033db317a53ab1e904c953ba1f00/ansible/www-standalone/resources/config/nodejs.org?plain=1#L194-L196
    'access-control-allow-origin': 'TODO', // TODO,
    'cache-control': '', // TODO
    expires: httpMetadata?.cacheExpiry?.toUTCString(),
    'last-modified': object.uploaded.toUTCString(),
    'content-language': httpMetadata?.contentLanguage,
    'content-disposition': httpMetadata?.contentDisposition,
    'content-length': object.size.toString(),
  };
}

type R2ProviderCtorOptions = {
  ctx: Context;
  fallbackProvider?: Provider;
};

/**
 * Provides assets from our R2 prod bucket.
 */
export class R2Provider implements Provider {
  private ctx: Context;
  private fallbackProvider?: Provider;

  constructor({ ctx, fallbackProvider }: R2ProviderCtorOptions) {
    this.ctx = ctx;
    this.fallbackProvider = fallbackProvider;
  }

  async head(request: Request, path: string): Promise<HeadResult> {
    let object: R2Object | null = null;
    let r2Error: unknown = undefined;
    for (let i = 0; i < R2_RETRY_LIMIT; i++) {
      try {
        object = await this.ctx.env.R2_BUCKET.head(path);
      } catch (err) {
        console.error(`R2Provider.head error: ${err}`);
        r2Error = err;
      }
    }

    if (r2Error !== undefined) {
      this.ctx.sentry.captureException(r2Error);

      if (this.fallbackProvider !== undefined) {
        return this.fallbackProvider.head(request, path);
      } else {
        throw r2Error;
      }
    }

    if (object === null) {
      return { exists: false };
    }

    return {
      exists: true,
      httpStatus: 200,
      httpHeaders: buildHttpHeadersFromR2HttpMetadata(object),
    };
  }

  async getFile(request: Request, path: string): Promise<GetFileResult> {
    let object: R2Object | null = null;
    let r2Error: unknown = undefined;
    for (let i = 0; i < R2_RETRY_LIMIT; i++) {
      try {
        object = await this.ctx.env.R2_BUCKET.get(path, {
          onlyIf: request.headers,
          range: request.headers,
        });
      } catch (err) {
        console.error(`R2Provider.getFile error: ${err}`);
        r2Error = err;
      }
    }

    if (r2Error !== undefined) {
      this.ctx.sentry.captureException(r2Error);

      if (this.fallbackProvider !== undefined) {
        return this.fallbackProvider.getFile(request, path);
      } else {
        throw r2Error;
      }
    }

    if (object === null) {
      return { exists: false };
    }

    return {
      exists: true,
      body: objectHasBody(object) ? object.body : undefined,
      httpStatus: 200, // TODO return proper http status code
      httpHeaders: buildHttpHeadersFromR2HttpMetadata(object),
    };
  }

  readDirectory(request: Request, path: string): Promise<ReadDirectoryResult> {
    const s3Provider = new S3Provider({
      ctx: this.ctx,
      fallbackProvider: this.fallbackProvider,
    });
    return s3Provider.readDirectory(request, path);
  }
}
