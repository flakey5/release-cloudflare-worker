import badRequest from '../responses/badRequest';
import { parseUrl } from '../utils/request';
import { Handler } from './handler';

const postHandler: Handler = async (request, ctx) => {
  const url = parseUrl(request);

  if (url === undefined) {
    return badRequest();
  }

  if (url.pathname === '/_cf/cache-purge') {
  }

  return new Response(undefined, { status: 404 });
};

export default postHandler;
