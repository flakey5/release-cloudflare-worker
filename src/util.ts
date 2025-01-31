import {
  API_PATH_PREFIX,
  DIST_PATH_PREFIX,
  DOCS_PATH_PREFIX,
  DOWNLOAD_PATH_PREFIX,
} from './constants/r2Prefixes';
import { Env } from './env';

const units = ['B', 'KB', 'MB', 'GB', 'TB'];

/**
 * @param env Worker env
 * @returns True if we want to either cache files or
 *  directory listings
 */
export function isCacheEnabled(env: Env): boolean {
  return (
    env.FILE_CACHE_CONTROL !== 'no-store' ||
    env.DIRECTORY_CACHE_CONTROL !== 'no-store'
  );
}

/**
 * @param request Request object
 * @returns {@link URL} instance if url is valid, a 400
 *  response otherwise
 */
export function parseUrl(request: Request): URL | undefined {
  let url: URL | undefined = undefined;
  try {
    url = new URL(request.url);
  } catch (e) {
    console.error(e);
  }

  return url;
}

/**
 * Maps a path in a url to the path to the resource
 *  in the R2 bucket
 * @param url Url to map
 * @param env Worker env
 * @returns Mapped path if the resource is accessible, undefined
 *  if the eyeball should not be trying to access the resource
 */
export function mapUrlPathToBucketPath(
  url: URL,
  env: Pick<Env, 'DIRECTORY_LISTING'>
): string | undefined {
  const urlToBucketPathMap: Record<string, string> = {
    dist: DIST_PATH_PREFIX + url.pathname.substring(5),
    download: DOWNLOAD_PATH_PREFIX + url.pathname.substring(9),
    docs: DOCS_PATH_PREFIX + url.pathname.substring(5),
    api: API_PATH_PREFIX + url.pathname.substring(4),
    metrics: url.pathname.substring(1), // substring to cut off the /
  };

  // Example: /docs/asd/123
  let bucketPath: string | undefined = undefined;
  const splitPath = url.pathname.split('/'); // ['', 'docs', 'asd', '123']
  const basePath = splitPath[1]; // 'docs'
  if (basePath in urlToBucketPathMap) {
    bucketPath = urlToBucketPathMap[basePath];
  } else if (env.DIRECTORY_LISTING !== 'restricted') {
    bucketPath = url.pathname.substring(1);
  }

  return bucketPath !== undefined ? decodeURIComponent(bucketPath) : undefined;
}

/**
 * Maps a path in the R2 bucket to the urls used to access it
 * @param bucketPath Path to map
 * @param env Worker env
 * @returns All possible url paths that lead to that resource,
 *  or undefined if it's inaccessible from a url path
 */
export function mapBucketPathToUrlPath(
  bucketPath: string,
  env: Pick<Env, 'DIRECTORY_LISTING'>
): string[] | undefined {
  if (bucketPath.startsWith(DIST_PATH_PREFIX)) {
    const path = bucketPath.substring(15);
    return [`/dist${path}`, `/download/releases${path}`];
  } else if (bucketPath.startsWith(API_PATH_PREFIX)) {
    const path = bucketPath.substring(22);
    return [`/api${path}`, `/docs/latest/api${path}`];
  } else if (bucketPath.startsWith(DOCS_PATH_PREFIX)) {
    return [`/docs${bucketPath.substring(11)}`];
  } else if (bucketPath.startsWith(DOWNLOAD_PATH_PREFIX)) {
    return [`/download${bucketPath.substring(6)}`];
  } else if (bucketPath.startsWith('metrics')) {
    return ['/' + bucketPath];
  }

  return env.DIRECTORY_LISTING === 'restricted'
    ? undefined
    : ['/' + bucketPath];
}

/**
 * Checks if a R2 path is for a directory or not.
 *  If a path ends in a `/` or there's no file
 *  extension, it's considered a directory path
 * @param path Path to check
 * @returns True if it's for a directory
 */
export function isDirectoryPath(path: string): boolean {
  // `path.lastIndexOf('.') == -1` is a Node-specific
  //  heuristic here. There aren't any files that don't
  //  have file extensions, so, if there are no file extensions
  //  specified in the url, treat it like a directory.
  return path[path.length - 1] == '/' || path.lastIndexOf('.') == -1;
}

/**
 * Converts raw size into readable bytes
 * @param bytes Bytes
 * @returns Something like `4.5 KB` or `8.7 MB`
 */
export function niceBytes(bytes: number): string {
  let l = 0;
  let n = parseInt(bytes.toString(), 10) || 0;

  while (n >= 1000 && ++l) {
    n = n / 1000;
  }

  return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
}

/**
 * Checks whether or not an R2 object
 *  or R2ObjectBody has a body
 * @param object R2 object
 * @returns True if it has a body
 */
export function objectHasBody(
  object: R2Object | R2ObjectBody
): object is R2ObjectBody {
  return (<R2ObjectBody>object).body !== undefined;
}
