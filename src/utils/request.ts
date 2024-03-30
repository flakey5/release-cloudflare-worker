import { z } from 'zod';
import { BAD_REQUEST } from '../constants/commonResponses';

export function parseUrl(request: Request): URL | undefined {
  let url: URL | undefined = undefined;

  try {
    url = new URL(request.url);
  } catch (e) {
    console.error(e);
  }

  return url;
}

export async function parseBodyJson<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<z.infer<T> | Response> {
  // Check to see if this is supposed to be json in the first place
  if (request.headers.get('content-type') !== 'application/json') {
    return new Response(undefined, { status: 415 });
  }

  let bodyObject: object;

  try {
    bodyObject = await request.json<object>();
  } catch (e) {
    // content-type header lied to us
    return BAD_REQUEST;
  }

  const parseResult = schema.safeParse(bodyObject);

  if (!parseResult.success) {
    return BAD_REQUEST;
  }

  return parseResult.data;
}
