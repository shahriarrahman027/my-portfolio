import type { APIRoute } from 'astro';
import { verifyAdminPassword, createSessionToken, createSessionCookieHeader } from '@/lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    let password = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      password = body.password || '';
    } else {
      const formData = await request.formData();
      password = (formData.get('password') as string) || '';
    }

    if (!verifyAdminPassword(password)) {
      return new Response(JSON.stringify({ error: 'Invalid administrative password.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = createSessionToken();
    const cookie = createSessionCookieHeader(token);

    return new Response(JSON.stringify({ success: true, redirect: '/admin/dashboard' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return new Response(JSON.stringify({ error: 'Server authentication error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
