import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Visitor, VisitorStatus } from '../types/visitor.types';
import VisitorStatusBadge from './VisitorStatusBadge';
import { highlightMatch } from '../../../utils/highlight';
import { getInitials, getAvatarColor } from '../../residents/components/residentTableHelpers';
import { formatDate, formatDateOnly } from '../../../utils/formatDate';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';

interface VisitorAccordionListProps {
  visitors: Visitor[];
  loading: boolean;
  search?: string;
  isResident?: boolean;
  onApprove?: (visitorId: number) => void;
  onReject?: (visitorId: number) => void;
  onCancel?: (visitorId: number) => void;
  onPreRegister?: () => void;
}

const getStatusBorderColor = (status: VisitorStatus) => {
  switch (status) {
    case 'Pending': return '#f59e0b';
    case 'Approved': return '#3b82f6';
    case 'Rejected': return '#ef4444';
    case 'CheckedIn': return '#10b981';
    case 'CheckedOut': return '#6b7280';
    default: return '#cbd5e1';
  }
};

const VisitorAccordionList: React.FC<VisitorAccordionListProps> = ({
  visitors,
  loading,
  search = '',
  isResident = false,
  onApprove,
  onReject,
  onCancel,
  onPreRegister,
}) => {
  const { t } = useTranslation();
  const [accordionOpenId, setAccordionOpenId] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const toggleAccordion = (id: number) => {
    setAccordionOpenId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="d-flex flex-column gap-3 w-100">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card bg-white border border-light-subtle rounded-3 p-3.5 shadow-xs">
            <div className="d-flex align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="skeleton rounded-circle" style={{ width: '42px', height: '42px' }} />
                <div>
                  <div className="skeleton mb-2" style={{ width: '130px', height: '16px', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ width: '90px', height: '12px', borderRadius: '4px' }} />
                </div>
              </div>
              <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visitors.length === 0) {
    return (
      <div className="text-center py-5 px-3 bg-white rounded-3 border border-light-subtle shadow-sm">
        <div
          className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-circle"
          style={{ width: '56px', height: '56px', backgroundColor: '#f3f4f6' }}
        >
          <i className="bi bi-person-badge text-secondary" style={{ fontSize: '1.5rem' }} />
        </div>
        <h6 className="fw-bold text-dark mb-1">{t('visitors.no_visitors_found')}</h6>
        <p className="text-muted small mb-3" style={{ maxWidth: '300px', margin: '0 auto' }}>
          {search ? t('visitors.no_visitors_match') : t('visitors.no_visitors_recorded')}
        </p>
        {isResident && onPreRegister && (
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-2 px-3.5 py-2 fw-medium shadow-xs d-inline-flex align-items-center gap-1.5"
            onClick={onPreRegister}
          >
            <i className="bi bi-plus-lg" />
            {t('visitors.pre_register_first')}
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="accordion d-flex flex-column gap-2.5 w-100" id="visitorsAccordionMobile">
        {visitors.map((v) => {
          const isOpen = accordionOpenId === v.id;
          const statusColor = getStatusBorderColor(v.status);
          const { bg, color } = getAvatarColor(v.name);

          return (
            <div
              key={v.id}
              className={`accordion-item bg-white border border-light-subtle rounded-3 shadow-sm w-100 ${isOpen ? 'overflow-visible' : 'overflow-hidden'}`}
              style={{
                borderLeft: `4px solid ${statusColor}`,
                transition: 'all 0.2s ease',
                position: 'relative',
                zIndex: isOpen ? 50 : 1,
              }}
            >
              {/* ── Collapsed Header Row (Mobile Optimized) ── */}
              <h2 className="accordion-header" id={`heading-${v.id}`}>
                <div
                  className={`accordion-button-custom p-3 d-flex align-items-center justify-content-between gap-2.5 ${isOpen ? 'bg-light-subtle' : 'bg-white'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleAccordion(v.id)}
                >
                  {/* Left: Chevron + Avatar + Name */}
                  <div className="d-flex align-items-center gap-2.5 min-w-0 flex-grow-1">
                    <div className="text-muted flex-shrink-0">
                      <i
                        className="bi bi-chevron-right d-block fw-bold"
                        style={{
                          fontSize: '0.9rem',
                          color: isOpen ? '#1a1f36' : '#9ca3af',
                          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </div>

                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold shadow-xs border border-white"
                      style={{
                        background: bg,
                        color: color,
                        width: '38px',
                        height: '38px',
                        fontSize: '0.82rem',
                      }}
                    >
                      {getInitials(v.name)}
                    </div>

                    <div className="min-w-0">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span
                          className="fw-bold text-dark text-truncate d-block"
                          style={{ fontSize: '0.92rem', color: '#111827', letterSpacing: '-0.01em' }}
                        >
                          {highlightMatch(v.name, search)}
                        </span>
                        <VisitorStatusBadge status={v.status} size="sm" />
                      </div>
                      <span className="text-muted small d-block text-truncate mt-0.5" style={{ fontSize: '0.75rem' }}>
                        {highlightMatch(v.phone, search)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Logged Time */}
                  <div className="d-flex flex-column align-items-end justify-content-center flex-shrink-0 ms-2 text-end">
                    <span className="text-muted small" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                      {formatRelativeTime(v.createdAt)}
                    </span>
                  </div>
                </div>
              </h2>

              {/* ── Expanded Accordion Body ── */}
              <div
                id={`collapse-${v.id}`}
                className={`accordion-collapse collapse ${isOpen ? 'show overflow-visible' : ''}`}
                aria-labelledby={`heading-${v.id}`}
              >
                <div className="accordion-body p-3 bg-light-subtle border-top border-light-subtle d-flex flex-column gap-3 w-100">

                  {/* Badges Bar (Type + Vehicle) */}
                  <div className="d-flex align-items-center gap-2 flex-wrap pb-1 border-bottom border-light-subtle">
                    {v.isPreRegistered ? (
                      <span
                        className="badge rounded-pill fw-medium px-2.5 py-1"
                        style={{ fontSize: '0.72rem', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}
                      >
                        <i className="bi bi-shield-check me-1" />
                        {t('visitors.pre_registered_badge')}
                      </span>
                    ) : (
                      <span
                        className="badge rounded-pill fw-medium px-2.5 py-1"
                        style={{ fontSize: '0.72rem', backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' }}
                      >
                        <i className="bi bi-person-walking me-1" />
                        {t('visitors.walk_in_badge')}
                      </span>
                    )}

                    {v.vehicleNumber && (
                      <span
                        className="badge rounded-pill bg-light text-dark border px-2.5 py-1 font-monospace"
                        style={{ fontSize: '0.72rem' }}
                      >
                        <i className="bi bi-car-front text-primary me-1" />
                        {v.vehicleNumber}
                      </span>
                    )}

                    <a
                      href={`tel:${v.phone}`}
                      className="btn btn-sm btn-light border border-light-subtle text-secondary py-0.5 px-2 ms-auto d-inline-flex align-items-center gap-1 shadow-xs"
                      style={{ fontSize: '0.72rem', borderRadius: '6px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="bi bi-telephone text-primary" /> {t('visitors.call_btn')}
                    </a>
                  </div>

                  {/* Purpose Box */}
                  <div className="p-3 bg-white rounded-3 border border-light-subtle shadow-xs">
                    <div className="d-flex align-items-center gap-1.5 text-uppercase text-muted fw-bold mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                      <i className="bi bi-chat-left-quote text-primary" style={{ fontSize: '0.85rem' }} />
                      {t('visitors.label_purpose')}
                    </div>
                    <p className="text-dark mb-0 fw-normal" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                      {v.purpose || t('visitors.no_purpose')}
                    </p>
                  </div>

                  {/* Details Timestamps Grid */}
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="p-2.5 bg-white rounded-3 border border-light-subtle shadow-xs">
                        <div className="text-uppercase text-muted fw-semibold mb-1" style={{ fontSize: '0.64rem', letterSpacing: '0.05em' }}>
                          <i className="bi bi-calendar-event text-primary me-1" /> {t('visitors.label_expected_or_checkin')}
                        </div>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: '0.8rem' }}>
                          {v.checkedInAt ? formatDate(v.checkedInAt) : v.expectedAt ? formatDateOnly(v.expectedAt) : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="p-2.5 bg-white rounded-3 border border-light-subtle shadow-xs">
                        <div className="text-uppercase text-muted fw-semibold mb-1" style={{ fontSize: '0.64rem', letterSpacing: '0.05em' }}>
                          <i className="bi bi-box-arrow-right text-secondary me-1" /> {t('visitors.label_checkout_time')}
                        </div>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: '0.8rem' }}>
                          {v.checkedOutAt ? formatDate(v.checkedOutAt) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attached Photo */}
                  {v.photoUrl && (
                    <div className="p-3 bg-white rounded-3 border border-light-subtle shadow-xs">
                      <div className="d-flex align-items-center gap-1.5 text-uppercase text-muted fw-bold mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                        <i className="bi bi-camera text-primary" style={{ fontSize: '0.85rem' }} /> {t('visitors.label_attached_photo')}
                      </div>
                      <div
                        className="d-inline-block rounded-2 overflow-hidden border border-light-subtle shadow-xs position-relative hover-shadow"
                        style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                        onClick={() => setSelectedPhoto(v.photoUrl)}
                        title={t('visitors.click_view_photo')}
                      >
                        <img
                          src={v.photoUrl}
                          alt={t('visitors.entry_photo_alt')}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-60 text-white text-center py-0.5" style={{ fontSize: '0.65rem' }}>
                          <i className="bi bi-zoom-in me-1" /> {t('visitors.zoom')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isResident && v.status === 'Pending' && (
                    <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top border-light-subtle">
                      {!v.isPreRegistered && onApprove && onReject && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-success px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 rounded-2 shadow-xs"
                            onClick={() => onApprove(v.id)}
                            style={{ fontSize: '0.82rem' }}
                          >
                            <i className="bi bi-check-circle-fill" /> {t('visitors.approve')}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 rounded-2 shadow-xs"
                            onClick={() => onReject(v.id)}
                            style={{ fontSize: '0.82rem' }}
                          >
                            <i className="bi bi-x-circle" /> {t('visitors.reject')}
                          </button>
                        </>
                      )}

                      {v.isPreRegistered && onCancel && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 rounded-2 shadow-xs"
                          onClick={() => onCancel(v.id)}
                          style={{ fontSize: '0.82rem' }}
                        >
                          <i className="bi bi-trash3" /> {t('common.cancel')}
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Photo Preview Modal ── */}
      {selectedPhoto && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 10050 }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-3 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom p-3 bg-light">
                <h6 className="modal-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-camera text-primary" /> {t('visitors.visitor_photo_title')}
                </h6>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setSelectedPhoto(null)}
                  aria-label={t('common.close')}
                />
              </div>
              <div className="modal-body p-3 text-center bg-white">
                <img
                  src={selectedPhoto}
                  alt={t('visitors.photo_preview_alt')}
                  className="img-fluid rounded-2 border shadow-sm"
                  style={{ maxHeight: '420px', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisitorAccordionList;
