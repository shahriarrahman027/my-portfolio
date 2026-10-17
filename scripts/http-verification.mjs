import assert from 'node:assert/strict';

const BASE = 'http://localhost:4321';

async function runHttpTests() {
  console.log('Testing live server endpoints at ' + BASE);

  // 1. Root redirect
  const rootRes = await fetch(`${BASE}/`, { redirect: 'manual' });
  console.log(`- GET / => status ${rootRes.status} (Location: ${rootRes.headers.get('location')})`);
  assert.ok([301, 302, 307, 308].includes(rootRes.status));

  // 2. English Home
  const enHome = await fetch(`${BASE}/en`);
  const enHtml = await enHome.text();
  console.log(`- GET /en => status ${enHome.status}`);
  assert.equal(enHome.status, 200);
  assert.match(enHtml, /Shahriar Rahman/);
  assert.match(enHtml, /A Glimpse of My World/);
  assert.match(enHtml, /lang="en"/);

  // 3. Bengali Home
  const bnHome = await fetch(`${BASE}/bn`);
  const bnHtml = await bnHome.text();
  console.log(`- GET /bn => status ${bnHome.status}`);
  assert.equal(bnHome.status, 200);
  assert.match(bnHtml, /শাহরিয়ার রহমান/);
  assert.match(bnHtml, /আমার জগত একনজরে/);
  assert.match(bnHtml, /lang="bn"/);

  // 4. About pages (EN & BN)
  const enAbout = await fetch(`${BASE}/en/about`);
  assert.equal(enAbout.status, 200);
  const bnAbout = await fetch(`${BASE}/bn/about`);
  assert.equal(bnAbout.status, 200);
  console.log('- GET /en/about and /bn/about => 200 OK');

  // 5. Technology pages (EN & BN)
  const enTech = await fetch(`${BASE}/en/technology`);
  assert.equal(enTech.status, 200);
  const bnTech = await fetch(`${BASE}/bn/technology`);
  assert.equal(bnTech.status, 200);
  console.log('- GET /en/technology and /bn/technology => 200 OK');

  // 6. Writing Library
  const enWriting = await fetch(`${BASE}/en/writing`);
  assert.equal(enWriting.status, 200);
  const bnWriting = await fetch(`${BASE}/bn/writing`);
  assert.equal(bnWriting.status, 200);
  console.log('- GET /en/writing and /bn/writing => 200 OK');

  // 7. Photography & Visual Journal
  const enPhoto = await fetch(`${BASE}/en/photography`);
  assert.equal(enPhoto.status, 200);
  const bnPhoto = await fetch(`${BASE}/bn/photography`);
  assert.equal(bnPhoto.status, 200);
  console.log('- GET /en/photography and /bn/photography => 200 OK');

  // 8. Blog & Publishing
  const enBlog = await fetch(`${BASE}/en/blog`);
  assert.equal(enBlog.status, 200);
  const bnBlog = await fetch(`${BASE}/bn/blog`);
  assert.equal(bnBlog.status, 200);
  console.log('- GET /en/blog and /bn/blog => 200 OK');

  // 9. Reading list, Now, Resume, Contact
  for (const path of ['reading', 'now', 'resume', 'contact']) {
    const resEn = await fetch(`${BASE}/en/${path}`);
    const resBn = await fetch(`${BASE}/bn/${path}`);
    assert.equal(resEn.status, 200, `/en/${path} must return 200`);
    assert.equal(resBn.status, 200, `/bn/${path} must return 200`);
    console.log(`- GET /en/${path} & /bn/${path} => 200 OK`);
  }

  // 10. Sitemap and Robots
  const sitemap = await fetch(`${BASE}/sitemap.xml`);
  assert.equal(sitemap.status, 200);
  const sitemapXml = await sitemap.text();
  assert.match(sitemapXml, /<urlset/);
  console.log('- GET /sitemap.xml => 200 XML');

  const robots = await fetch(`${BASE}/robots.txt`);
  assert.equal(robots.status, 200);
  console.log('- GET /robots.txt => 200 text');

  // 11. Search API
  const searchRes = await fetch(`${BASE}/api/search?q=technology&locale=en`);
  assert.equal(searchRes.status, 200);
  const searchJson = await searchRes.json();
  assert.ok(Array.isArray(searchJson.results));
  console.log('- GET /api/search => 200 JSON');

  // 12. Contact API Form Submission
  const contactRes = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Academic Reviewer',
      email: 'reviewer@university.edu',
      subject: 'AI Research Collaboration',
      message: 'Hello Shahriar, impressed with your work in NLP and machine reasoning.',
    }),
  });
  assert.equal(contactRes.status, 200);
  const contactJson = await contactRes.json();
  assert.equal(contactJson.success, true);
  console.log('- POST /api/contact => 200 Success recorded');

  // 13. Admin Auth Protection (unauthorized access to /admin/dashboard must redirect to /admin/login)
  const dashRes = await fetch(`${BASE}/admin/dashboard`, { redirect: 'manual' });
  console.log(`- GET /admin/dashboard without auth => status ${dashRes.status} (Location: ${dashRes.headers.get('location')})`);
  assert.ok([302, 307].includes(dashRes.status));
  assert.equal(dashRes.headers.get('location'), '/admin/login');

  // 14. Admin Login with incorrect password => 401
  const badLogin = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'wrong' }),
  });
  assert.equal(badLogin.status, 401);
  console.log('- POST /api/admin/login with invalid password => 401 Unauthorized');

  // 15. Admin Login with valid password => 200 with Set-Cookie
  const goodLogin = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'shahriar-creative-platform-2026' }),
  });
  assert.equal(goodLogin.status, 200);
  const cookie = goodLogin.headers.get('set-cookie');
  assert.ok(cookie && cookie.includes('sr_admin_session='));
  console.log('- POST /api/admin/login with valid password => 200 OK + Set-Cookie');

  // 16. Admin Content API with valid session cookie => 200
  const authedContent = await fetch(`${BASE}/api/admin/content`, {
    headers: { Cookie: cookie },
  });
  assert.equal(authedContent.status, 200);
  const authedJson = await authedContent.json();
  assert.ok(authedJson.profile);
  console.log('- GET /api/admin/content with authenticated cookie => 200 OK');

  console.log('\nAll 16 live HTTP server tests passed successfully!');
}

runHttpTests().catch((err) => {
  console.error('HTTP Test Failure:', err);
  process.exit(1);
});
