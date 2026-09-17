import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { visitorApi } from '../api/visitorApi';
import type { Visitor } from '../types/visitor.types';
import { X, Phone, MapPin, Car, Clock, Check, User } from 'lucide-react';
import { showError, showSuccess } from '../../../utils/toast';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';

interface VisitorApprovalDialogProps {
  visitorId: number;
  onClose: () => void;
  onDecision: (decision: 'Approve' | 'Reject') => void;
}

const VisitorApprovalDialog = ({ visitorId, onClose, onDecision }: VisitorApprovalDialogProps) => {
  const { t } = useTranslation();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [decision, setDecision] = useState<'Approved' | 'Rejected' | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const effectiveDecision =
    decision ??
    (visitor?.status === 'Approved' ? 'Approved' : visitor?.status === 'Rejected' ? 'Rejected' : null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await visitorApi.getById(visitorId);
        if (!cancelled) {
          setVisitor(data);
          // If already decided, reflect that immediately
          if (data.status === 'Approved' || data.status === 'Rejected') {
            setDecision(data.status);
          }
        }
      } catch {
        showError(t('visitors.load_details_failed'));
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [visitorId, onClose, t]);

  const elapsedMs = visitor?.approvalRequestedAt ? now - new Date(visitor.approvalRequestedAt).getTime() : 0;
  const remainingMs = Math.max(0, 10 * 60 * 1000 - elapsedMs);
  const remainingMins = Math.floor(remainingMs / 60000);
  const remainingSecs = Math.floor((remainingMs % 60000) / 1000);
  const isExpired = remainingMs <= 0;
  const progressPct = Math.min((elapsedMs / (10 * 60 * 1000)) * 100, 100);

  const handleDecision = useCallback(async (d: 'Approve' | 'Reject') => {
    setDeciding(true);
    setDecision(d === 'Approve' ? 'Approved' : 'Rejected');
    try {
      await visitorApi.respond(visitorId, d);
      showSuccess(d === 'Approve' ? t('visitors.respond_approved_success') : t('visitors.respond_rejected_success'));
      onDecision(d);
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      setDecision(null);
      showError(getErrorMessage(err, d === 'Approve' ? t('visitors.respond_approved_failed') : t('visitors.respond_rejected_failed')));
    } finally {
      setDeciding(false);
    }
  }, [visitorId, onDecision, onClose, t]);

  return (
    <>
    <div className="modal d-block bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)', zIndex: 1070 }}>
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content border-0 rounded-3 shadow-lg bg-white">

          {/* Header */}
          <div className="modal-header d-flex align-items-start justify-content-between border-bottom border-light-subtle px-4 py-4 position-relative">
            <div>
              <h5 className="modal-title fw-bold m-0 text-dark" style={{ fontSize: '1rem', color: '#1a1f36' }}>
                {effectiveDecision ? t('visitors.entry_decision_title') : t('visitors.at_gate_title')}
              </h5>
              <p className="text-muted m-0 small" style={{ fontSize: '0.8rem' }}>
                {effectiveDecision
                  ? effectiveDecision === 'Approved'
                    ? t('visitors.decision_approved_desc')
                    : t('visitors.decision_rejected_desc')
                  : t('visitors.approval_request_desc')}
              </p>
            </div>
            <button
              type="button"
              className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
              style={{ top: 22, right: 22, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem', borderRadius: '6px' }}
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <i className="bi bi-x" />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-secondary mb-2" role="status" style={{ width: '2rem', height: '2rem' }} />
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{t('visitors.loading_details')}</p>
              </div>
            ) : !visitor ? null : effectiveDecision ? (
              <div className="text-center py-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '64px', height: '64px', backgroundColor: effectiveDecision === 'Approved' ? '#dcfce7' : '#fee2e2' }}
                >
                  {effectiveDecision === 'Approved' ? (
                    <Check size={32} className="text-success" />
                  ) : (
                    <X size={32} className="text-danger" />
                  )}
                </div>
                <p className="fw-bold mb-1" style={{ fontSize: '1.1rem', color: effectiveDecision === 'Approved' ? '#16a34a' : '#dc2626' }}>
                  {effectiveDecision === 'Approved' ? t('visitors.entry_approved') : t('visitors.entry_rejected')}
                </p>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                  {effectiveDecision === 'Approved' ? t('visitors.access_granted') : t('visitors.access_denied')}
                </p>
              </div>
            ) : (
              <>
                {/* Photo + Name */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  {visitor.photoUrl ? (
                    <img
                      src={visitor.photoUrl}
                      alt={visitor.name}
                      className="rounded-2 flex-shrink-0 object-fit-cover border"
                      style={{ width: '80px', height: '80px', borderColor: '#e5e7eb', cursor: 'pointer' }}
                      onClick={() => setSelectedImage(visitor.photoUrl)}
                      title={t('visitors.click_view_photo')}
                    />
                  ) : (
                    <div
                      className="rounded-2 flex-shrink-0 d-flex align-items-center justify-content-center"
                      style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9' }}
                    >
                      <User size={36} className="text-muted" />
                    </div>
                  )}
                  <div>
                    <h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem', color: '#1a1f36' }}>{visitor.name}</h5>
                    {visitor.apartment && (
                      <span className="badge bg-light text-dark font-monospace" style={{ fontSize: '0.75rem', border: '1px solid #e5e7eb' }}>
                        {visitor.apartment.block}-{visitor.apartment.floorNumber}{visitor.apartment.unitNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="rounded-2 p-3 mb-3" style={{ backgroundColor: '#f9fafb' }}>
                  <div className="row g-3" style={{ fontSize: '0.85rem' }}>
                    <div className="col-6">
                      <span className="text-muted d-block mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('visitors.label_phone')}</span>
                      <div className="fw-medium text-dark d-flex align-items-center gap-1.5">
                        <Phone size={14} className="text-muted" /> {visitor.phone}
                      </div>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('visitors.label_purpose')}</span>
                      <div className="fw-medium text-dark d-flex align-items-center gap-1.5">
                        <MapPin size={14} className="text-muted" /> {visitor.purpose}
                      </div>
                    </div>
                    {visitor.vehicleNumber && (
                      <div className="col-6">
                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('visitors.label_vehicle')}</span>
                        <div className="fw-medium text-dark d-flex align-items-center gap-1.5 font-monospace">
                          <Car size={14} className="text-muted" /> {visitor.vehicleNumber}
                        </div>
                      </div>
                    )}
                    {visitor.approvalRequestedAt && (
                      <div className="col-6">
                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('visitors.label_requested')}</span>
                        <div className="fw-medium text-dark d-flex align-items-center gap-1.5">
                          <Clock size={14} className="text-muted" /> {formatRelativeTime(visitor.approvalRequestedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Countdown Timer */}
                {!isExpired && visitor.approvalRequestedAt && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{t('visitors.time_remaining')}</span>
                      <span className="fw-bold" style={{ fontSize: '0.85rem', color: remainingMs < 2 * 60 * 1000 ? '#dc2626' : '#1a1f36' }}>
                        {remainingMins}:{remainingSecs.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
                      <div
                        style={{
                          width: `${100 - progressPct}%`,
                          height: '100%',
                          backgroundColor: remainingMs < 2 * 60 * 1000 ? '#dc2626' : remainingMs < 5 * 60 * 1000 ? '#f59e0b' : '#16a34a',
                          borderRadius: '2px',
                          transition: 'width 1s linear',
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!loading && visitor && !effectiveDecision && (
            <div className="modal-footer border-top border-light-subtle px-4 py-3 d-flex gap-2">
              {isExpired ? (
                <div className="text-center w-100">
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2" style={{ fontSize: '0.8rem' }}>
                    {t('visitors.request_expired')}
                  </span>
                </div>
              ) : (
                <div className="d-flex gap-2 w-100">
                  <button
                    type="button"
                    className="btn btn-outline-danger fw-semibold py-2 d-inline-flex align-items-center justify-content-center gap-1.5 flex-grow-1"
                    style={{ height: "38px", borderRadius: "8px", fontSize: "0.875rem" }}
                    onClick={() => handleDecision('Reject')}
                    disabled={deciding}
                  >
                    <X size={16} /> {t('visitors.reject')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-dark fw-medium py-2 d-inline-flex align-items-center justify-content-center gap-1.5 flex-grow-1"
                    style={{ height: "38px", borderRadius: "8px", fontSize: "0.875rem" }}
                    onClick={() => handleDecision('Approve')}
                    disabled={deciding}
                  >
                    {deciding ? (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    ) : (
                      <Check size={16} />
                    )}
                    {t('visitors.approve_entry')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ── Image Lightbox Modal ── */}
    {selectedImage && (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(4px)',
          zIndex: 1080,
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
            alt={t('visitors.photo_preview_alt')}
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
    </>
  );
};

export default VisitorApprovalDialog;
