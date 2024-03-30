import { Context } from '../context';
import { OriginProvider } from './originProvider';
import { Provider } from './provider';
import { R2Provider } from './r2Provider';

export function getPrimaryProvider(ctx: Context): Provider {
  switch (ctx.env.PRIMARY_PROVIDER) {
    case 'r2':
      return new R2Provider({
        ctx,
        fallbackProvider: getFallbackProvider(ctx),
      });
    case 'origin':
      return new OriginProvider(ctx);
    default: {
      const exhaustive: never = ctx.env.PRIMARY_PROVIDER;
      throw new Error(`invalid primary producer: ${exhaustive}`);
    }
  }
}

export function getFallbackProvider(ctx: Context): Provider | undefined {
  switch (ctx.env.FALLBACK_PROVIDER) {
    case 'origin':
      return new OriginProvider(ctx);
    case undefined:
      return undefined;
    default: {
      const exhaustive: never = ctx.env.FALLBACK_PROVIDER;
      throw new Error(`invalid fallback producer: ${exhaustive}`);
    }
  }
}
