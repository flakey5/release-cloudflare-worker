export interface Env {
  ENVIRONMENT: 'e2e-tests' | 'dev' | 'staging' | 'prod';
  CACHING: boolean;

  BUCKET_NAME: string;

  R2_BUCKET: R2Bucket;

  S3_ENDPOINT: string;
  S3_ACCESS_KEY_ID: string;
  S3_ACCESS_KEY_SECRET: string;

  /**
   * Directory listing toggle
   *  on - Enabled for all paths
   *  restricted - Directory listing enabled only for paths we want to be listed
   *  off - No directory
   * In prod, this should *always* be restricted
   */
  DIRECTORY_LISTING: 'on' | 'restricted' | 'off';

  CACHE_PURGE_API_KEY?: string;

  SENTRY_DSN?: string;

  /**
   * The {@link Provider} that is used first
   */
  PRIMARY_PROVIDER: 'r2' | 'origin';

  /**
   * The {@link Provider} used if the {@link PRIMARY_PROVIDER} fails
   */
  FALLBACK_PROVIDER?: 'origin';

  ORIGIN_HOST: string;
}
