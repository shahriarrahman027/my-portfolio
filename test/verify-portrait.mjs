import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Portrait assets exist and are valid', () => {
  const webpPath = path.resolve(process.cwd(), 'public/images/profile/shahriar-rahman.webp');
  const jpgPath = path.resolve(process.cwd(), 'public/images/profile/shahriar-rahman.jpg');

  assert.strictEqual(fs.existsSync(webpPath), true, 'WebP portrait must exist on disk');
  assert.strictEqual(fs.existsSync(jpgPath), true, 'JPG portrait must exist on disk');

  const webpStats = fs.statSync(webpPath);
  const jpgStats = fs.statSync(jpgPath);

  assert.ok(webpStats.size > 10000, 'WebP portrait should be a non-trivial optimized image');
  assert.ok(jpgStats.size > 10000, 'JPG portrait should be a non-trivial optimized image');
});

test('Content profile references portraitUrl', () => {
  const content = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'data/content.json'), 'utf-8'));
  assert.strictEqual(content.profile.portraitUrl, '/images/profile/shahriar-rahman.webp');
  assert.strictEqual(content.profile.name, 'Shahriar Rahman');
  assert.strictEqual(content.profile.githubUsername, 'shahriarrahman027');
  assert.strictEqual(content.profile.email, 'mdshahriar.contact@gmail.com');
});

test('HomePage and AboutPage contain portrait markup with correct alt text and dimensions', () => {
  const homeAstro = fs.readFileSync(path.resolve(process.cwd(), 'src/components/pages/HomePage.astro'), 'utf-8');
  const aboutAstro = fs.readFileSync(path.resolve(process.cwd(), 'src/components/pages/AboutPage.astro'), 'utf-8');

  // Verify alt text
  assert.ok(homeAstro.includes("alt={locale === 'bn' ? 'শাহরিয়ার রহমানের প্রতিকৃতি' : 'Portrait of Shahriar Rahman'}"));
  assert.ok(aboutAstro.includes("alt={locale === 'bn' ? 'শাহরিয়ার রহমানের প্রতিকৃতি' : 'Portrait of Shahriar Rahman'}"));

  // Verify explicit dimensions for CLS prevention
  assert.ok(homeAstro.includes('width="819"'));
  assert.ok(homeAstro.includes('height="1024"'));
  assert.ok(aboutAstro.includes('width="819"'));
  assert.ok(aboutAstro.includes('height="1024"'));

  // Verify WebP source element
  assert.ok(homeAstro.includes('type="image/webp"'));
  assert.ok(aboutAstro.includes('type="image/webp"'));

  // Verify graceful placeholder fallback
  assert.ok(homeAstro.includes('portrait-placeholder'));
  assert.ok(aboutAstro.includes('about-portrait-placeholder'));

  // Verify reduced motion handling
  assert.ok(homeAstro.includes('prefers-reduced-motion: reduce'));
  assert.ok(aboutAstro.includes('prefers-reduced-motion: reduce'));
});
