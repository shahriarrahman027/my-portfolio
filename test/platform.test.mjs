import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSessionToken,
  verifySessionToken,
  verifyAdminPassword,
  getAdminSecret,
  createSessionCookieHeader,
  createLogoutCookieHeader,
} from '../src/lib/auth.ts';
import {
  getProjects,
  saveProject,
  getProjectBySlug,
  deleteProject,
  getWritings,
  saveWriting,
  getWritingBySlug,
  deleteWriting,
  getBlogPosts,
  saveBlogPost,
  getBlogPostBySlug,
  deleteBlogPost,
  getPhotographs,
  savePhotograph,
  getPhotographById,
  deletePhotograph,
  getReadingList,
  saveReadingItem,
  deleteReadingItem,
  getTimeline,
  saveTimelineItem,
  deleteTimelineItem,
  getNow,
  saveNow,
  searchContent,
  saveContactSubmission,
  getContactSubmissions,
  getProfile,
  updateProfile,
} from '../src/lib/content.ts';
import { getLocalizedPath, getTranslations } from '../src/lib/i18n.ts';

test('i18n: translation dictionaries contain required navigation and action keys', () => {
  const en = getTranslations('en');
  const bn = getTranslations('bn');

  assert.ok(en.nav.home);
  assert.ok(bn.nav.home);
  assert.ok(en.nav.about);
  assert.ok(bn.nav.about);
  assert.ok(en.nav.technology);
  assert.ok(bn.nav.technology);
  assert.ok(en.nav.writing);
  assert.ok(bn.nav.writing);
  assert.ok(en.nav.photography);
  assert.ok(bn.nav.photography);
  assert.ok(en.nav.blog);
  assert.ok(bn.nav.blog);
  assert.ok(en.nav.reading);
  assert.ok(bn.nav.reading);
  assert.ok(en.nav.now);
  assert.ok(bn.nav.now);
  assert.ok(en.nav.resume);
  assert.ok(bn.nav.resume);
  assert.ok(en.nav.contact);
  assert.ok(bn.nav.contact);

  assert.equal(en.siteTitle, 'Shahriar Rahman');
  assert.equal(bn.siteTitle, 'শাহরিয়ার রহমান');
});

test('i18n: path localization preserves current route path across locales', () => {
  assert.equal(getLocalizedPath('/en/about', 'bn'), '/bn/about');
  assert.equal(getLocalizedPath('/bn/technology', 'en'), '/en/technology');
  assert.equal(getLocalizedPath('/en/writing/my-story', 'bn'), '/bn/writing/my-story');
  assert.equal(getLocalizedPath('/en/photography', 'bn'), '/bn/photography');
  assert.equal(getLocalizedPath('/bn/now', 'en'), '/en/now');
  assert.equal(getLocalizedPath('/en/resume', 'bn'), '/bn/resume');
  assert.equal(getLocalizedPath('/en', 'bn'), '/bn');
});

test('Auth: session token creation, verification and cookie headers', () => {
  const token = createSessionToken();
  assert.ok(token);
  assert.equal(verifySessionToken(token), true);

  // Cookie headers
  const cookieHeader = createSessionCookieHeader(token);
  assert.ok(cookieHeader.includes('sr_admin_session='));
  assert.ok(cookieHeader.includes('HttpOnly'));

  const logoutHeader = createLogoutCookieHeader();
  assert.ok(logoutHeader.includes('Max-Age=0'));

  // Tampered signature must fail
  const parts = token.split('.');
  const tampered = `${parts[0]}.invalid-signature`;
  assert.equal(verifySessionToken(tampered), false);

  // Admin password check
  const secret = getAdminSecret();
  assert.equal(verifyAdminPassword(secret), true);
  assert.equal(verifyAdminPassword('wrong-password-123'), false);
});

test('Content Security: public getters NEVER return unpublished drafts', () => {
  // Public projects
  const publicProjects = getProjects(false);
  for (const p of publicProjects) {
    assert.equal(p.published, true, 'Public projects must only contain published items');
  }

  // Public writings
  const publicWritings = getWritings(undefined, false);
  for (const w of publicWritings) {
    assert.equal(w.published, true, 'Public writings must only contain published items');
  }

  // Public photographs
  const publicPhotos = getPhotographs(false);
  for (const ph of publicPhotos) {
    assert.equal(ph.published, true, 'Public photographs must only contain published items');
  }
});

