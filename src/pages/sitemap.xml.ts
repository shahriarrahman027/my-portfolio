import type { APIRoute } from 'astro';
import { getProjects, getWritings, getBlogPosts } from '@/lib/content';

export const GET: APIRoute = async ({ url }) => {
  const origin = url.origin;
  const staticPaths = [
    '/en',
    '/bn',
    '/en/about',
    '/bn/about',
    '/en/technology',
    '/bn/technology',
    '/en/writing',
    '/bn/writing',
    '/en/photography',
    '/bn/photography',
    '/en/blog',
    '/bn/blog',
    '/en/reading',
    '/bn/reading',
    '/en/now',
    '/bn/now',
    '/en/resume',
    '/bn/resume',
    '/en/contact',
    '/bn/contact',
  ];

  const projects = getProjects(false);
  const writings = getWritings(undefined, false);
  const blogPosts = getBlogPosts(undefined, false);

  const dynamicPaths: string[] = [];

  for (const p of projects) {
    dynamicPaths.push(`/en/technology#${p.slug}`);
    dynamicPaths.push(`/bn/technology#${p.slug}`);
  }

  for (const w of writings) {
    dynamicPaths.push(`/${w.language}/writing/${w.slug}`);
  }

  for (const b of blogPosts) {
    dynamicPaths.push(`/${b.language}/blog/${b.slug}`);
  }

  const allUrls = [...staticPaths, ...dynamicPaths];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (path) => `  <url>
    <loc>${origin}${path}</loc>
    <changefreq>weekly</changefreq>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

