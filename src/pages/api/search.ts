import type { APIRoute } from 'astro';
import { searchContent } from '@/lib/content';
import type { Locale } from '@/types';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q') || '';
  const locale = (url.searchParams.get('locale') || 'en') as Locale;

  const results = searchContent(q, locale);

  return new Response(JSON.stringify({ results }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
  });
};

