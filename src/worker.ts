import { Toucan } from 'toucan-js';
import { Env } from './env';
import { Context } from './context';
import renderInternalServerError from './responses/internalServerError';
import { METHOD_NOT_ALLOWED } from './constants/commonResponses';
import handlers from './handlers';

interface Worker {
  /**
   * Worker entrypoint
   * @see https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#syntax-es-modules
   */
  fetch: (r: Request, e: Env, c: ExecutionContext) => Promise<Response>;
}

const cloudflareWorker: Worker = {
  fetch: async (request, env, execution) => {
    const sentry = new Toucan({
      dsn: env.SENTRY_DSN,
      request,
      context: execution,
      requestDataOptions: {
        allowedHeaders: true,
        allowedIps: true,
      },
    });

    try {
      const ctx: Context = {
        env,
        execution,
        sentry,
      };

      switch (request.method) {
        case 'GET':
          return await handlers.get(request, ctx);
        case 'HEAD':
          return await handlers.head(request, ctx);
        case 'POST':
          return await handlers.post(request, ctx);
        case 'OPTIONS':
          return await handlers.options(request, ctx);
        default:
          return METHOD_NOT_ALLOWED;
      }
    } catch (e) {
      sentry.captureException(e);

      return renderInternalServerError(e, env);
    }
  },
};

export default cloudflareWorker;
