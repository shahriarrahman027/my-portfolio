import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { isAuthenticated } from '@/lib/auth';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'application/pdf',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const POST: APIRoute = async ({ request }) => {
  // Authorization check
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Administrative session required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return new Response(
        JSON.stringify({ error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WEBP, AVIF, PDF.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: 'File size exceeds maximum 10MB limit.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine extension
    let ext = path.extname(file.name).toLowerCase();
    if (!ext) {
      if (file.type === 'image/jpeg') ext = '.jpg';
      else if (file.type === 'image/png') ext = '.png';
      else if (file.type === 'image/webp') ext = '.webp';
      else if (file.type === 'image/avif') ext = '.avif';
      else if (file.type === 'application/pdf') ext = '.pdf';
    }

    const uniqueName = `upload-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const targetPath = path.join(uploadDir, uniqueName);
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(arrayBuffer));

    return new Response(
      JSON.stringify({
        success: true,
        url: `/uploads/${uniqueName}`,
        filename: uniqueName,
        size: file.size,
        type: file.type,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('File upload error:', err);
    return new Response(JSON.stringify({ error: 'Failed to process file upload.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

