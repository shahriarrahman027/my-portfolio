import type { APIRoute } from 'astro';
import { createLogoutCookieHeader } from '@/lib/auth';

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ success: true, redirect: '/admin/login' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': createLogoutCookieHeader(),
    },
  });
};

export const GET: APIRoute = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin/login',
      'Set-Cookie': createLogoutCookieHeader(),
    },
  });
};

