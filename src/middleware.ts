import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Root redirect to default locale
  if (pathname === '/' || pathname === '') {
    return context.redirect('/en');
  }

  return next();
});
