import type { APIRoute } from 'astro';
import { saveContactSubmission } from '@/lib/content';

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    let name = '';
    let email = '';
    let subject = '';
    let message = '';
    let honeypot = '';

    if (contentType.includes('application/json')) {
      const data = await request.json();
      name = (data.name || '').trim();
      email = (data.email || '').trim();
      subject = (data.subject || '').trim();
      message = (data.message || '').trim();
      honeypot = (data.hp || '').trim();
    } else {
      const formData = await request.formData();
      name = (formData.get('name') as string || '').trim();
      email = (formData.get('email') as string || '').trim();
      subject = (formData.get('subject') as string || '').trim();
      message = (formData.get('message') as string || '').trim();
      honeypot = (formData.get('hp') as string || '').trim();
    }

    // Spam honeypot detection
    if (honeypot) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Server-side validation
    if (!name || name.length < 2 || name.length > 100) {
      return new Response(JSON.stringify({ error: 'Please enter a valid name (2-100 characters).' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 150) {
      return new Response(JSON.stringify({ error: 'Please provide a valid email address.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!message || message.length < 5 || message.length > 5000) {
      return new Response(JSON.stringify({ error: 'Message must be between 5 and 5000 characters.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Securely archive the submission in the database/admin store
    const submission = saveContactSubmission({
      name,
      email,
      subject: subject || undefined,
      message,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your message has been securely recorded and received.',
        id: submission.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(
      JSON.stringify({ error: 'Server error processing contact request.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
