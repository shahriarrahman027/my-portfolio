import React, { useState, useEffect } from 'react';
import type {
  SiteDatabase,
  Project,
  Writing,
  BlogPost,
  Photograph,
  ReadingItem,
  TimelineItem,
} from '@/types';

type AdminTab =
  | 'overview'
  | 'projects'
  | 'writing'
  | 'photography'
  | 'blog'
  | 'reading'
  | 'timeline'
  | 'now'
  | 'profile'
  | 'contact';

export function AdminDashboardApp() {
  const [data, setData] = useState<SiteDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for creating/editing items
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [editingWriting, setEditingWriting] = useState<Partial<Writing> | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<Partial<BlogPost> | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Partial<Photograph> | null>(null);
  const [editingBook, setEditingBook] = useState<Partial<ReadingItem> | null>(null);
  const [editingTimeline, setEditingTimeline] = useState<Partial<TimelineItem> | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/content');
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setMessage({ type: 'error', text: 'Failed to load content from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (err) {
      window.location.href = '/admin/login';
    }
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const saveItem = async (type: string, payload: any) => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: payload }),
      });
      const resData = await res.json();
      if (resData.success) {
        showNotification(`${type} saved successfully!`);
        fetchData();
        return true;
      } else {
        showNotification(resData.error || 'Save failed', 'error');
        return false;
      }
    } catch (err) {
      showNotification('Network error while saving', 'error');
      return false;
    }
  };

  const deleteItem = async (type: string, id: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${type}?`)) return;
    try {
      const res = await fetch('/api/admin/content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });
      const resData = await res.json();
      if (resData.success) {
        showNotification(`${type} deleted.`);
        fetchData();
      } else {
        showNotification(resData.error || 'Delete failed', 'error');
      }
    } catch (err) {
      showNotification('Error deleting item', 'error');
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      setUploading(false);
      if (res.ok && json.success) {
        showNotification(`File uploaded: ${json.filename}`);
        return json.url;
      } else {
        showNotification(json.error || 'Upload failed', 'error');
        return null;
      }
    } catch (err) {
      setUploading(false);
      showNotification('Upload network error', 'error');
      return null;
    }
  };

  if (loading || !data) {
    return (
      <div className="admin-loading">
        <p>Loading administrative workspace...</p>
      </div>
    );
  }

  return (
    <div className="admin-app">
      {/* Top Bar */}
      <header className="admin-topbar">
        <div className="topbar-left">
          <span className="admin-brand">Shahriar Rahman</span>
          <span className="admin-badge">Admin Workspace</span>
        </div>
        <div className="topbar-right">
          <a href="/en" target="_blank" rel="noopener noreferrer" className="topbar-link">
            View Live Site ↗
          </a>
          <button type="button" onClick={handleLogout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {/* Notifications */}
      {message && (
        <div className={`admin-notification ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Main Layout */}
      <div className="admin-main">
        {/* Navigation Tabs */}
        <nav className="admin-nav" aria-label="Admin Navigation">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            💻 Projects ({data.projects.length})
          </button>
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'writing' ? 'active' : ''}`}
            onClick={() => setActiveTab('writing')}
          >
            ✍️ Writing ({data.writings.length})
          </button>
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'photography' ? 'active' : ''}`}
            onClick={() => setActiveTab('photography')}
          >
            📷 Photography ({data.photographs.length})
          </button>
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => setActiveTab('blog')}
          >
            📰 Blog ({data.blogPosts.length})
          </button>
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'reading' ? 'active' : ''}`}
            onClick={() => setActiveTab('reading')}
          >
            📚 Reading List ({data.readingList.length})
          </button>
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            ⏳ Timeline ({data.timeline.length})
          </button>
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'now' ? 'active' : ''}`}
            onClick={() => setActiveTab('now')}
          >
            ⚡ Now Page
          </button>
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile & Résumé
          </button>
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            ✉️ Inquiries ({data.contactSubmissions.length})
          </button>
        </nav>

        {/* Content Pane */}
        <section className="admin-content-pane">
          {/* ================= OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <h2 className="pane-title">Platform Content Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Projects</span>
                  <span className="stat-value">{data.projects.length}</span>
                  <span className="stat-meta">
                    {data.projects.filter((p) => p.published).length} published · {data.projects.filter((p) => !p.published).length} drafts
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-label">Literary Writings</span>
                  <span className="stat-value">{data.writings.length}</span>
                  <span className="stat-meta">
                    {data.writings.filter((w) => w.published).length} published · {data.writings.filter((w) => !w.published).length} drafts
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-label">Visual Journal Photos</span>
                  <span className="stat-value">{data.photographs.length}</span>
                  <span className="stat-meta">
                    {data.photographs.filter((ph) => ph.published).length} published · {data.photographs.filter((ph) => !ph.published).length} drafts
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-label">Blog Posts</span>
                  <span className="stat-value">{data.blogPosts.length}</span>
                  <span className="stat-meta">
                    {data.blogPosts.filter((b) => b.published).length} published · {data.blogPosts.filter((b) => !b.published).length} drafts
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-label">Contact Messages</span>
                  <span className="stat-value">{data.contactSubmissions.length}</span>
                  <span className="stat-meta">Safely archived in dashboard</span>
                </div>
              </div>

              <div className="quick-actions-box">
                <h3>Quick Editorial Actions</h3>
                <div className="action-buttons">
                  <button type="button" onClick={() => { setActiveTab('projects'); setEditingProject({ id: 'proj-' + Date.now(), title: { en: '' }, summary: { en: '' }, technologies: [], status: 'in-progress', published: false, featured: false, slug: '' }); }} className="btn btn-primary">
                    + Add New Project
                  </button>
                  <button type="button" onClick={() => { setActiveTab('writing'); setEditingWriting({ id: 'wrt-' + Date.now(), title: '', slug: '', language: 'en', category: 'short-story', summary: '', content: '', published: false, featured: false, tags: [] }); }} className="btn btn-primary">
                    + Add New Writing Piece
                  </button>
                  <button type="button" onClick={() => { setActiveTab('photography'); setEditingPhoto({ id: 'ph-' + Date.now(), title: { en: '' }, caption: { en: '' }, imageUrl: '', altText: '', collection: 'General', tags: [], published: false, featured: false, order: data.photographs.length + 1 }); }} className="btn btn-primary">
                    + Upload Photograph
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= PROJECTS ================= */}
          {activeTab === 'projects' && (
            <div className="tab-pane">
              <div className="pane-header">
                <h2 className="pane-title">Projects & Case Studies Manager</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    setEditingProject({
                      id: 'proj-' + Date.now(),
                      title: { en: '', bn: '' },
                      summary: { en: '', bn: '' },
                      problem: { en: '', bn: '' },
                      approach: { en: '', bn: '' },
                      contribution: { en: '', bn: '' },
                      technologies: [],
                      status: 'active',
                      published: false,
                      featured: false,
                      slug: '',
                    })
                  }
                >
                  + New Project
                </button>
              </div>

              {editingProject && (
                <form
                  className="editor-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!editingProject.title?.en || !editingProject.slug) {
                      showNotification('English Title and Slug are required', 'error');
                      return;
                    }
                    const ok = await saveItem('project', editingProject);
                    if (ok) setEditingProject(null);
                  }}
                >
                  <h3>{editingProject.id ? 'Edit Project' : 'New Project'}</h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Project Slug (URL identifier) *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. neural-nlp-engine"
                        value={editingProject.slug || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        className="form-input"
                        value={editingProject.status || 'active'}
                        onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as any })}
                      >
                        <option value="active">Active</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="planned">Planned</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">English Title *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={editingProject.title?.en || ''}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            title: { ...editingProject.title!, en: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Bengali Title (বাংলা শিরোনাম)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingProject.title?.bn || ''}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            title: { ...editingProject.title!, bn: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">English Summary *</label>
                    <textarea
                      required
                      rows={2}
                      className="form-input"
                      value={editingProject.summary?.en || ''}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          summary: { ...editingProject.summary!, en: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bengali Summary (বাংলা সারসংক্ষেপ)</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={editingProject.summary?.bn || ''}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          summary: { ...editingProject.summary!, bn: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Problem Statement (EN)</label>
                      <textarea
                        rows={3}
                        className="form-input"
                        value={editingProject.problem?.en || ''}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            problem: { ...editingProject.problem, en: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Architecture / Approach (EN)</label>
                      <textarea
                        rows={3}
                        className="form-input"
                        value={editingProject.approach?.en || ''}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            approach: { ...editingProject.approach, en: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specific Contribution (EN)</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={editingProject.contribution?.en || ''}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          contribution: { ...editingProject.contribution, en: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Technologies (comma separated)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Python, PyTorch, FastAPI"
                        value={(editingProject.technologies || []).join(', ')}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            technologies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">GitHub Repository URL</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://github.com/..."
                        value={editingProject.repoUrl || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, repoUrl: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Live Demonstration URL</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://..."
                        value={editingProject.demoUrl || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, demoUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-actions-bar">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editingProject.published ?? false}
                        onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                      />
                      <span>Publish (Make visible on public site)</span>
                    </label>

                    <div className="btn-group">
                      <button type="button" onClick={() => setEditingProject(null)} className="btn">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Project
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="items-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Slug</th>
                      <th>Status</th>
                      <th>Visibility</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.projects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-cell">No projects yet. Click "+ New Project" above.</td>
                      </tr>
                    ) : (
                      data.projects.map((p) => (
                        <tr key={p.id}>
                          <td><strong>{p.title.en}</strong> {p.title.bn ? `(${p.title.bn})` : ''}</td>
                          <td><code>{p.slug}</code></td>
                          <td><span className="tag">{p.status}</span></td>
                          <td>
                            <span className={`status-pill ${p.published ? 'published' : 'draft'}`}>
                              {p.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button type="button" onClick={() => setEditingProject(p)} className="action-btn edit">
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => saveItem('project', { ...p, published: !p.published })}
                              className="action-btn toggle"
                            >
                              {p.published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button type="button" onClick={() => deleteItem('project', p.id)} className="action-btn delete">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= WRITING ================= */}
          {activeTab === 'writing' && (
            <div className="tab-pane">
              <div className="pane-header">
                <h2 className="pane-title">Writing Library Manager</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    setEditingWriting({
                      id: 'wrt-' + Date.now(),
                      title: '',
                      slug: '',
                      language: 'en',
                      category: 'short-story',
                      summary: '',
                      content: '',
                      readingTimeMinutes: 5,
                      published: false,
                      featured: false,
                      tags: [],
                    })
                  }
                >
                  + New Writing Piece
                </button>
              </div>

              {editingWriting && (
                <form
                  className="editor-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!editingWriting.title || !editingWriting.slug || !editingWriting.content) {
                      showNotification('Title, Slug, and Content are required', 'error');
                      return;
                    }
                    const ok = await saveItem('writing', editingWriting);
                    if (ok) setEditingWriting(null);
                  }}
                >
                  <h3>{editingWriting.id ? 'Edit Writing' : 'New Writing'}</h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Title *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={editingWriting.title || ''}
                        onChange={(e) => setEditingWriting({ ...editingWriting, title: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Slug (URL) *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={editingWriting.slug || ''}
                        onChange={(e) => setEditingWriting({ ...editingWriting, slug: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Language</label>
                      <select
                        className="form-input"
                        value={editingWriting.language || 'en'}
                        onChange={(e) => setEditingWriting({ ...editingWriting, language: e.target.value as any })}
                      >
                        <option value="en">English</option>
                        <option value="bn">বাংলা (Bengali)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-input"
                        value={editingWriting.category || 'short-story'}
                        onChange={(e) => setEditingWriting({ ...editingWriting, category: e.target.value as any })}
                      >
                        <option value="short-story">Short Story</option>
                        <option value="novel">Novel</option>
                        <option value="novel-excerpt">Novel Excerpt</option>
                        <option value="essay">Essay</option>
                        <option value="reflection">Reflection</option>
                        <option value="poetry">Poetry</option>
                        <option value="in-progress">Work in Progress</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Summary / Teaser</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={editingWriting.summary || ''}
                      onChange={(e) => setEditingWriting({ ...editingWriting, summary: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Writing Content (Longform prose) *</label>
                    <textarea
                      required
                      rows={12}
                      className="form-input prose-input"
                      placeholder="Write your story, essay, reflection, or chapter here..."
                      value={editingWriting.content || ''}
                      onChange={(e) => setEditingWriting({ ...editingWriting, content: e.target.value })}
                    />
                  </div>

                  <div className="form-actions-bar">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editingWriting.published ?? false}
                        onChange={(e) => setEditingWriting({ ...editingWriting, published: e.target.checked })}
                      />
                      <span>Publish (Make visible publicly)</span>
                    </label>

                    <div className="btn-group">
                      <button type="button" onClick={() => setEditingWriting(null)} className="btn">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Writing
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="items-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Language</th>
                      <th>Visibility</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.writings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-cell">No writings yet. Click "+ New Writing Piece" above.</td>
                      </tr>
                    ) : (
                      data.writings.map((w) => (
                        <tr key={w.id}>
                          <td><strong>{w.title}</strong></td>
                          <td><span className="tag">{w.category}</span></td>
                          <td><code>{w.language.toUpperCase()}</code></td>
                          <td>
                            <span className={`status-pill ${w.published ? 'published' : 'draft'}`}>
                              {w.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button type="button" onClick={() => setEditingWriting(w)} className="action-btn edit">
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => saveItem('writing', { ...w, published: !w.published })}
                              className="action-btn toggle"
                            >
                              {w.published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button type="button" onClick={() => deleteItem('writing', w.id)} className="action-btn delete">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= PHOTOGRAPHY ================= */}
          {activeTab === 'photography' && (
            <div className="tab-pane">
              <div className="pane-header">
                <h2 className="pane-title">Photography & Visual Journal Manager</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    setEditingPhoto({
                      id: 'ph-' + Date.now(),
                      title: { en: '', bn: '' },
                      caption: { en: '', bn: '' },
                      imageUrl: '',
                      altText: '',
                      collection: 'Street & Geometry',
                      tags: [],
                      camera: '',
                      lens: '',
                      location: '',
                      published: false,
                      featured: false,
                      order: data.photographs.length + 1,
                    })
                  }
                >
                  + Upload Photograph
                </button>
              </div>

              {editingPhoto && (
                <form
                  className="editor-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!editingPhoto.imageUrl || !editingPhoto.title?.en) {
                      showNotification('Image and English Title are required', 'error');
                      return;
                    }
                    const ok = await saveItem('photo', editingPhoto);
                    if (ok) setEditingPhoto(null);
                  }}
                >
                  <h3>Upload / Edit Photograph</h3>

                  <div className="form-group">
                    <label className="form-label">Upload Image File (JPEG, PNG, WebP, AVIF up to 10MB)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) {
                            setEditingPhoto({
                              ...editingPhoto,
                              imageUrl: url,
                              altText: file.name.replace(/\.[^/.]+$/, ''),
                            });
                          }
                        }
                      }}
                    />
                    {uploading && <p className="uploading-text">Uploading image...</p>}
                    {editingPhoto.imageUrl && (
                      <div className="uploaded-preview">
                        <img src={editingPhoto.imageUrl} alt="Preview" style={{ maxHeight: '180px', marginTop: '8px', borderRadius: '4px' }} />
                        <p style={{ fontSize: '11px', fontFamily: 'monospace' }}>{editingPhoto.imageUrl}</p>
                      </div>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">English Title *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={editingPhoto.title?.en || ''}
                        onChange={(e) =>
                          setEditingPhoto({
                            ...editingPhoto,
                            title: { ...editingPhoto.title!, en: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Bengali Title (বাংলা শিরোনাম)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingPhoto.title?.bn || ''}
                        onChange={(e) =>
                          setEditingPhoto({
                            ...editingPhoto,
                            title: { ...editingPhoto.title!, bn: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">English Caption</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingPhoto.caption?.en || ''}
                        onChange={(e) =>
                          setEditingPhoto({
                            ...editingPhoto,
                            caption: { ...editingPhoto.caption!, en: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Bengali Caption (বাংলা ক্যাপশন)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingPhoto.caption?.bn || ''}
                        onChange={(e) =>
                          setEditingPhoto({
                            ...editingPhoto,
                            caption: { ...editingPhoto.caption!, bn: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Collection</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Travel, Street, Light & Shadow"
                        value={editingPhoto.collection || ''}
                        onChange={(e) => setEditingPhoto({ ...editingPhoto, collection: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Location (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Old Dhaka, Bangladesh"
                        value={editingPhoto.location || ''}
                        onChange={(e) => setEditingPhoto({ ...editingPhoto, location: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Camera (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Fujifilm X-T4"
                        value={editingPhoto.camera || ''}
                        onChange={(e) => setEditingPhoto({ ...editingPhoto, camera: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Lens (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 23mm f/2.0"
                        value={editingPhoto.lens || ''}
                        onChange={(e) => setEditingPhoto({ ...editingPhoto, lens: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-actions-bar">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editingPhoto.published ?? false}
                        onChange={(e) => setEditingPhoto({ ...editingPhoto, published: e.target.checked })}
                      />
                      <span>Publish (Make visible in gallery)</span>
                    </label>

                    <div className="btn-group">
                      <button type="button" onClick={() => setEditingPhoto(null)} className="btn">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Photograph
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="items-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Collection</th>
                      <th>Visibility</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.photographs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-cell">No photographs uploaded yet. Click "+ Upload Photograph" above.</td>
                      </tr>
                    ) : (
                      data.photographs.map((ph) => (
                        <tr key={ph.id}>
                          <td>
                            <img src={ph.imageUrl} alt={ph.title.en} style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '2px' }} />
                          </td>
                          <td><strong>{ph.title.en}</strong></td>
                          <td><span className="tag">{ph.collection}</span></td>
                          <td>
                            <span className={`status-pill ${ph.published ? 'published' : 'draft'}`}>
                              {ph.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button type="button" onClick={() => setEditingPhoto(ph)} className="action-btn edit">
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => saveItem('photo', { ...ph, published: !ph.published })}
                              className="action-btn toggle"
                            >
                              {ph.published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button type="button" onClick={() => deleteItem('photo', ph.id)} className="action-btn delete">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= BLOG ================= */}
          {activeTab === 'blog' && (
            <div className="tab-pane">
              <div className="pane-header">
                <h2 className="pane-title">Blog Articles Manager</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    setEditingBlogPost({
                      id: 'blg-' + Date.now(),
                      title: '',
                      slug: '',
                      language: 'en',
                      category: 'tech-ai',
                      summary: '',
                      content: '',
                      readingTimeMinutes: 4,
                      published: false,
                      featured: false,
                      tags: [],
                    })
                  }
                >
                  + New Article
                </button>
              </div>

              {editingBlogPost && (
                <form
                  className="editor-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!editingBlogPost.title || !editingBlogPost.slug || !editingBlogPost.content) {
                      showNotification('Title, Slug, and Content are required', 'error');
                      return;
                    }
                    const ok = await saveItem('blog', editingBlogPost);
                    if (ok) setEditingBlogPost(null);
                  }}
                >
                  <h3>Edit / New Article</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Article Title *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={editingBlogPost.title || ''}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, title: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Slug *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={editingBlogPost.slug || ''}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, slug: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Topic Category</label>
                      <select
                        className="form-input"
                        value={editingBlogPost.category || 'tech-ai'}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, category: e.target.value as any })}
                      >
                        <option value="tech-ai">Technology & AI</option>
                        <option value="books-literature">Books & Literature</option>
                        <option value="films-storytelling">Films & Storytelling</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Language</label>
                      <select
                        className="form-input"
                        value={editingBlogPost.language || 'en'}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, language: e.target.value as any })}
                      >
                        <option value="en">English</option>
                        <option value="bn">বাংলা (Bengali)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Summary</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={editingBlogPost.summary || ''}
                      onChange={(e) => setEditingBlogPost({ ...editingBlogPost, summary: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Article Content</label>
                    <textarea
                      rows={10}
                      className="form-input prose-input"
                      value={editingBlogPost.content || ''}
                      onChange={(e) => setEditingBlogPost({ ...editingBlogPost, content: e.target.value })}
                    />
                  </div>

                  <div className="form-actions-bar">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editingBlogPost.published ?? false}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, published: e.target.checked })}
                      />
                      <span>Publish Article</span>
                    </label>

                    <div className="btn-group">
                      <button type="button" onClick={() => setEditingBlogPost(null)} className="btn">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Article
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="items-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Language</th>
                      <th>Visibility</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.blogPosts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-cell">No blog posts yet. Click "+ New Article" above.</td>
                      </tr>
                    ) : (
                      data.blogPosts.map((b) => (
                        <tr key={b.id}>
                          <td><strong>{b.title}</strong></td>
                          <td><span className="tag">{b.category}</span></td>
                          <td><code>{b.language.toUpperCase()}</code></td>
                          <td>
                            <span className={`status-pill ${b.published ? 'published' : 'draft'}`}>
                              {b.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button type="button" onClick={() => setEditingBlogPost(b)} className="action-btn edit">
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => saveItem('blog', { ...b, published: !b.published })}
                              className="action-btn toggle"
                            >
                              {b.published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button type="button" onClick={() => deleteItem('blog', b.id)} className="action-btn delete">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= READING LIST ================= */}
          {activeTab === 'reading' && (
            <div className="tab-pane">
              <div className="pane-header">
                <h2 className="pane-title">Reading List Manager</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    setEditingBook({
                      id: 'bk-' + Date.now(),
                      title: '',
                      author: '',
                      language: 'en',
                      category: 'Computer Science',
                      status: 'reading',
                      notes: { en: '', bn: '' },
                      published: true,
                    })
                  }
                >
                  + Add Book
                </button>
              </div>

              {editingBook && (
                <form
                  className="editor-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!editingBook.title || !editingBook.author) {
                      showNotification('Title and Author are required', 'error');
                      return;
                    }
                    const ok = await saveItem('reading', editingBook);
                    if (ok) setEditingBook(null);
                  }}
                >
                  <h3>Add / Edit Book</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Book Title *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={editingBook.title || ''}
                        onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Author *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={editingBook.author || ''}
                        onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reading Status</label>
                      <select
                        className="form-input"
                        value={editingBook.status || 'reading'}
                        onChange={(e) => setEditingBook({ ...editingBook, status: e.target.value as any })}
                      >
                        <option value="reading">Currently Reading</option>
                        <option value="completed">Completed</option>
                        <option value="want-to-read">Plan to Read</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. AI, Literature, Philosophy"
                        value={editingBook.category || ''}
                        onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Personal Reflection / Notes (EN)</label>
                    <textarea
                      rows={3}
                      className="form-input"
                      value={editingBook.notes?.en || ''}
                      onChange={(e) =>
                        setEditingBook({
                          ...editingBook,
                          notes: { ...editingBook.notes, en: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-actions-bar">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editingBook.published ?? true}
                        onChange={(e) => setEditingBook({ ...editingBook, published: e.target.checked })}
                      />
                      <span>Make Visible</span>
                    </label>

                    <div className="btn-group">
                      <button type="button" onClick={() => setEditingBook(null)} className="btn">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Book
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="items-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.readingList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="empty-cell">No books added yet.</td>
                      </tr>
                    ) : (
                      data.readingList.map((bk) => (
                        <tr key={bk.id}>
                          <td><strong>{bk.title}</strong></td>
                          <td>{bk.author}</td>
                          <td><span className="tag">{bk.status}</span></td>
                          <td className="actions-cell">
                            <button type="button" onClick={() => setEditingBook(bk)} className="action-btn edit">
                              Edit
                            </button>
                            <button type="button" onClick={() => deleteItem('reading', bk.id)} className="action-btn delete">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TIMELINE ================= */}
          {activeTab === 'timeline' && (
            <div className="tab-pane">
              <div className="pane-header">
                <h2 className="pane-title">Timeline Milestones Manager</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    setEditingTimeline({
                      id: 'tl-' + Date.now(),
                      year: new Date().getFullYear().toString(),
                      title: { en: '', bn: '' },
                      description: { en: '', bn: '' },
                      category: 'projects',
                      order: data.timeline.length + 1,
                      published: true,
                    })
                  }
                >
                  + Add Milestone
                </button>
              </div>

              {editingTimeline && (
                <form
                  className="editor-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!editingTimeline.title?.en || !editingTimeline.year) {
                      showNotification('Year and Title are required', 'error');
                      return;
                    }
                    const ok = await saveItem('timeline', editingTimeline);
                    if (ok) setEditingTimeline(null);
                  }}
                >
                  <h3>Add / Edit Milestone</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Year / Period *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. 2024 or Present"
                        value={editingTimeline.year || ''}
                        onChange={(e) => setEditingTimeline({ ...editingTimeline, year: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-input"
                        value={editingTimeline.category || 'projects'}
                        onChange={(e) => setEditingTimeline({ ...editingTimeline, category: e.target.value as any })}
                      >
                        <option value="education">Education</option>
                        <option value="experience">Experience</option>
                        <option value="leadership">Leadership</option>
                        <option value="projects">Projects</option>
                        <option value="creative">Creative</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">English Title *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={editingTimeline.title?.en || ''}
                        onChange={(e) =>
                          setEditingTimeline({
                            ...editingTimeline,
                            title: { ...editingTimeline.title!, en: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bengali Title (বাংলা শিরোনাম)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingTimeline.title?.bn || ''}
                        onChange={(e) =>
                          setEditingTimeline({
                            ...editingTimeline,
                            title: { ...editingTimeline.title!, bn: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">English Description</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={editingTimeline.description?.en || ''}
                      onChange={(e) =>
                        setEditingTimeline({
                          ...editingTimeline,
                          description: { ...editingTimeline.description!, en: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bengali Description (বাংলা বিবরণ)</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={editingTimeline.description?.bn || ''}
                      onChange={(e) =>
                        setEditingTimeline({
                          ...editingTimeline,
                          description: { ...editingTimeline.description!, bn: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-actions-bar">
                    <div className="btn-group">
                      <button type="button" onClick={() => setEditingTimeline(null)} className="btn">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Milestone
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="items-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Category</th>
                      <th>Title</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.timeline.map((tl) => (
                      <tr key={tl.id}>
                        <td><strong>{tl.year}</strong></td>
                        <td><span className="tag">{tl.category}</span></td>
                        <td>{tl.title.en}</td>
                        <td className="actions-cell">
                          <button type="button" onClick={() => setEditingTimeline(tl)} className="action-btn edit">
                            Edit
                          </button>
                          <button type="button" onClick={() => deleteItem('timeline', tl.id)} className="action-btn delete">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= NOW ================= */}
          {activeTab === 'now' && (
            <div className="tab-pane">
              <h2 className="pane-title">Now Page Editor</h2>
              <form
                className="editor-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const ok = await saveItem('now', data.now);
                  if (ok) showNotification('Now page saved!');
                }}
              >
                <div className="form-group">
                  <label className="form-label">Last Updated Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={data.now.updatedAt || ''}
                    onChange={(e) =>
                      setData({
                        ...data,
                        now: { ...data.now, updatedAt: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="now-items-editor">
                  {data.now.items.map((item, idx) => (
                    <div key={idx} className="now-editor-item">
                      <span className="tag">{item.category}</span>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Title (EN)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.title.en}
                            onChange={(e) => {
                              const updated = [...data.now.items];
                              updated[idx].title.en = e.target.value;
                              setData({ ...data, now: { ...data.now, items: updated } });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Title (BN)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.title.bn || ''}
                            onChange={(e) => {
                              const updated = [...data.now.items];
                              updated[idx].title.bn = e.target.value;
                              setData({ ...data, now: { ...data.now, items: updated } });
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Details (EN)</label>
                        <textarea
                          rows={2}
                          className="form-input"
                          value={item.details.en}
                          onChange={(e) => {
                            const updated = [...data.now.items];
                            updated[idx].details.en = e.target.value;
                            setData({ ...data, now: { ...data.now, items: updated } });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Save Now Focus
                </button>
              </form>
            </div>
          )}

          {/* ================= PROFILE & RÉSUMÉ ================= */}
          {activeTab === 'profile' && (
            <div className="tab-pane">
              <h2 className="pane-title">Profile & Résumé Management</h2>
              <form
                className="editor-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const ok = await saveItem('profile', data.profile);
                  if (ok) showNotification('Profile updated successfully!');
                }}
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={data.profile.name}
                      onChange={(e) =>
                        setData({ ...data, profile: { ...data.profile, name: e.target.value } })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={data.profile.email || ''}
                      onChange={(e) =>
                        setData({ ...data, profile: { ...data.profile, email: e.target.value } })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">GitHub Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={data.profile.githubUsername || ''}
                      onChange={(e) =>
                        setData({ ...data, profile: { ...data.profile, githubUsername: e.target.value } })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Profile Portrait Photograph</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) {
                            setData({
                              ...data,
                              profile: { ...data.profile, portraitUrl: url },
                            });
                            showNotification('Portrait image attached. Remember to click Save Profile.');
                          }
                        }
                      }}
                    />
                    {data.profile.portraitUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                        <img
                          src={data.profile.portraitUrl}
                          alt="Portrait Preview"
                          style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                        />
                        <div style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                          <span style={{ color: 'var(--accent-primary)', display: 'block' }}>Active: {data.profile.portraitUrl}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setData({
                                ...data,
                                profile: { ...data.profile, portraitUrl: '/images/profile/shahriar-rahman.webp' },
                              })
                            }
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                          >
                            Reset to default portrait
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Résumé PDF</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) {
                            setData({
                              ...data,
                              profile: { ...data.profile, resumeUrl: url },
                            });
                            showNotification('Résumé PDF attached. Remember to click Save Profile.');
                          }
                        }
                      }}
                    />
                    {data.profile.resumeUrl && (
                      <p style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--accent-primary)', marginTop: '4px' }}>
                        Current CV: <a href={data.profile.resumeUrl} target="_blank" rel="noopener noreferrer">{data.profile.resumeUrl} ↗</a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bio (EN)</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    value={data.profile.bio.en}
                    onChange={(e) =>
                      setData({
                        ...data,
                        profile: {
                          ...data.profile,
                          bio: { ...data.profile.bio, en: e.target.value },
                        },
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio (BN)</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    value={data.profile.bio.bn || ''}
                    onChange={(e) =>
                      setData({
                        ...data,
                        profile: {
                          ...data.profile,
                          bio: { ...data.profile.bio, bn: e.target.value },
                        },
                      })
                    }
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Save Profile Settings
                </button>
              </form>
            </div>
          )}

          {/* ================= CONTACT INBOX ================= */}
          {activeTab === 'contact' && (
            <div className="tab-pane">
              <h2 className="pane-title">Visitor Submissions & Inquiries</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '1.5rem' }}>
                All visitor messages submitted through the contact form are securely archived in the server database.
              </p>

              {data.contactSubmissions.length === 0 ? (
                <div className="empty-cell" style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border-medium)', borderRadius: '8px' }}>
                  No visitor inquiries recorded yet.
                </div>
              ) : (
                <div className="submissions-list">
                  {data.contactSubmissions.map((sub) => (
                    <div key={sub.id} className="submission-card">
                      <div className="submission-header">
                        <div>
                          <strong>{sub.name}</strong> &lt;{sub.email}&gt;
                        </div>
                        <span className="submission-date">
                          {new Date(sub.receivedAt).toLocaleString()}
                        </span>
                      </div>
                      {sub.subject && <h4 className="submission-subject">Subject: {sub.subject}</h4>}
                      <p className="submission-message">{sub.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .admin-app {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
        }
        .admin-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.5rem;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-medium);
        }
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .admin-brand {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 600;
        }
        .admin-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          background: var(--accent-subtle);
          color: var(--accent-primary);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .topbar-link {
          font-size: 13px;
          color: var(--text-secondary);
          text-decoration: none;
        }
        .topbar-link:hover { color: var(--accent-primary); }
        .logout-btn {
          background: transparent;
          border: 1px solid var(--border-light);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          color: var(--text-primary);
          cursor: pointer;
        }
        .logout-btn:hover { background: var(--bg-subtle); }
        .admin-notification {
          padding: 0.75rem 1.5rem;
          font-size: 13px;
          font-family: var(--font-mono);
          text-align: center;
        }
        .admin-notification.success {
          background: var(--accent-subtle);
          color: var(--accent-primary);
          border-bottom: 1px solid var(--accent-primary);
        }
        .admin-notification.error {
          background: rgba(217, 83, 79, 0.15);
          color: #d9534f;
          border-bottom: 1px solid #d9534f;
        }
        .admin-main {
          display: flex;
          flex: 1;
        }
        .admin-nav {
          width: 240px;
          background: var(--bg-surface);
          border-right: 1px solid var(--border-light);
          padding: 1rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          padding: 0.6rem 0.85rem;
          border-radius: 6px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .admin-nav-item:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }
        .admin-nav-item.active {
          background: var(--accent-subtle);
          color: var(--accent-primary);
          font-weight: 600;
        }
        .admin-content-pane {
          flex: 1;
          padding: 2rem;
          max-width: 1100px;
          overflow-y: auto;
        }
        .pane-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .pane-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          border-radius: 8px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .stat-meta {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .quick-actions-box {
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          border-radius: 8px;
          padding: 1.5rem;
        }
        .quick-actions-box h3 { margin-bottom: 1rem; font-size: 1.1rem; }
        .action-buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .editor-form {
          background: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .form-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .form-input {
          background: var(--bg-primary);
          border: 1px solid var(--border-medium);
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
        }
        .form-input:focus { border-color: var(--accent-primary); }
        .prose-input { font-family: var(--font-serif); font-size: 15px; line-height: 1.6; }
        .form-actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          cursor: pointer;
        }
        .btn-group { display: flex; gap: 0.5rem; }
        .items-table-wrapper {
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          border-radius: 8px;
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .admin-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-medium);
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .admin-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-light);
        }
        .status-pill {
          font-size: 11px;
          font-family: var(--font-mono);
          padding: 2px 6px;
          border-radius: 3px;
        }
        .status-pill.published {
          background: var(--accent-subtle);
          color: var(--accent-primary);
        }
        .status-pill.draft {
          background: var(--bg-subtle);
          color: var(--text-muted);
        }
        .actions-cell {
          display: flex;
          gap: 6px;
        }
        .action-btn {
          border: 1px solid var(--border-light);
          background: transparent;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 11px;
          cursor: pointer;
          color: var(--text-primary);
        }
        .action-btn:hover { background: var(--bg-subtle); }
        .action-btn.delete { color: #d9534f; border-color: rgba(217, 83, 79, 0.3); }
        .action-btn.delete:hover { background: rgba(217, 83, 79, 0.1); }
        .empty-cell {
          text-align: center;
          color: var(--text-muted);
          padding: 2rem !important;
        }
        .submission-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          border-radius: 6px;
          padding: 1rem 1.25rem;
          margin-bottom: 0.75rem;
        }
        .submission-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 0.5rem;
        }
        .submission-date {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }
        .submission-subject {
          font-size: 14px;
          margin-bottom: 0.5rem;
        }
        .submission-message {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .now-editor-item {
          border: 1px solid var(--border-light);
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .admin-main { flex-direction: column; }
          .admin-nav { width: 100%; border-right: none; border-bottom: 1px solid var(--border-light); }
        }
      `}</style>
    </div>
  );
}