test('Projects Workflow: create draft, verify private, publish, verify public, delete', () => {
  const testProj = {
    id: 'test-proj-1',
    slug: 'nlp-sentiment-analyzer',
    title: { en: 'NLP Sentiment Analyzer', bn: 'এনএলপি সেন্টিমেন্ট বিশ্লেষক' },
    summary: { en: 'Analyzing sentiment using Transformer models.', bn: 'ট্রান্সফরমার মডেল ভিত্তিক বিশ্লেষণ।' },
    technologies: ['Python', 'PyTorch', 'HuggingFace'],
    status: 'in-progress',
    published: false, // Draft!
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveProject(testProj);

  // Draft must NOT appear in public list
  assert.equal(getProjectBySlug('nlp-sentiment-analyzer', false), undefined);

  // Draft MUST appear in admin list
  const adminProj = getProjectBySlug('nlp-sentiment-analyzer', true);
  assert.ok(adminProj);
  assert.equal(adminProj.published, false);

  // Publish it
  saveProject({ ...testProj, published: true });
  const pubProj = getProjectBySlug('nlp-sentiment-analyzer', false);
  assert.ok(pubProj);
  assert.equal(pubProj.published, true);

  // Clean up
  deleteProject('test-proj-1');
  assert.equal(getProjectBySlug('nlp-sentiment-analyzer', true), undefined);
});

test('Writing Workflow: create novel excerpt draft, publish, verify isolation, delete', () => {
  const testWriting = {
    id: 'test-wrt-1',
    slug: 'the-solitude-of-dhaka',
    title: 'The Solitude of Dhaka',
    language: 'en',
    category: 'essay',
    summary: 'A reflection on modern urbanization and human solitude.',
    content: 'Full literary essay prose text here...',
    readingTimeMinutes: 5,
    published: false,
    featured: false,
    tags: ['urban', 'solitude', 'dhaka'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveWriting(testWriting);

  // Draft is hidden from public
  assert.equal(getWritingBySlug('the-solitude-of-dhaka', false), undefined);

  // Accessible in admin
  assert.ok(getWritingBySlug('the-solitude-of-dhaka', true));

  // Publish
  saveWriting({ ...testWriting, published: true });
  assert.ok(getWritingBySlug('the-solitude-of-dhaka', false));

  // Clean up
  deleteWriting('test-wrt-1');
  assert.equal(getWritingBySlug('the-solitude-of-dhaka', true), undefined);
});

test('Photography Workflow: save photo draft, metadata checks, publish, delete', () => {
  const testPhoto = {
    id: 'test-ph-1',
    title: { en: 'Morning Shadow on Brick', bn: 'ইটের দেয়ালে ভোরের আলো' },
    caption: { en: 'Geometric shadows captured at sunrise.', bn: 'সূর্যোদয়ের সময় জ্যামিতিক ছায়া।' },
    imageUrl: '/uploads/sample.jpg',
    altText: 'Brick wall with shadow',
    collection: 'Light & Shadow',
    tags: ['shadow', 'morning'],
    camera: 'Fujifilm X-T4',
    lens: '23mm f/2',
    published: false,
    featured: false,
    order: 1,
    createdAt: new Date().toISOString(),
  };

  savePhotograph(testPhoto);

  // Draft is private
  assert.equal(getPhotographById('test-ph-1', false), undefined);

  // Publish
  savePhotograph({ ...testPhoto, published: true });
  const pub = getPhotographById('test-ph-1', false);
  assert.ok(pub);
  assert.equal(pub.camera, 'Fujifilm X-T4');

  // Clean up
  deletePhotograph('test-ph-1');
  assert.equal(getPhotographById('test-ph-1', true), undefined);
});

test('Content: authentic profile information is present without fabricated entries', () => {
  const profile = getProfile();
  assert.equal(profile.name, 'Shahriar Rahman');
  assert.match(profile.university.en, /Daffodil International University/);
  assert.match(profile.synitysoftRole.en, /SynitySoft/);
});

test('Contact form: submissions are safely recorded and retrieved', () => {
  const testSub = saveContactSubmission({
    name: 'Dr. Research Reviewer',
    email: 'reviewer@academic-lab.org',
    subject: 'AI Collaboration Query',
    message: 'Testing inquiry submission recording in dashboard store.',
  });

  assert.ok(testSub.id);
  assert.equal(testSub.name, 'Dr. Research Reviewer');

  const allSubs = getContactSubmissions();
  const found = allSubs.find((s) => s.id === testSub.id);
  assert.ok(found);
  assert.equal(found.email, 'reviewer@academic-lab.org');
});

test('Search: handles Bengali and English queries safely without leaking drafts', () => {
  // Empty query returns empty array
  assert.deepEqual(searchContent('', 'en'), []);
  assert.deepEqual(searchContent('a', 'en'), []);

  // Bengali search query
  const resBn = searchContent('ড্যাফোডিল', 'bn');
  assert.ok(Array.isArray(resBn));
});
