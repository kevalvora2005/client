import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { complaintApi } from '../api/complaintApi';
import Select from '../../../components/Select/Select';
import Pagination from '../../../components/Pagination/Pagination';
import type { SelectOption } from '../../../components/Select/Select';
import type { PaginatedResult } from '../../../types/pagination.types';
import ComplaintStatusBadge from './ComplaintStatusBadge';
import ComplaintPriorityBadge from './ComplaintPriorityBadge';
import ComplaintComments from './ComplaintComments';
import type { Complaint, ComplaintStatus } from '../types/complaint.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import { useComplaintStore } from '../hooks/useComplaintStore';

interface ComplaintListProps {
  complaints: Complaint[];
  loading: boolean;
  onUpdateStatus?: (complaint: Complaint, status: ComplaintStatus) => void;
  onDeleteComplaint?: (complaintId: number) => Promise<void>;
  isAdmin?: boolean;
  currentUserId?: number;
  disableChat?: boolean;
  hideChatColumn?: boolean;
  showResidentName?: boolean;
  bare?: boolean;
  pagination?: Omit<PaginatedResult<unknown>, 'items'> | null;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const getStatusBorderColor = (status: string): string => {
  switch (status) {
    case 'Open': return '#f59e0b';
    case 'In Progress': return '#3b82f6';
    case 'Resolved': return '#10b981';
    default: return '#6b7280';
  }
};

const ComplaintList = ({
  complaints,
  loading,
  onUpdateStatus,
  onDeleteComplaint,
  isAdmin = false,
  currentUserId,
  disableChat = false,
  hideChatColumn = false,
  showResidentName = false,
  pagination,
  onPageChange,
  onPageSizeChange
}: ComplaintListProps) => {
  const { t } = useTranslation();

  const statusOptions: SelectOption[] = useMemo(
    () => [
      { value: 'Open', label: t('status.open') },
      { value: 'In Progress', label: t('status.in_progress') },
      { value: 'Resolved', label: t('status.resolved') },
    ],
    [t]
  );

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlExpId = searchParams.get('expandedId');

  const [expandedId, setExpandedId] = useState<number | null>(() => {
    return urlExpId ? Number(urlExpId) : null;
  });

  const [prevUrlExpId, setPrevUrlExpId] = useState<string | null>(urlExpId);

  if (prevUrlExpId !== urlExpId) {
    setPrevUrlExpId(urlExpId);
    if (urlExpId) {
      setExpandedId(Number(urlExpId));
    }
  }

  const [expandedDetail, setExpandedDetail] = useState<Complaint | null>(null);
  const [deletingComplaint, setDeletingComplaint] = useState<Complaint | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [accordionOpenId, setAccordionOpenId] = useState<number | null>(null);
  const [detailsMap, setDetailsMap] = useState<Record<number, Complaint>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const toggleAccordion = async (id: number) => {
    if (accordionOpenId === id) {
      setAccordionOpenId(null);
      return;
    }
    setAccordionOpenId(id);

    const complaint = complaints.find((c) => c.id === id);
    if (!complaint?.images && !detailsMap[id]) {
      setLoadingDetailId(id);
      try {
        const detail = await complaintApi.getComplaint(id);
        setDetailsMap((prev) => ({ ...prev, [id]: detail }));
      } catch (err) {
        console.error('Failed to load complaint details', err);
      } finally {
        setLoadingDetailId(null);
      }
    }
  };

  const { filters } = useComplaintStore();
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

  useEffect(() => {
    if (!expandedId) {
      document.body.classList.remove('drawer-open');
      return;
    }
    document.body.classList.add('drawer-open');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedId(null);
        setExpandedDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    let cancelled = false;
    (async () => {
      try {
        const detail = await complaintApi.getComplaint(expandedId);
        if (!cancelled) setExpandedDetail(detail);
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('complaints.load_details_failed')));
      }
    })();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('drawer-open');
      cancelled = true;
    };
  }, [expandedId, setExpandedId, t]);

  const handleCloseDrawer = () => {
    setExpandedId(null);
    setExpandedDetail(null);
  };

  const handleExpand = (complaint: Complaint) => {
    if (expandedId === complaint.id) {
      setExpandedId(null);
      setExpandedDetail(null);
    } else {
      setExpandedId(complaint.id);
      setExpandedDetail(null);
    }
  };

  const handleStatusChange = (complaint: Complaint, value: string) => {
    onUpdateStatus?.(complaint, value as ComplaintStatus);
  };

  const complaintFromList = complaints.find((c) => c.id === expandedId);
  const activeDetail = expandedDetail?.id === expandedId ? expandedDetail : complaintFromList;

  return (
    <div className="w-100">
      {loading ? (
        <div className="d-flex flex-column gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton rounded-3" style={{ height: '76px' }} />
          ))}
        </div>
      ) : (complaints?.length ?? 0) === 0 ? (
        <div className="text-center py-5 px-3 bg-white rounded-3 border border-light-subtle shadow-sm">
          <i className="bi bi-clipboard-check d-block mb-2 text-muted" style={{ fontSize: '2.2rem' }} />
          <h6 className="fw-bold text-dark mb-1">{t('complaints.no_complaints_found')}</h6>
          <p className="text-muted small mb-0">{t('complaints.no_complaints_desc')}</p>
        </div>
      ) : (
        <div className="accordion d-flex flex-column gap-3 w-100" id="complaintsAccordion">
          {complaints.map((c) => {
            const isOpen = accordionOpenId === c.id;
            const detail = detailsMap[c.id] || (c.id === expandedDetail?.id ? expandedDetail : c);
            const images = detail?.images ?? c.images ?? [];
            const isLoadingImages = loadingDetailId === c.id;
            const apt = c.resident?.apartment;
            const aptLabel = apt ? `${apt.block}-${apt.floorNumber}${apt.unitNumber}` : null;
            const statusColor = getStatusBorderColor(c.status);

            return (
              <div
                key={c.id}
                className={`accordion-item bg-white border border-light-subtle rounded-3 shadow-sm w-100 ${isOpen ? 'overflow-visible' : 'overflow-hidden'}`}
                style={{
                  borderLeft: `4px solid ${statusColor}`,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  zIndex: isOpen ? 50 : 1,
                }}
              >
                {/* ── Accordion Header ── */}
                <h2 className="accordion-header" id={`heading-${c.id}`}>
                  <div
                    className={`accordion-button-custom p-3 p-sm-3.5 d-flex align-items-center justify-content-between gap-3 ${isOpen ? 'bg-light-subtle' : 'bg-white'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleAccordion(c.id)}
                  >
                    {/* Left side: Chevron > + Title & Badges */}
                    <div className="d-flex align-items-start gap-3 min-w-0 flex-grow-1">
                      {/* Chevron icon at starting (left) */}
                      <div className="pt-1 text-muted flex-shrink-0">
                        <i
                          className="bi bi-chevron-right d-block fw-bold"
                          style={{
                            fontSize: '0.95rem',
                            color: isOpen ? '#1a1f36' : '#9ca3af',
                            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      </div>

                      {/* Main Info (Title & Badges) */}
                      <div className="d-flex flex-column gap-2 min-w-0 flex-grow-1">
                        <div className="d-flex align-items-start min-w-0">
                          <span
                            className="fw-bold text-dark text-break me-auto"
                            style={{ fontSize: '0.96rem', color: '#111827', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                          >
                            {highlightMatch(c.title, searchVal)}
                          </span>
                        </div>

                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <ComplaintStatusBadge status={c.status} />
                          <ComplaintPriorityBadge priority={c.priority} />
                          {isAdmin && aptLabel && (
                            <span className="badge bg-body-secondary text-secondary border border-light-subtle" style={{ fontSize: '0.72rem', fontWeight: 500 }}>
                              {t('complaints.apartment_label', { label: aptLabel })}
                            </span>
                          )}

                          {/* Chat Icon (directly after Apartment badge) */}
                          {!hideChatColumn && !disableChat && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="btn btn-sm border-0 shadow-none d-inline-flex align-items-center justify-content-center p-0 text-primary"
                                style={{
                                  background: 'transparent',
                                  width: '26px',
                                  height: '26px',
                                  cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExpand(c);
                                }}
                                title={c.status === 'Resolved' ? t('complaints.view_chat_history') : t('complaints.open_chat')}
                              >
                                <i className="bi bi-chat-left-text" style={{ fontSize: '1.15rem' }} />
                              </button>
                            </div>
                          )}

                          {showResidentName && c.resident?.user?.name && (
                            <span className="badge bg-primary-subtle text-primary-emphasis" style={{ fontSize: '0.72rem', fontWeight: 500 }}>
                              {t('complaints.submitted_by', { name: c.resident.user.name })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Far Right Area: Submitted Timestamp (ALWAYS AT LAST) */}
                    <div className="flex-shrink-0 ms-2 text-muted small" style={{ fontSize: '0.73rem', whiteSpace: 'nowrap' }}>
                      <span className="d-none d-sm-inline">{t('complaints.submitted_prefix')}</span>{formatRelativeTime(c.createdAt)}
                    </div>
                  </div>
                </h2>

                {/* ── Accordion Collapse Body ── */}
                <div
                  id={`collapse-${c.id}`}
                  className={`accordion-collapse collapse ${isOpen ? 'show overflow-visible' : ''}`}
                  aria-labelledby={`heading-${c.id}`}
                >
                  <div className="accordion-body p-3 p-sm-3.5 bg-light-subtle border-top border-light-subtle d-flex flex-column gap-3 w-100 overflow-visible">
                    {/* Attached Images */}
                    {isLoadingImages ? (
                      <div className="p-3 bg-white rounded-3 border border-light-subtle d-flex align-items-center gap-2 text-secondary small">
                        <span className="spinner-border spinner-border-sm text-primary" /> {t('complaints.loading_details')}
                      </div>
                    ) : images.length > 0 ? (
                      <div className="p-3 bg-white rounded-3 border border-light-subtle shadow-xs">
                        <span className="text-uppercase text-muted fw-bold d-block mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                          {t('complaints.attached_images', { count: images.length })}
                        </span>
                        <div className="d-flex gap-2 flex-wrap">
                          {images.map((img) => (
                            <div
                              key={img.id}
                              className="d-block rounded-2 overflow-hidden border border-light-subtle shadow-xs hover-shadow"
                              style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(img.imageUrl);
                              }}
                              title={t('complaints.click_to_enlarge')}
                            >
                              <img
                                src={img.imageUrl}
                                alt={t('complaints.image_attachment_alt')}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Description Box */}
                    {c.description && (
                      <div className="p-3 bg-white rounded-3 border border-light-subtle shadow-xs">
                        <span className="text-uppercase text-muted fw-bold d-block mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                          {t('complaints.label_desc')}
                        </span>
                        <p className="text-secondary mb-0" style={{ fontSize: '0.875rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          {highlightMatch(c.description, searchVal)}
                        </p>
                      </div>
                    )}

                    {/* Admin Status Dropdown */}
                    {isAdmin && c.status !== 'Resolved' && onUpdateStatus && (
                      <div className="d-flex align-items-center justify-content-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                        <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                          {t('complaints.update_status_label')}
                        </span>
                        <div style={{ width: '160px' }}>
                          <Select
                            name="status"
                            options={statusOptions}
                            value={c.status}
                            onChange={(e) => handleStatusChange(c, e.target.value)}
                            className="shadow-none border-light-subtle bg-white"
                            style={{ height: '34px', fontSize: '0.82rem', borderRadius: '6px', fontWeight: 500 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Resident Delete Button */}
                    {!isAdmin && onDeleteComplaint && c.status === 'Open' && c.resident?.userId === currentUserId && (
                      <div className="d-flex justify-content-end pt-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold shadow-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingComplaint(c);
                          }}
                          style={{
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            transition: 'all 0.2s ease',
                          }}
                          title={t('complaints.delete_btn')}
                        >
                          <i className="bi bi-trash3" style={{ fontSize: '0.9rem' }} /> {t('complaints.delete_btn')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && (complaints?.length ?? 0) > 0 && pagination && onPageChange && (
        <div className="table-card__footer mt-3">
          <Pagination
            pagination={pagination}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}

      {/* ── Slide-Over Panel (Chat Drawer ONLY) ── */}
      {expandedId && (
        <div className="complaint-drawer-backdrop" onClick={handleCloseDrawer}>
          <div className="complaint-drawer d-flex flex-column h-100" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="complaint-drawer-header d-flex align-items-center justify-content-between p-3 border-bottom border-light-subtle bg-white">
              {activeDetail ? (
                <div className="min-w-0 flex-grow-1 me-2">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className="bi bi-chat-left-text text-primary fs-5" />
                    <h6 className="mb-0 fw-bold text-dark text-break" style={{ fontSize: '1rem', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {activeDetail.title}
                    </h6>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <ComplaintStatusBadge status={activeDetail.status} />
                    <ComplaintPriorityBadge priority={activeDetail.priority} />
                    {isAdmin && activeDetail.resident?.apartment && (
                      <span className="text-secondary small">
                        {t('complaints.apartment_label', { label: `${activeDetail.resident.apartment.block}-${activeDetail.resident.apartment.floorNumber}${activeDetail.resident.apartment.unitNumber}` })}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <h6 className="mb-0 fw-bold text-dark">{t('complaints.chat_title')}</h6>
              )}
              <button
                type="button"
                className="btn-close shadow-none flex-shrink-0"
                onClick={handleCloseDrawer}
                aria-label={t('common.close')}
              />
            </div>

            {/* Drawer Body — Chat Box ONLY */}
            <div className="complaint-drawer-body p-3 flex-grow-1 overflow-y-auto bg-light-subtle">
              {!expandedDetail || expandedDetail.id !== expandedId ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 flex-grow-1">
                  <span className="spinner-border spinner-border-sm text-primary mb-2" />
                  <span className="text-secondary small">{t('complaints.loading_chat')}</span>
                </div>
              ) : (
                <div className="h-100 d-flex flex-column">
                  <ComplaintComments
                    complaintId={expandedDetail.id}
                    status={expandedDetail.status}
                    residentName={expandedDetail.resident?.user?.name ?? 'Unknown'}
                    isAdmin={isAdmin}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deletingComplaint && (
        <ConfirmDialog
          show={!!deletingComplaint}
          title={t('complaints.delete_confirm_title')}
          message={deletingComplaint ? t('complaints.delete_confirm_msg', { title: deletingComplaint.title }) : ''}
          confirmLabel={t('common.delete')}
          cancelLabel={t('common.cancel')}
          variant="danger"
          loading={deleteLoading}
          onConfirm={async () => {
            if (deletingComplaint) {
              setDeleteLoading(true);
              try {
                await onDeleteComplaint?.(deletingComplaint.id);
                setDeletingComplaint(null);
              } finally {
                setDeleteLoading(false);
              }
            }
          }}
          onCancel={() => setDeletingComplaint(null)}
        />
      )}

      {/* ── Image Lightbox Modal ── */}
      {selectedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: 'transparent',
            backdropFilter: 'blur(4px)',
            zIndex: 10500,
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="position-relative bg-dark rounded-4 overflow-hidden d-flex align-items-center justify-content-center shadow-2xl"
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn-close btn-close-white position-absolute top-0 end-0 m-3 shadow-none p-2"
              onClick={() => setSelectedImage(null)}
              style={{ zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%' }}
              aria-label={t('common.close')}
            />
            <img
              src={selectedImage}
              alt={t('complaints.image_attachment_alt')}
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
