import {
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Context } from '../context';
import {
  GetFileResult,
  HeadResult,
  File,
  ReadDirectoryResult,
  Provider,
} from './provider';
import { R2_RETRY_LIMIT, S3_MAX_KEYS } from '../constants/limits';

type S3ProviderCtorOptions = {
  ctx: Context;
  fallbackProvider?: Provider;
};

/**
 * This provides assets from an S3-compatible data source. In our case, it's
 *  still R2. We use this only for directory listing. In the bindings api,
 *  there's some internal response size limit that makes us need to send
 *  an absurd amount of requests in order to list the full contents of some
 *  directories. Using the S3 api was the recommended fix from the R2 team.
 */
export class S3Provider implements Provider {
  ctx: Context;
  fallbackProvider?: Provider;
  client: S3Client;

  constructor({ ctx, fallbackProvider }: S3ProviderCtorOptions) {
    this.ctx = ctx;
    this.fallbackProvider = fallbackProvider;
    this.client = new S3Client({
      region: 'auto',
      endpoint: ctx.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: ctx.env.S3_ACCESS_KEY_ID,
        secretAccessKey: ctx.env.S3_ACCESS_KEY_SECRET,
      },
    });
  }

  head(request: Request, path: string): Promise<HeadResult> {
    throw new Error('Method not implemented.');
  }

  getFile(request: Request, path: string): Promise<GetFileResult> {
    throw new Error('Method not implemented.');
  }

  async readDirectory(_: Request, path: string): Promise<ReadDirectoryResult> {
    const directories = new Set<string>();
    const files = new Set<File>();

    let isTruncated = true;
    let cursor: string | undefined;
    while (isTruncated) {
      let result: ListObjectsV2CommandOutput | undefined = undefined;
      let r2Error: unknown = undefined;

      for (let i = 0; i < R2_RETRY_LIMIT; i++) {
        try {
          result = await this.client.send(
            new ListObjectsV2Command({
              Bucket: this.ctx.env.BUCKET_NAME,
              Prefix: path,
              Delimiter: '/',
              MaxKeys: S3_MAX_KEYS,
              ContinuationToken: cursor,
            })
          );
        } catch (err) {
          console.error(`R2 ListObjectsV2 error: ${err}`);
          r2Error = err;
        }
      }

      if (result === undefined) {
        throw r2Error;
      }

      isTruncated = result.IsTruncated ?? false;
      cursor = isTruncated ? result.NextContinuationToken : undefined;
    }

    if (directories.size === 0 && files.size === 0) {
      return { exists: false };
    }

    return {
      exists: true,
      subdirectories: Array.from(directories),
      files: Array.from(files),
    };
  }
}
