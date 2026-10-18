import { useState, useEffect, useCallback } from 'react';
import type { Photograph, Locale } from '@/types';

interface Props {
  photos: Photograph[];
  locale: Locale;
}

export function Lightbox({ photos, locale }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const activePhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  const handleOpen = (idx: number) => {
    setSelectedIndex(idx);
    document.body.style.overflow = 'hidden';
  };

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
    document.body.style.overflow = '';
  }, []);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : photos.length - 1));
  }, [selectedIndex, photos.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! < photos.length - 1 ? prev! + 1 : 0));
  }, [selectedIndex, photos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleClose, handlePrev, handleNext]);

  // Expose trigger globally so any photo card on the page can open the lightbox
  useEffect(() => {
    (window as any).openLightbox = handleOpen;
    return () => {
      delete (window as any).openLightbox;
    };
  }, []);

  if (activePhoto === null) return null;

  const title = activePhoto.title[locale] || activePhoto.title.en;
  const caption = activePhoto.caption[locale] || activePhoto.caption.en;
  const desc = activePhoto.description ? activePhoto.description[locale] || activePhoto.description.en : null;

  return (
    <div className="lightbox-backdrop" onClick={handleClose} role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="lightbox-close-btn"
        onClick={handleClose}
        aria-label="Close photo viewer (Esc)"
      >
        ✕
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox-nav-btn prev"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous photograph"
          >
            ‹
          </button>
          <button
            type="button"
            className="lightbox-nav-btn next"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next photograph"
          >
            ›
          </button>
        </>
      )}

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-image-container">
          <img
            src={activePhoto.imageUrl}
            alt={activePhoto.altText || title}
            className="lightbox-image"
          />
        </div>

        <div className="lightbox-details">
          <div className="lightbox-header">
            <h3 className="lightbox-title">{title}</h3>
            <span className="lightbox-counter">
              {(selectedIndex ?? 0) + 1} / {photos.length}
            </span>
          </div>

          {caption && <p className="lightbox-caption">{caption}</p>}
          {desc && <p className="lightbox-desc">{desc}</p>}

          <div className="lightbox-meta">
            {activePhoto.location && (
              <span className="lightbox-meta-item">
                📍 {activePhoto.location}
              </span>
            )}
            {activePhoto.camera && (
              <span className="lightbox-meta-item">
                📷 {activePhoto.camera} {activePhoto.lens ? `· ${activePhoto.lens}` : ''}
              </span>
            )}
            {(activePhoto.aperture || activePhoto.shutterSpeed || activePhoto.iso) && (
              <span className="lightbox-meta-item">
                ⚙️ {[activePhoto.focalLength, activePhoto.aperture, activePhoto.shutterSpeed, activePhoto.iso ? `ISO ${activePhoto.iso}` : ''].filter(Boolean).join(' · ')}
              </span>
            )}
            {activePhoto.collection && (
              <span className="tag">{activePhoto.collection}</span>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .lightbox-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(12, 13, 15, 0.94);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          backdrop-filter: blur(6px);
        }
        .lightbox-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2010;
          transition: background 0.2s;
        }
        .lightbox-close-btn:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        .lightbox-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2010;
          transition: background 0.2s;
        }
        .lightbox-nav-btn:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        .lightbox-nav-btn.prev { left: 1.5rem; }
        .lightbox-nav-btn.next { right: 1.5rem; }
        .lightbox-content {
          max-width: 1000px;
          max-height: 90vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-surface);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        .lightbox-image-container {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #000;
          max-height: 65vh;
          overflow: hidden;
        }
        .lightbox-image {
          max-height: 65vh;
          max-width: 100%;
          object-fit: contain;
        }
        .lightbox-details {
          padding: 1.25rem 1.5rem;
          width: 100%;
          background: var(--bg-surface);
        }
        .lightbox-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.5rem;
        }
        .lightbox-title {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          margin: 0;
          color: var(--text-primary);
        }
        .lightbox-counter {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .lightbox-caption {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }
        .lightbox-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .lightbox-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }
        @media (max-width: 640px) {
          .lightbox-nav-btn { display: none; }
        }
      `}</style>
    </div>
  );
}

