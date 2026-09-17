import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { Notice } from '../types/notice.types';
import { useNoticeStore } from '../hooks/useNoticeStore';
import { formatDateOnly } from '../../../utils/formatDate';

const CATEGORY_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  General: { bg: '#e8f0fe', color: '#1a56db', border: '#3b82f6' },
  Maintenance: { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
  Emergency: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
  Event: { bg: '#dcfce7', color: '#166534', border: '#22c55e' },
};

interface PinnedNoticeCardProps {
  notice: Notice;
  onEdit: (notice: Notice) => void;
  onDelete?: (notice: Notice) => void;
  onTogglePin: (notice: Notice) => void;
  readOnly: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const PinnedNoticeCard = ({
  notice,
  onEdit,
  onDelete,
  onTogglePin,
  readOnly,
  isExpanded,
  onToggleExpand,
}: PinnedNoticeCardProps) => {
  const { t } = useTranslation();
  const badge = CATEGORY_BADGE[notice.category] ?? CATEGORY_BADGE.General;
  const [showMenu, setShowMenu] = useState(false);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const expanded = isExpanded !== undefined ? isExpanded : internalExpanded;
  const handleToggleExpand = useCallback(() => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [onToggleExpand]);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    if (!expanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleToggleExpand();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expanded, handleToggleExpand]);

  const { filters } = useNoticeStore();
  const searchVal = filters.search ?? '';

  const highlightMatch = (text: string, search: string) => {
    if (!search || !search.trim()) return <span>{text}</span>;
    const cleanSearch = search.trim();
    const regex = new RegExp(`(${cleanSearch.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark
              key={index}
              style={{
                backgroundColor: '#ffe066',
                color: '#1a1f36',
                padding: '0 2px',
                borderRadius: '3px',
              }}
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <>
      {/* ── Normal In-Flow Card ── */}
      <div
        className="p-3 rounded-3 shadow-sm bg-white"
        style={{ border: '1px solid #e5e7eb' }}
      >
        <div className="d-flex align-items-start justify-content-between mb-2">
          <span
            className="fw-medium"
            style={{ background: badge.bg, color: badge.color, fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px' }}
          >
            {t(`notices.category_${notice.category.toLowerCase()}`)}
          </span>
          {!readOnly && (
            <div className="position-relative" ref={menuRef}>
              <button
                className="btn btn-sm btn-outline-secondary border-0 p-1"
                onClick={() => setShowMenu(!showMenu)}
                style={{ borderRadius: '6px' }}
              >
                <i className="bi bi-three-dots-vertical" style={{ fontSize: '1.1rem' }} />
              </button>
              {showMenu && (
                <div
                  className="position-absolute bg-white rounded-3 border border-light-subtle shadow-sm p-1"
                  style={{ right: 0, top: '110%', minWidth: 140, zIndex: 100 }}
                >
                  <button
                    className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small"
                    onClick={() => { onTogglePin(notice); setShowMenu(false); }}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <i className={`bi ${notice.isPinned ? 'bi-pin' : 'bi-pin-fill'}`} />
                    {notice.isPinned ? t('notices.unpin') : t('notices.pin')}
                  </button>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small"
                    onClick={() => { onEdit(notice); setShowMenu(false); }}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <i className="bi bi-pencil" /> {t('common.edit')}
                  </button>
                  {onDelete && (
                    <button
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-danger"
                      onClick={() => { onDelete(notice); setShowMenu(false); }}
                      style={{ fontSize: '0.85rem' }}
                    >
                      <i className="bi bi-trash3" /> {t('common.delete')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <p className="fw-semibold mb-1" style={{ fontSize: '0.95rem', color: '#1a1f36', lineHeight: '1.4' }}>
          {highlightMatch(notice.title, searchVal)}
        </p>

        <p className="text-secondary mb-2" style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
          {highlightMatch(notice.body.length > 100 ? notice.body.slice(0, 100) + '...' : notice.body, searchVal)}
        </p>

        <div className="d-flex align-items-center justify-content-between">
          <span className="text-muted" style={{ fontSize: '0.72rem' }}>
            <i className="bi bi-calendar3 me-1" />
            {formatDateOnly(notice.publishedAt)}
          </span>
          <button
            className="btn btn-link p-0 fw-medium text-decoration-none"
            onClick={handleToggleExpand}
            style={{ fontSize: '0.78rem', color: badge.color }}
          >
            {t('notices.view_details')} →
          </button>
        </div>
      </div>

      {/* ── Expanded Overlay with Full Screen Blur Portal ── */}
      {expanded && createPortal(
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            zIndex: 1070,
          }}
          onClick={handleToggleExpand}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-3 p-4 shadow-lg position-relative w-100"
            style={{
              maxWidth: '560px',
              border: `1.5px solid ${badge.border}`,
              zIndex: 1080,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-start justify-content-between mb-3">
              <span
                className="fw-medium"
                style={{ background: badge.bg, color: badge.color, fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px' }}
              >
                {t(`notices.category_${notice.category.toLowerCase()}`)}
              </span>
              <button
                type="button"
                className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
                style={{ top: 16, right: 16, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem', borderRadius: '6px' }}
                onClick={handleToggleExpand}
                aria-label={t('common.close')}
              >
                <i className="bi bi-x" />
              </button>
            </div>

            <h5 className="fw-bold mb-2 text-break" style={{ color: '#1a1f36', fontSize: '1.1rem' }}>
              {highlightMatch(notice.title, searchVal)}
            </h5>

            <div className="pt-2 pb-3 my-2" style={{ borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
              <p className="text-secondary mb-0" style={{ fontSize: '0.875rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {highlightMatch(notice.body, searchVal)}
              </p>
            </div>

            <div className="d-flex align-items-center justify-content-between pt-1">
              <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-person me-1" />
                {notice.admin?.name ?? t('roles.admin')}
                <span className="mx-2">•</span>
                <i className="bi bi-calendar3 me-1" />
                {formatDateOnly(notice.publishedAt)}
              </span>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3 fw-medium"
                onClick={handleToggleExpand}
                style={{ borderRadius: '6px', fontSize: '0.82rem' }}
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default PinnedNoticeCard;
