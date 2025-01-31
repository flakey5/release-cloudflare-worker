export interface Env {
  /**
   * R2 bucket we read from
   */
  R2_BUCKET: R2Bucket;
  /**
   * Directory listing toggle
   *  on - Enabled for all paths
   *  restricted - Directory listing enabled only for paths we want to be listed
   *  off - No directory
   * In prod, this should *always* be restricted
   */
  DIRECTORY_LISTING: 'on' | 'restricted' | 'off';
  /**
   * Api key for /_cf/cache-purge. If undefined, the endpoint is disabled.
   */
  CACHE_PURGE_API_KEY?: string;
  /**
   * Cache control header for files
   */
  FILE_CACHE_CONTROL: string;
  /**
   * Cache control header for directory listing
   */
  DIRECTORY_CACHE_CONTROL: string;
}
