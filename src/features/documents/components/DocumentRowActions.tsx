import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DocumentRequestItem } from '../types/documentRequest.types';

interface DocumentRowActionsProps {
  item: DocumentRequestItem;
  isSent: boolean;
  isAdmin: boolean;
  onUpload: (item: DocumentRequestItem) => void;
  onReject: (item: DocumentRequestItem) => void;
  onCancel: (id: number) => void;
  onViewDetail: (item: DocumentRequestItem) => void;
  onDownload: (item: DocumentRequestItem) => Promise<void>;
}

const DocumentRowActions = ({
  item,
  isSent,
  isAdmin,
  onUpload,
  onReject,
  onCancel,
  onViewDetail,
  onDownload,
}: DocumentRowActionsProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.dropdown-menu')
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setMenuStyle(
        spaceBelow < 180
          ? { bottom: window.innerHeight - rect.top, left: rect.right - 160, zIndex: 9999, minWidth: '160px' }
          : { top: rect.bottom, left: rect.right - 160, zIndex: 9999, minWidth: '160px' }
      );
    }
    setIsOpen((prev) => !prev);
  };

  const showViewDetail = isAdmin;
  const showDownload = item.status === 'UPLOADED' && Boolean(item.documentUrl);
  const showUpload = (isAdmin && item.status === 'APPROVED') || (!isAdmin && !isSent && item.status === 'PENDING');
  const showDecline = (isAdmin && item.status === 'APPROVED') || (!isAdmin && !isSent && item.status === 'PENDING');
  const showCancel = isSent && item.status === 'PENDING';

  const hasAnyAction = showViewDetail || showDownload || showUpload || showDecline || showCancel;

  if (!hasAnyAction) {
    return <span className="text-muted small">—</span>;
  }

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        onClick={handleToggle}
        className="btn p-0 border-0 text-secondary bg-transparent d-flex align-items-center justify-content-center mx-auto"
        style={{ width: '28px', height: '28px' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#212529')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6c757d')}
        title={t('documents.col_actions')}
      >
        <i className="bi bi-three-dots-vertical fs-5" />
      </button>

      {isOpen && (
        <ul
          className="dropdown-menu shadow-sm border border-light-subtle rounded-3 p-1 show position-fixed"
          style={menuStyle}
        >
          {showViewDetail && (
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small"
                onClick={() => {
                  onViewDetail(item);
                  setIsOpen(false);
                }}
                style={{ fontSize: '0.85rem' }}
              >
                <i className="bi bi-eye text-muted" /> {t('documents.view_details')}
              </button>
            </li>
          )}

          {showDownload && item.documentUrl && (
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-dark"
                onClick={async () => {
                  setIsOpen(false);
                  await onDownload(item);
                }}
                style={{ fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <i className="bi bi-download text-muted" /> {t('documents.download')}
              </button>
            </li>
          )}

          {showUpload && (
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small"
                onClick={() => {
                  onUpload(item);
                  setIsOpen(false);
                }}
                style={{ fontSize: '0.85rem' }}
              >
                <i className="bi bi-upload text-muted" /> {t('documents.upload_document')}
              </button>
            </li>
          )}

          {showDecline && (
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-danger"
                onClick={() => {
                  onReject(item);
                  setIsOpen(false);
                }}
                style={{ fontSize: '0.85rem' }}
              >
                <i className="bi bi-x-circle text-danger" /> {t('documents.decline_request')}
              </button>
            </li>
          )}

          {showCancel && (
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-danger"
                onClick={() => {
                  onCancel(item.id);
                  setIsOpen(false);
                }}
                style={{ fontSize: '0.85rem' }}
              >
                <i className="bi bi-trash text-danger" /> {t('documents.cancel_request')}
              </button>
            </li>
          )}
        </ul>
      )}
    </>
  );
};

export default DocumentRowActions;
