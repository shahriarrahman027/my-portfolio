# Shahriar Rahman — Personal Platform & Creative Archive

A production-quality personal platform and creative publication connecting computer science, artificial intelligence research, literature, photography, and storytelling.

Built with **Astro**, **TypeScript**, **React**, and **CSS Design Tokens**, engineered to deploy at **zero cost** on the **Vercel Free Tier**.

---

## ✦ Core Design & Architectural Tenets

- **Literary & Cinematic Editorial Identity**: Distinctive typography using *Newsreader* for display and *Hind Siliguri* for Bengali, paired with warm off-whites, deep charcoal surfaces, and restrained forest green accents.
- **Zero Budget & Zero Paid Dependencies**: Runs completely within free tiers (Vercel serverless, public GitHub API, zero paid AI/CMS subscriptions).
- **First-Class Bilingual Architecture**: Native English (`/en/`) and Bengali (`/bn/`) routes with synchronized language switcher (`EN | বাংলা`) preserving route context and supporting asymmetric content (e.g. a Bengali novel excerpt without forcing an English duplicate).
- **Private Administrative Dashboard**: Protected via timing-safe HMAC-SHA256 session authentication (`/admin`), featuring drafts vs. published toggles, media and résumé uploads, and bilingual editing.
- **Visual Journal & Photography**: Editorial photograph presentation with EXIF exposure data, collection filtering, and an accessible, keyboard-navigable Lightbox.
- **Longform Reading Experience**: Lightweight reading progress indicator for essays and novel chapters without scroll jank.
- **Strict Content Honesty**: Zero fabricated qualifications, projects, or statistics. All incomplete sections display intentional, restrained empty states.

---

## ✦ Site Structure

| Route | Content & Experience |
| :--- | :--- |
| `/[lang]/` | Editorial Hero, Glimpse of My World, Selected Projects, Writing, Visual Journal, Journey, Now, and Contact |
| `/[lang]/about` | Personal story, academic path at Daffodil International University, AI ambitions, SynitySoft leadership, and timeline |
| `/[lang]/technology` | Project case studies (problem, approach, contribution, tech tags, demo/repo links) and live GitHub integration |
| `/[lang]/writing` | Writing library (short stories, novel manuscripts, essays, poetry) with category filters |
| `/[lang]/writing/[slug]` | Dedicated reading experience with top reading progress indicator and typography |
| `/[lang]/photography` | Observational visual journal, collections, camera/lens/location metadata, and full lightbox |
| `/[lang]/blog` | Essays on Technology & AI, Books & Literature, and Films & Storytelling |
| `/[lang]/reading` | Curated reading shelf with reading status and personal reflections |
| `/[lang]/now` | Derek Sivers-inspired public log of active studies, research topics, and creative work |
| `/[lang]/resume` | Semantic, print-friendly CV with verified education, SynitySoft leadership, and downloadable PDF link |
| `/[lang]/contact` | Direct communication channels + validated form with honeypot spam protection and secure message archiving |
| `/admin` | Private administrative dashboard for content creation, publication state, and media uploads |

---

## ✦ Quick Start & Local Development

### 1. Requirements
- Node.js `v20+` or `v22+`
- npm `v10+`

### 2. Installation
```bash
# Clone repository
git clone https://github.com/shahriar-rahman/portfolio.git
cd portfolio

# Install dependencies
npm install
```

### 3. Local Development
```bash
# Start local development server
npm run dev
```
Open [http://localhost:4321](http://localhost:4321) to view the site.

### 4. Running Verification Tests
```bash
# Run unit & security tests
npm test

# Run Astro typecheck
npx astro check

# Build production bundle
npm run build
```

---

## ✦ Private Admin Dashboard

1. Navigate to `/admin` or `/admin/login`.
2. Enter your administrative secret (defaults to `shahriar-creative-platform-2026` in local development if `ADMIN_SECRET` is unset).
3. Manage projects, stories, photographs, books, timeline milestones, and now-page items.
4. **Draft Privacy**: Content saved as a draft is never returned by public endpoints or the search index. Only items explicitly marked *Published* appear on the live site.

---

## ✦ Zero-Cost Deployment to Vercel

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: complete shahriar rahman platform"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com/) (Hobby / Free Tier).
3. Click **Add New Project** and select this repository.
4. Under **Environment Variables**, add:
   - `ADMIN_SECRET`: Your secure custom administrative password.
   - `GITHUB_USERNAME`: `shahriar-rahman` (or your GitHub handle).
5. Deploy! Vercel automatically detects Astro and the `@astrojs/vercel` serverless adapter.
6. The site will be live immediately on your free Vercel domain (`*.vercel.app`).
7. **Custom Domain**: When you purchase `shahriarrahman.com` in the future, simply add it in the Vercel Project Settings under **Domains** — no code changes required!

---

## ✦ Backup & Portability

All content and media references are stored in `data/content.json` and `public/uploads/`.
- To back up your entire website, simply commit or export the `data/` and `public/uploads/` folders.
- Cloud DB Option: If you ever want to connect a free cloud PostgreSQL database (e.g. Supabase), configure `PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`.

