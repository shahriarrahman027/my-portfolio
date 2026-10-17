import React, { useState, useEffect, useRef } from 'react';
import type { Locale } from '@/types';
import type { SearchResult } from '@/lib/content';

interface Props {
  locale: Locale;
}

export function SearchModal({ locale }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Perform search query debounced
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, locale]);

  return (
    <>
      <button
        type="button"
        className="search-trigger-btn"
        onClick={() => setIsOpen(true)}
        aria-label={locale === 'bn' ? 'অনুসন্ধান করুন (Cmd+K)' : 'Search (Cmd+K)'}
        title="Search (Cmd+K / Ctrl+K)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span className="search-shortcut">⌘K</span>
      </button>

      {isOpen && (
        <div className="search-backdrop" onClick={() => setIsOpen(false)} role="presentation">
          <div
            className="search-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={locale === 'bn' ? 'অনুসন্ধান' : 'Search'}
          >
            <div className="search-input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="search-icon-inside" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                ref={inputRef}
                type="search"
                className="search-input"
                placeholder={locale === 'bn' ? 'প্রজেক্ট, লেখালেখি, ছবি বা ব্লগ খুঁজুন...' : 'Search projects, writings, photos, or blog...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                className="search-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close search"
              >
                esc
              </button>
            </div>

            <div className="search-results-area">
              {loading && (
                <div className="search-status-message">
                  {locale === 'bn' ? 'অনুসন্ধান করা হচ্ছে...' : 'Searching...'}
                </div>
              )}

              {!loading && query.trim().length >= 2 && results.length === 0 && (
                <div className="search-status-message">
                  {locale === 'bn' ? `"${query}" এর জন্য কোনো ফলাফল পাওয়া যায়নি।` : `No results found for "${query}".`}
                </div>
              )}

              {!loading && results.length > 0 && (
                <ul className="search-results-list" role="listbox">
                  {results.map((item, idx) => (
                    <li key={idx} className="search-result-item" role="option" aria-selected={false}>
                      <a href={item.url} className="search-result-link" onClick={() => setIsOpen(false)}>
                        <div className="search-result-header">
                          <span className="search-result-type">{item.type}</span>
                          {item.category && <span className="search-result-cat">{item.category}</span>}
                        </div>
                        <h4 className="search-result-title">{item.title}</h4>
                        {item.summary && <p className="search-result-summary">{item.summary}</p>}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {!loading && query.trim().length < 2 && (
                <div className="search-status-hint">
                  {locale === 'bn'
                    ? 'টাইপ করে যেকোনো প্রকাশিত লেখা, প্রজেক্ট বা ছবি খুঁজুন।'
                    : 'Type at least 2 characters to search across published projects, writings, and photographs.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .search-trigger-btn {
          background: transparent;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          padding: 6px 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: var(--text-xs);
          transition: all var(--transition-fast);
        }
        .search-trigger-btn:hover {
          background: var(--bg-subtle);
          border-color: var(--border-medium);
        }
        .search-shortcut {
          font-family: var(--font-mono);
          font-size: 10px;
          background: var(--bg-subtle);
          padding: 1px 4px;
          border-radius: 2px;
          color: var(--text-muted);
          border: 1px solid var(--border-light);
        }
        .search-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 19, 21, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 12vh 1rem 2rem;
        }
        .search-dialog {
          background: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 600px;
          overflow: hidden;
        }
        .search-input-wrapper {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-light);
          gap: 0.75rem;
        }
        .search-icon-inside {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: var(--text-base);
          color: var(--text-primary);
          font-family: inherit;
        }
        .search-close-btn {
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          padding: 2px 6px;
          cursor: pointer;
        }
        .search-results-area {
          max-height: 400px;
          overflow-y: auto;
          padding: 0.5rem;
        }
        .search-status-message, .search-status-hint {
          padding: 2rem 1rem;
          text-align: center;
          color: var(--text-muted);
          font-size: var(--text-sm);
        }
        .search-results-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .search-result-item {
          margin-bottom: 4px;
        }
        .search-result-link {
          display: block;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          text-decoration: none;
          color: inherit;
          transition: background var(--transition-fast);
        }
        .search-result-link:hover, .search-result-link:focus-visible {
          background: var(--bg-subtle);
        }
        .search-result-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .search-result-type {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          background: var(--accent-subtle);
          color: var(--accent-primary);
          padding: 1px 5px;
          border-radius: 2px;
          font-weight: 600;
        }
        .search-result-cat {
          font-size: 11px;
          color: var(--text-muted);
        }
        .search-result-title {
          font-size: var(--text-base);
          margin: 0 0 4px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .search-result-summary {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
