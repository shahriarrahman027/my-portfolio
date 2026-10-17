import crypto from 'node:crypto';

// Get admin password/secret from environment or fallback for initial setup
export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'shahriar-creative-platform-2026';
}

const COOKIE_NAME = 'sr_admin_session';
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function verifyAdminPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  const secret = getAdminSecret();
  // Timing-safe comparison to prevent timing attacks
  const bufA = Buffer.from(password);
  const bufB = Buffer.from(secret);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSessionToken(): string {
  const secret = getAdminSecret();
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(timestamp)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check expiration (24 hours)
  if (Date.now() - timestamp > SESSION_MAX_AGE_MS || timestamp > Date.now() + 5000) {
    return false;
  }

  const secret = getAdminSecret();
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(timestampStr)
    .digest('hex');

  const bufA = Buffer.from(signature);
  const bufB = Buffer.from(expectedSig);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function isAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return false;
  const token = decodeURIComponent(match[1]);
  return verifySessionToken(token);
}

export function createSessionCookieHeader(token: string): string {
  const maxAge = Math.floor(SESSION_MAX_AGE_MS / 1000);
  const isProd = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}`;
}

export function createLogoutCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}
