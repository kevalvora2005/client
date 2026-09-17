import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNoticesPage } from '../hooks/useNoticesPage';
import { useNoticeMutations } from '../hooks/useNoticeMutations';
import NoticeFilters from '../components/NoticeFilters';
import NoticeForm from '../components/NoticeForm';
import PinnedNoticeCard from '../components/PinnedNoticeCard';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import Pagination from '../../../components/Pagination/Pagination';
import { useScrollLock } from '../../../hooks/useScrollLock';
import useAuth from '../../../hooks/useAuth';
import type { Notice, CreateNoticePayload, UpdateNoticePayload } from '../types/notice.types';

interface NoticesPageProps {
  readOnly?: boolean;
}

const NoticesPage = ({ readOnly: readOnlyProp }: NoticesPageProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const readOnly = readOnlyProp ?? user?.role !== 'admin';

  const {
    notices, loading, filters, updateFilters, changePage, pagination, refetch,
  } = useNoticesPage();

  const { createNotice, updateNotice, deleteNotice, togglePin, loading: mutationLoading } = useNoticeMutations(refetch);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);
  const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);

  useScrollLock(modalOpen);

  const handleAdd = async (payload: CreateNoticePayload | UpdateNoticePayload): Promise<boolean> => {
    const success = await createNotice(payload as CreateNoticePayload);
    if (success) { setModalOpen(false); setEditingNotice(null); }
    return success;
  };

  const handleEdit = async (payload: CreateNoticePayload | UpdateNoticePayload): Promise<boolean> => {
    if (!editingNotice) return false;
    const success = await updateNotice(editingNotice.id, payload as UpdateNoticePayload);
    if (success) { setModalOpen(false); setEditingNotice(null); }
    return success;
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNotice) return;
    await deleteNotice(deletingNotice.id);
    setDeletingNotice(null);
  };

  const openAddModal = () => { setEditingNotice(null); setModalOpen(true); };
  const openEditModal = (notice: Notice) => { setEditingNotice(notice); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingNotice(null); };

  const allItems = notices?.items ?? [];
  const pinnedItems = allItems.filter(n => n.isPinned);
  const regularItems = allItems.filter(n => !n.isPinned);

  return (
    <div className="container-fluid p-3 p-md-4">

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <h4 className="fw-bold mb-2 fs-4 fs-sm-3" style={{ color: '#1a1f36' }}>
            {t('notices.title')}
          </h4>
          <p className="text-muted mb-0 small">
            {t('notices.subtitle')}
          </p>
        </div>
        {!readOnly && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              className="btn btn-dark fw-medium d-inline-flex align-items-center gap-2 px-3 py-2"
              onClick={openAddModal}
              style={{ fontSize: '0.875rem', borderRadius: '8px', backgroundColor: '#1a1f36', borderColor: '#1a1f36' }}
            >
              <i className="bi bi-plus-lg" /> {t('notices.add_notice')}
            </button>
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="mb-4">
        <NoticeFilters filters={filters} onFilterChange={updateFilters} />
      </div>

      {/* ── Pinned Section ── */}
      {pinnedItems.length > 0 && (
        <div className="mb-4">
          <p className="text-uppercase fw-semibold mb-3" style={{ fontSize: '0.72rem', color: '#6b7280', letterSpacing: '0.08em' }}>
            <i className="bi bi-pin-angle-fill me-1" /> {t('notices.pinned_announcements')}
          </p>
          <div className="row g-3">
            {pinnedItems.map((notice) => (
              <div key={notice.id} className="col-12 col-md-6 col-lg-4">
                <PinnedNoticeCard
                  notice={notice}
                  onEdit={openEditModal}
                  onTogglePin={(n) => togglePin(n.id)}
                  readOnly={readOnly}
                  isExpanded={expandedNoticeId === notice.id}
                  onToggleExpand={() => setExpandedNoticeId(expandedNoticeId === notice.id ? null : notice.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Notices ── */}
      {!loading && regularItems.length > 0 && (
        <div className="mb-4">
          <p className="text-uppercase fw-semibold mb-3" style={{ fontSize: '0.72rem', color: '#6b7280', letterSpacing: '0.08em' }}>
            <i className="bi bi-megaphone me-1" /> {t('notices.recent_notices')}
          </p>
          <div className="row g-3">
            {regularItems.map((notice) => (
              <div key={notice.id} className="col-12 col-md-6 col-lg-4">
                <PinnedNoticeCard
                  notice={notice}
                  onEdit={openEditModal}
                  onDelete={(n) => setDeletingNotice(n)}
                  onTogglePin={(n) => togglePin(n.id)}
                  readOnly={readOnly}
                  isExpanded={expandedNoticeId === notice.id}
                  onToggleExpand={() => setExpandedNoticeId(expandedNoticeId === notice.id ? null : notice.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <div className="row g-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="col-12 col-md-6 col-lg-4">
              <div className="rounded-3 p-3" style={{ border: '1px solid #e5e7eb', background: '#fff' }}>
                <div className="skeleton mb-2" style={{ width: '30%', height: 20, borderRadius: 20 }} />
                <div className="skeleton mb-2" style={{ width: '80%', height: 16, borderRadius: 4 }} />
                <div className="skeleton mb-1" style={{ width: '100%', height: 12, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: '60%', height: 12, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && regularItems.length === 0 && pinnedItems.length === 0 && (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
          <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64, backgroundColor: '#f3f4f6' }}>
            <i className="bi bi-megaphone" style={{ fontSize: '1.6rem', color: '#9ca3af' }} />
          </div>
          <p className="fw-semibold mb-1" style={{ fontSize: '0.95rem', color: '#4b5563' }}>{t('notices.empty_title')}</p>
          <p className="text-secondary small mb-0" style={{ maxWidth: 280 }}>
            {t('notices.empty_desc')}
          </p>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && (notices?.items?.length ?? 0) > 0 && (
        <div className="d-flex justify-content-end mb-4">
          <Pagination
            pagination={pagination}
            onPageChange={changePage}
            onPageSizeChange={(size) => updateFilters({ pageSize: size })}
          />
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="modal d-block bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-3 shadow-lg bg-white">
              <div className="modal-header border-bottom border-light-subtle px-3 px-sm-4 pt-4 pb-3 align-items-start position-relative">
                <div>
                  <h5 className="modal-title fw-bold fs-6" style={{ color: '#1a1f36' }}>
                    {editingNotice ? t('notices.edit_notice', { title: editingNotice.title }) : t('notices.add_notice')}
                  </h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                    {editingNotice ? t('notices.edit_desc') : t('notices.add_desc')}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
                  style={{ top: 22, right: 22, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem', borderRadius: '6px' }}
                  onClick={closeModal}
                  disabled={mutationLoading}
                  aria-label={t('common.close')}
                >
                  <i className="bi bi-x" />
                </button>
              </div>
              <div className="modal-body p-3 p-sm-4">
                <NoticeForm
                  notice={editingNotice}
                  loading={mutationLoading}
                  onSubmit={editingNotice ? handleEdit : handleAdd}
                  onCancel={closeModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={!!deletingNotice}
        title={t('notices.delete_confirm_title')}
        message={deletingNotice ? t('notices.delete_confirm_msg', { title: deletingNotice.title }) : ''}
        confirmLabel={t('notices.delete_btn')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={mutationLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingNotice(null)}
      />
    </div>
  );
};

export default NoticesPage;