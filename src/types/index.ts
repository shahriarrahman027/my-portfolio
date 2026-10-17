export type Locale = 'en' | 'bn';

export interface LocalizedString {
  en: string;
  bn?: string;
}

export interface Profile {
  name: string;
  titles: LocalizedString;
  bio: LocalizedString;
  longBio: LocalizedString;
  university: LocalizedString;
  degree: LocalizedString;
  location: LocalizedString;
  portraitUrl?: string;
  resumeUrl?: string;
  email?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  synitysoftRole: LocalizedString;
  interests: {
    ai: LocalizedString[];
    engineering: LocalizedString[];
    literature: LocalizedString[];
    visual: LocalizedString[];
  };
  ambitions: LocalizedString[];
}

export interface Project {
  id: string;
  slug: string;
  title: LocalizedString;
  summary: LocalizedString;
  problem?: LocalizedString;
  motivation?: LocalizedString;
  approach?: LocalizedString;
  contribution?: LocalizedString;
  technologies: string[];
  features?: { en: string[]; bn?: string[] };
  demoUrl?: string;
  repoUrl?: string;
  coverImage?: string;
  status: 'active' | 'in-progress' | 'completed' | 'planned';
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Writing {
  id: string;
  slug: string;
  title: string;
  language: Locale;
  category: 'short-story' | 'novel' | 'novel-excerpt' | 'essay' | 'reflection' | 'poetry' | 'in-progress';
  summary: string;
  content: string;
  coverImage?: string;
  readingTimeMinutes?: number;
  published: boolean;
  featured: boolean;
  tags: string[];
  series?: string;
  chapter?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  language: Locale;
  category: 'tech-ai' | 'books-literature' | 'films-storytelling';
  summary: string;
  content: string;
  coverImage?: string;
  readingTimeMinutes?: number;
  tags: string[];
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Photograph {
  id: string;
  title: LocalizedString;
  caption: LocalizedString;
  description?: LocalizedString;
  imageUrl: string;
  altText: string;
  collection: string;
  tags: string[];
  dateTaken?: string;
  location?: string;
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  published: boolean;
  featured: boolean;
  order: number;
  createdAt: string;
}

export interface ReadingItem {
  id: string;
  title: string;
  author: string;
  language: Locale;
  category: string;
  coverImage?: string;
  status: 'reading' | 'completed' | 'want-to-read';
  notes?: LocalizedString;
  published: boolean;
  createdAt: string;
}

export interface TimelineItem {
  id: string;
  year: string;
  date?: string;
  title: LocalizedString;
  description: LocalizedString;
  category: 'education' | 'experience' | 'leadership' | 'projects' | 'creative';
  published: boolean;
  order: number;
}

export interface NowItem {
  id: string;
  category: 'studies' | 'tech' | 'ai-ml' | 'writing' | 'photography' | 'reading' | 'leadership';
  title: LocalizedString;
  details: LocalizedString;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  receivedAt: string;
  read: boolean;
}

export interface SiteDatabase {
  profile: Profile;
  projects: Project[];
  writings: Writing[];
  blogPosts: BlogPost[];
  photographs: Photograph[];
  readingList: ReadingItem[];
  timeline: TimelineItem[];
  now: {
    updatedAt: string;
    items: NowItem[];
  };
  contactSubmissions: ContactSubmission[];
}
