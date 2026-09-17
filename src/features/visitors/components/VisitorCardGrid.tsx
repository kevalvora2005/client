import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Visitor, VisitorStatus } from '../types/visitor.types';
import VisitorStatusBadge from './VisitorStatusBadge';
import { highlightMatch } from '../../../utils/highlight';
import { getInitials, getAvatarColor } from '../../residents/components/residentTableHelpers';
import { formatDate, formatDateOnly } from '../../../utils/formatDate';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';

interface VisitorCardGridProps {
  visitors: Visitor[];
  loading: boolean;
  search?: string;
  isResident?: boolean;
  userRole?: 'admin' | 'resident' | 'security';
  onApprove?: (visitorId: number) => void;
  onReject?: (visitorId: number) => void;
  onCancel?: (visitorId: number) => void;
  onCheckIn?: (visitorId: number) => void;
  onCheckOut?: (visitorId: number) => void;
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

const VisitorCardGrid: React.FC<VisitorCardGridProps> = ({
  visitors,
  loading,
  search = '',
  isResident = false,
  userRole = 'resident',
  onApprove,
  onReject,
  onCancel,
  onCheckIn,
  onCheckOut,
  onPreRegister,
}) => {
  const { t } = useTranslation();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="row row-cols-1 row-cols-md-2 g-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="col">
            <div className="card bg-white border border-light-subtle rounded-3 p-3.5 shadow-xs">
              <div className="d-flex align-items-center gap-3">
                <div className="skeleton rounded-circle" style={{ width: '42px', height: '42px' }} />
                <div className="flex-grow-1">
                  <div className="skeleton mb-2" style={{ width: '140px', height: '16px', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ width: '100px', height: '12px', borderRadius: '4px' }} />
                </div>
              </div>
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
        <p className="text-muted small mb-3">
          {search ? t('visitors.no_visitors_match') : t('visitors.no_visitors_recorded')}
        </p>
        {isResident && onPreRegister && (
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-2 px-3 py-1.5 fw-semibold"
            onClick={onPreRegister}
          >
            {t('visitors.pre_register_first')}
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="row row-cols-1 row-cols-md-2 g-3">
        {visitors.map((v) => {
          const statusColor = getStatusBorderColor(v.status);
          const { bg, color } = getAvatarColor(v.name);

          return (
            <div key={v.id} className="col">
              <div
                className="card bg-white border border-light-subtle rounded-3 shadow-sm h-100 overflow-hidden d-flex flex-column"
                style={{ borderLeft: `4px solid ${statusColor}` }}
              >
                {/* ── Card Header ── */}
                <div className="p-3 bg-white border-bottom border-light-subtle d-flex align-items-center justify-content-between gap-2">
                  <div className="d-flex align-items-center gap-2.5 min-w-0 flex-grow-1">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold shadow-xs border border-white"
                      style={{
                        background: bg,
                        color: color,
                        width: '42px',
                        height: '42px',
                        fontSize: '0.88rem',
                      }}
                    >
                      {getInitials(v.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h6 className="fw-bold text-dark mb-0 text-truncate" style={{ fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                          {highlightMatch(v.name, search)}
                        </h6>
                        <VisitorStatusBadge status={v.status} size="sm" />
                      </div>
                      <p className="text-muted small mb-0 mt-0.5 text-truncate" style={{ fontSize: '0.78rem' }}>
                        <i className="bi bi-telephone text-secondary me-1" style={{ fontSize: '0.72rem' }} />
                        {highlightMatch(v.phone, search)}
                      </p>
                    </div>
                  </div>

                  <div className="text-end flex-shrink-0 ms-auto">
                    <span className="d-block text-muted small" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                      {t('visitors.logged_time', { time: formatRelativeTime(v.createdAt) })}
                    </span>
                  </div>
                </div>

                {/* ── Card Body ── */}
                <div className="p-3 d-flex flex-column gap-2.5 flex-grow-1 bg-light-subtle">
                  {/* Badges Row */}
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {v.isPreRegistered ? (
                      <span className="badge rounded-pill fw-medium px-2.5 py-1" style={{ fontSize: '0.72rem', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                        <i className="bi bi-shield-check me-1" /> {t('visitors.pre_registered_badge')}
                      </span>
                    ) : (
                      <span className="badge rounded-pill fw-medium px-2.5 py-1" style={{ fontSize: '0.72rem', backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' }}>
                        <i className="bi bi-person-walking me-1" /> {t('visitors.walk_in_badge')}
                      </span>
                    )}

                    {v.vehicleNumber && (
                      <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1 font-monospace" style={{ fontSize: '0.72rem' }}>
                        <i className="bi bi-car-front text-primary me-1" /> {v.vehicleNumber}
                      </span>
                    )}
                  </div>

                  {/* Purpose Box */}
                  <div className="p-3 bg-white rounded-3 border border-light-subtle shadow-xs">
                    <span className="text-uppercase text-muted fw-bold d-block mb-1" style={{ fontSize: '0.66rem', letterSpacing: '0.05em' }}>
                      <i className="bi bi-chat-left-quote text-primary me-1" /> {t('visitors.label_purpose')}
                    </span>
                    <p className="text-dark mb-0" style={{ fontSize: '0.86rem', lineHeight: '1.5', wordBreak: 'break-word' }}>
                      {v.purpose || t('visitors.no_purpose')}
                    </p>
                  </div>

                  {/* Timestamps Row (3 Stat Tiles with Safe Wrapping) */}
                  <div className="row g-2 text-center">
                    <div className="col-4">
                      <div className="p-2 bg-white rounded-2 border border-light-subtle h-100 d-flex flex-column justify-content-center">
                        <span className="text-muted d-block text-uppercase fw-semibold mb-0.5" style={{ fontSize: '0.6rem', letterSpacing: '0.03em' }}>{t('visitors.stat_expected')}</span>
                        <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.74rem', lineHeight: '1.25', wordBreak: 'break-word' }}>
                          {formatDateOnly(v.expectedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 bg-white rounded-2 border border-light-subtle h-100 d-flex flex-column justify-content-center">
                        <span className="text-muted d-block text-uppercase fw-semibold mb-0.5" style={{ fontSize: '0.6rem', letterSpacing: '0.03em' }}>{t('visitors.stat_checkin')}</span>
                        <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.74rem', lineHeight: '1.25', wordBreak: 'break-word' }}>
                          {formatDate(v.checkedInAt)}
                        </span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 bg-white rounded-2 border border-light-subtle h-100 d-flex flex-column justify-content-center">
                        <span className="text-muted d-block text-uppercase fw-semibold mb-0.5" style={{ fontSize: '0.6rem', letterSpacing: '0.03em' }}>{t('visitors.stat_checkout')}</span>
                        <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.74rem', lineHeight: '1.25', wordBreak: 'break-word' }}>
                          {formatDate(v.checkedOutAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Card Footer Actions ── */}
                <div className="p-2.5 bg-white border-top border-light-subtle d-flex align-items-center justify-content-between gap-2 mt-auto">
                  {v.photoUrl ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-light border border-light-subtle text-secondary fw-medium px-2 py-1 d-inline-flex align-items-center gap-1 shadow-xs"
                      onClick={() => setSelectedPhoto(v.photoUrl)}
                      style={{ fontSize: '0.75rem', borderRadius: '6px' }}
                    >
                      <i className="bi bi-image text-primary" /> {t('visitors.view_photo')}
                    </button>
                  ) : (
                    <span className="text-muted small ms-1" style={{ fontSize: '0.75rem' }}>{t('visitors.no_photo_attached')}</span>
                  )}

                  {isResident && v.status === 'Pending' && (
                    <div className="d-flex align-items-center gap-1.5 ms-auto">
                      {!v.isPreRegistered && onApprove && onReject && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-success px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1 rounded-2 shadow-xs"
                            onClick={() => onApprove(v.id)}
                            style={{ fontSize: '0.78rem' }}
                          >
                            <i className="bi bi-check-lg" /> {t('visitors.approve')}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1 rounded-2 shadow-xs"
                            onClick={() => onReject(v.id)}
                            style={{ fontSize: '0.78rem' }}
                          >
                            <i className="bi bi-x-lg" /> {t('visitors.reject')}
                          </button>
                        </>
                      )}

                      {v.isPreRegistered && onCancel && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1 rounded-2 shadow-xs"
                          onClick={() => onCancel(v.id)}
                          style={{ fontSize: '0.78rem' }}
                        >
                          <i className="bi bi-trash3" /> {t('common.cancel')}
                        </button>
                      )}
                    </div>
                  )}

                  {userRole === 'security' && (
                    <div className="d-flex align-items-center gap-1.5 ms-auto">
                      {v.status === 'Approved' && onCheckIn && (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1 rounded-2 shadow-xs"
                          onClick={() => onCheckIn(v.id)}
                          style={{ fontSize: '0.78rem' }}
                        >
                          <i className="bi bi-box-arrow-in-right" /> {t('visitors.check_in_btn')}
                        </button>
                      )}
                      {v.status === 'CheckedIn' && onCheckOut && (
                        <button
                          type="button"
                          className="btn btn-sm btn-dark px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1 rounded-2 shadow-xs"
                          onClick={() => onCheckOut(v.id)}
                          style={{ fontSize: '0.78rem' }}
                        >
                          <i className="bi bi-box-arrow-right" /> {t('visitors.check_out_btn')}
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

export default VisitorCardGrid;
