import { FILE_NOT_FOUND } from '../constants/commonResponses';
import { Env } from '../env';

/**
 * Check if a path is for a directory or not.
 *  If the path ends in a `/` or there's no file extension, it's considered a
 *  directory path
 */
export function isDirectoryPath(path: string): boolean {
  return hasTrailingSlash(path) || isExtensionless(path);
}

export function hasTrailingSlash(path: string): boolean {
  return false;
}

export function isExtensionless(path: string): boolean {
  return false;
}

export function enforceDirectoryPathRestrictions(
  url: URL,
  request: Request,
  env: Pick<Env, 'DIRECTORY_LISTING'>
): Response | undefined {
  if (env.DIRECTORY_LISTING === 'off') {
    return FILE_NOT_FOUND(request);
  }

  if (!hasTrailingSlash(url.pathname)) {
    // We always want to have trailing slashes for a directory URL
    url.pathname += '/';

    return Response.redirect(url.toString(), 301);
  }

  return undefined;
}
