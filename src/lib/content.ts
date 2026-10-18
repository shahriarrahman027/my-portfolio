import fs from 'node:fs';
import path from 'node:path';
import type {
  SiteDatabase,
  Project,
  Writing,
  BlogPost,
  Photograph,
  ReadingItem,
  TimelineItem,
  Profile,
  ContactSubmission,
  Locale,
} from '@/types';

const DATA_FILE_PATH = path.resolve(process.cwd(), 'data', 'content.json');
const TMP_DATA_FILE_PATH = path.resolve('/tmp', 'shahriar-content.json');

// In-memory cache for fast read performance
let memoryDb: SiteDatabase | null = null;

function loadDatabase(): SiteDatabase {
  if (memoryDb) return memoryDb;
  try {
    // If running in a serverless environment (e.g. Vercel) and /tmp has an updated snapshot, load it
    if (process.env.VERCEL && fs.existsSync(TMP_DATA_FILE_PATH)) {
      const raw = fs.readFileSync(TMP_DATA_FILE_PATH, 'utf-8');
      memoryDb = JSON.parse(raw) as SiteDatabase;
      return memoryDb;
    }
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      memoryDb = JSON.parse(raw) as SiteDatabase;
      return memoryDb;
    }
  } catch (err) {
    console.error('Error reading data/content.json:', err);
  }

  // Fallback defaults
  memoryDb = {
    profile: {
      name: 'Shahriar Rahman',
      titles: { en: 'Computer Science Undergraduate & Aspiring AI Researcher' },
      bio: { en: 'Exploring AI, Literature, and Photography.' },
      longBio: { en: 'Undergraduate at Daffodil International University.' },
      university: { en: 'Daffodil International University, Bangladesh' },
      degree: { en: 'B.Sc. in Computer Science and Engineering' },
      location: { en: 'Dhaka, Bangladesh' },
      synitysoftRole: { en: 'Co-Founder & Board Director, SynitySoft' },
      interests: { ai: [], engineering: [], literature: [], visual: [] },
      ambitions: [],
    },
    projects: [],
    writings: [],
    blogPosts: [],
    photographs: [],
    readingList: [],
    timeline: [],
    now: { updatedAt: new Date().toISOString().split('T')[0], items: [] },
    contactSubmissions: [],
  };
  return memoryDb;
}

export function saveDatabase(db: SiteDatabase): boolean {
  memoryDb = db;
  let saved = false;

  // Primary: write to project data directory (local development)
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
    saved = true;
  } catch (_err) {
    // Expected on read-only serverless filesystems (e.g. Vercel functions)
  }

  // Fallback: write to /tmp in serverless environments
  if (process.env.VERCEL || !saved) {
    try {
      fs.writeFileSync(TMP_DATA_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
      saved = true;
    } catch (tmpErr) {
      console.error('Error writing to /tmp/shahriar-content.json:', tmpErr);
    }
  }

  return saved;
}

/* ==================== PROFILE ==================== */
export function getProfile(): Profile {
  const db = loadDatabase();
  return db.profile;
}

export function updateProfile(profile: Profile): boolean {
  const db = loadDatabase();
  db.profile = profile;
  return saveDatabase(db);
}

/* ==================== PROJECTS ==================== */
export function getProjects(includeDrafts = false): Project[] {
  const db = loadDatabase();
  const list = db.projects || [];
  return includeDrafts ? list : list.filter((p) => p.published);
}

export function getProjectBySlug(slug: string, includeDrafts = false): Project | undefined {
  const list = getProjects(includeDrafts);
  return list.find((p) => p.slug === slug);
}

