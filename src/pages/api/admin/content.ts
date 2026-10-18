import type { APIRoute } from 'astro';
import {
  saveProject,
  deleteProject,
  saveWriting,
  deleteWriting,
  saveBlogPost,
  deleteBlogPost,
  savePhotograph,
  deletePhotograph,
  saveReadingItem,
  deleteReadingItem,
  saveTimelineItem,
  deleteTimelineItem,
  saveNow,
  updateProfile,
  getProjects,
  getWritings,
  getBlogPosts,
  getPhotographs,
  getReadingList,
  getTimeline,
  getNow,
  getProfile,
  getContactSubmissions,
} from '@/lib/content';
import { isAuthenticated } from '@/lib/auth';

export const GET: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = {
    profile: getProfile(),
    projects: getProjects(true), // include drafts
    writings: getWritings(undefined, true), // include drafts
    blogPosts: getBlogPosts(undefined, true), // include drafts
    photographs: getPhotographs(true), // include drafts
    readingList: getReadingList(true), // include drafts
    timeline: getTimeline(true), // include drafts
    now: getNow(),
    contactSubmissions: getContactSubmissions(),
  };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { type, data } = await request.json();

    let success = false;
    switch (type) {
      case 'project':
        success = saveProject(data);
        break;
      case 'writing':
        success = saveWriting(data);
        break;
      case 'blog':
        success = saveBlogPost(data);
        break;
      case 'photo':
        success = savePhotograph(data);
        break;
      case 'reading':
        success = saveReadingItem(data);
        break;
      case 'timeline':
        success = saveTimelineItem(data);
        break;
      case 'now':
        success = saveNow(data);
        break;
      case 'profile':
        success = updateProfile(data);
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown content type: ${type}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ success }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Save content error:', err);
    return new Response(JSON.stringify({ error: 'Failed to save content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { type, id } = await request.json();

    let success = false;
    switch (type) {
      case 'project':
        success = deleteProject(id);
        break;
      case 'writing':
        success = deleteWriting(id);
        break;
      case 'blog':
        success = deleteBlogPost(id);
        break;
      case 'photo':
        success = deletePhotograph(id);
        break;
      case 'reading':
        success = deleteReadingItem(id);
        break;
      case 'timeline':
        success = deleteTimelineItem(id);
        break;
      default:
        return new Response(JSON.stringify({ error: `Unsupported delete type: ${type}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ success }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Delete content error:', err);
    return new Response(JSON.stringify({ error: 'Failed to delete content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

