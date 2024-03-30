import { Context } from '../context';

/**
 * @param request Request object itself
 * @param ctx Worker context
 */
export type Handler = (request: Request, ctx: Context) => Promise<Response>;
