import { headDirectory } from '../actions/directory';
import { headFile } from '../actions/file';
import badRequest from '../responses/badRequest';
import { isDirectoryPath } from '../utils/path';
import { parseUrl } from '../utils/request';
import { Handler } from './handler';

const headHandler: Handler = async (request, ctx) => {
  const url = parseUrl(request);

  if (url === undefined) {
    return badRequest();
  }

  const isPathADirecotory = isDirectoryPath(url.pathname);

  const response = isPathADirecotory
    ? await headDirectory(url, request, ctx)
    : await headFile(url, request, ctx);

  return response;
};

export default headHandler;