export function saveProject(project: Project): boolean {
  const db = loadDatabase();
  if (!db.projects) db.projects = [];
  const index = db.projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    db.projects[index] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    db.projects.push({ ...project, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  return saveDatabase(db);
}

export function deleteProject(id: string): boolean {
  const db = loadDatabase();
  db.projects = (db.projects || []).filter((p) => p.id !== id);
  return saveDatabase(db);
}

/* ==================== WRITING ==================== */
export function getWritings(locale?: Locale, includeDrafts = false): Writing[] {
  const db = loadDatabase();
  let list = db.writings || [];
  if (!includeDrafts) {
    list = list.filter((w) => w.published);
  }
  if (locale) {
    list = list.filter((w) => w.language === locale);
  }
  return list;
}

export function getWritingBySlug(slug: string, includeDrafts = false): Writing | undefined {
  const db = loadDatabase();
  const list = includeDrafts ? db.writings || [] : (db.writings || []).filter((w) => w.published);
  return list.find((w) => w.slug === slug);
}

export function saveWriting(writing: Writing): boolean {
  const db = loadDatabase();
  if (!db.writings) db.writings = [];
  const index = db.writings.findIndex((w) => w.id === writing.id);
  if (index >= 0) {
    db.writings[index] = { ...writing, updatedAt: new Date().toISOString() };
  } else {
    db.writings.push({ ...writing, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  return saveDatabase(db);
}

export function deleteWriting(id: string): boolean {
  const db = loadDatabase();
  db.writings = (db.writings || []).filter((w) => w.id !== id);
  return saveDatabase(db);
}

/* ==================== BLOG POSTS ==================== */
export function getBlogPosts(locale?: Locale, includeDrafts = false): BlogPost[] {
  const db = loadDatabase();
  let list = db.blogPosts || [];
  if (!includeDrafts) {
    list = list.filter((b) => b.published);
  }
  if (locale) {
    list = list.filter((b) => b.language === locale);
  }
  return list;
}

export function getBlogPostBySlug(slug: string, includeDrafts = false): BlogPost | undefined {
  const db = loadDatabase();
  const list = includeDrafts ? db.blogPosts || [] : (db.blogPosts || []).filter((b) => b.published);
  return list.find((b) => b.slug === slug);
}

export function saveBlogPost(post: BlogPost): boolean {
  const db = loadDatabase();
  if (!db.blogPosts) db.blogPosts = [];
  const index = db.blogPosts.findIndex((b) => b.id === post.id);
  if (index >= 0) {
    db.blogPosts[index] = { ...post, updatedAt: new Date().toISOString() };
  } else {
    db.blogPosts.push({ ...post, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  return saveDatabase(db);
}

export function deleteBlogPost(id: string): boolean {
  const db = loadDatabase();
  db.blogPosts = (db.blogPosts || []).filter((b) => b.id !== id);
  return saveDatabase(db);
}

/* ==================== PHOTOGRAPHY ==================== */
export function getPhotographs(includeDrafts = false): Photograph[] {
  const db = loadDatabase();
  const list = db.photographs || [];
  const filtered = includeDrafts ? list : list.filter((p) => p.published);
  return filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getPhotographById(id: string, includeDrafts = false): Photograph | undefined {
  const list = getPhotographs(includeDrafts);
  return list.find((p) => p.id === id);
}

export function savePhotograph(photo: Photograph): boolean {
  const db = loadDatabase();
  if (!db.photographs) db.photographs = [];
  const index = db.photographs.findIndex((p) => p.id === photo.id);
  if (index >= 0) {
    db.photographs[index] = photo;
  } else {
    db.photographs.push({ ...photo, createdAt: new Date().toISOString() });
  }
  return saveDatabase(db);
}

export function deletePhotograph(id: string): boolean {
  const db = loadDatabase();
  db.photographs = (db.photographs || []).filter((p) => p.id !== id);
  return saveDatabase(db);
}

/* ==================== READING LIST ==================== */
export function getReadingList(includeDrafts = false): ReadingItem[] {
  const db = loadDatabase();
  const list = db.readingList || [];
  return includeDrafts ? list : list.filter((r) => r.published);
}

export function saveReadingItem(item: ReadingItem): boolean {
  const db = loadDatabase();
  if (!db.readingList) db.readingList = [];
  const index = db.readingList.findIndex((r) => r.id === item.id);
  if (index >= 0) {
    db.readingList[index] = item;
  } else {
    db.readingList.push({ ...item, createdAt: new Date().toISOString() });
  }
  return saveDatabase(db);
}

export function deleteReadingItem(id: string): boolean {
  const db = loadDatabase();
  db.readingList = (db.readingList || []).filter((r) => r.id !== id);
  return saveDatabase(db);
}

/* ==================== TIMELINE ==================== */
export function getTimeline(includeDrafts = false): TimelineItem[] {
  const db = loadDatabase();
  const list = db.timeline || [];
  const filtered = includeDrafts ? list : list.filter((t) => t.published);
  return filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function saveTimelineItem(item: TimelineItem): boolean {
  const db = loadDatabase();
  if (!db.timeline) db.timeline = [];
  const index = db.timeline.findIndex((t) => t.id === item.id);
  if (index >= 0) {
    db.timeline[index] = item;
  } else {
    db.timeline.push(item);
  }
  return saveDatabase(db);
}

export function deleteTimelineItem(id: string): boolean {
  const db = loadDatabase();
  db.timeline = (db.timeline || []).filter((t) => t.id !== id);
  return saveDatabase(db);
}

/* ==================== NOW PAGE ==================== */
export function getNow(): SiteDatabase['now'] {
  const db = loadDatabase();
  return db.now || { updatedAt: new Date().toISOString().split('T')[0], items: [] };
}

export function saveNow(now: SiteDatabase['now']): boolean {
  const db = loadDatabase();
  db.now = now;
  return saveDatabase(db);
}

/* ==================== CONTACT SUBMISSIONS ==================== */
export function saveContactSubmission(sub: Omit<ContactSubmission, 'id' | 'receivedAt' | 'read'>): ContactSubmission {
  const db = loadDatabase();
  if (!db.contactSubmissions) db.contactSubmissions = [];
  const submission: ContactSubmission = {
    ...sub,
    id: 'sub-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    receivedAt: new Date().toISOString(),
    read: false,
  };
  db.contactSubmissions.push(submission);
  saveDatabase(db);
  return submission;
}

export function getContactSubmissions(): ContactSubmission[] {
  const db = loadDatabase();
  return db.contactSubmissions || [];
}

export function deleteContactSubmission(id: string): boolean {
  const db = loadDatabase();
  db.contactSubmissions = (db.contactSubmissions || []).filter((s) => s.id !== id);
  return saveDatabase(db);
}

/* ==================== SEARCH (PUBLIC SAFE) ==================== */
export interface SearchResult {
  type: 'project' | 'writing' | 'blog' | 'photo' | 'reading';
  title: string;
  url: string;
  summary: string;
  category?: string;
}

export function searchContent(query: string, locale: Locale): SearchResult[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // Search published projects
  for (const project of getProjects(false)) {
    const title = project.title[locale] || project.title.en;
    const summary = project.summary[locale] || project.summary.en;
    const techs = (project.technologies || []).join(' ');
    if (
      title.toLowerCase().includes(q) ||
      summary.toLowerCase().includes(q) ||
      techs.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'project',
        title,
        url: `/${locale}/technology#${project.slug}`,
        summary,
        category: 'Technology',
      });
    }
  }

  // Search published writings
  for (const writing of getWritings(undefined, false)) {
    if (
      writing.title.toLowerCase().includes(q) ||
      writing.summary.toLowerCase().includes(q) ||
      writing.content.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'writing',
        title: writing.title,
        url: `/${locale}/writing/${writing.slug}`,
        summary: writing.summary,
        category: writing.category,
      });
    }
  }

  // Search published blog posts
  for (const post of getBlogPosts(undefined, false)) {
    if (
      post.title.toLowerCase().includes(q) ||
      post.summary.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'blog',
        title: post.title,
        url: `/${locale}/blog/${post.slug}`,
        summary: post.summary,
        category: post.category,
      });
    }
  }

  // Search published photos
  for (const photo of getPhotographs(false)) {
    const title = photo.title[locale] || photo.title.en;
    const caption = photo.caption[locale] || photo.caption.en;
    const tags = (photo.tags || []).join(' ');
    if (
      title.toLowerCase().includes(q) ||
      caption.toLowerCase().includes(q) ||
      tags.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'photo',
        title,
        url: `/${locale}/photography#${photo.id}`,
        summary: caption,
        category: photo.collection,
      });
    }
  }

  return results;
}
