import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Visitor } from '../types/visitor.types';
import { User, Phone, Tag, Car, Check, X, ShieldAlert } from 'lucide-react';

interface PendingApprovalCardProps {
  visitor: Visitor;
  onApprove: (visitorId: number) => void;
  onReject: (visitorId: number) => void;
  loading?: boolean;
}

export const PendingApprovalCard: React.FC<PendingApprovalCardProps> = ({
  visitor,
  onApprove,
  onReject,
  loading,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="card border-warning shadow-sm rounded-3 overflow-hidden bg-white mb-3"
      style={{ borderWidth: '2px', backgroundColor: '#fffdf5' }}
    >
      <div className="card-header bg-warning bg-opacity-10 border-bottom border-warning border-opacity-25 px-3 py-2.5 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2 text-warning-emphasis fw-bold small">
          <ShieldAlert size={18} className="text-warning" />
          <span>{t('visitors.walkin_request_at_gate')}</span>
        </div>
        <span className="badge bg-warning text-dark rounded-pill px-2.5">{t('visitors.awaiting_response')}</span>
      </div>

      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-start gap-3 flex-column flex-sm-row">
          {visitor.photoUrl ? (
            <img
              src={visitor.photoUrl}
              alt={visitor.name}
              className="rounded-3 flex-shrink-0 object-fit-cover border border-warning border-opacity-50"
              style={{ width: 84, height: 84 }}
            />
          ) : (
            <div
              className="rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning border border-warning"
              style={{ width: 84, height: 84 }}
            >
              <User size={38} />
            </div>
          )}

          <div className="flex-grow-1 w-100">
            <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
              {visitor.name}
            </h5>

            <div className="d-flex align-items-center gap-3 text-muted small flex-wrap mb-2">
              <span className="d-flex align-items-center gap-1">
                <Phone size={14} />
                {visitor.phone}
              </span>
              {visitor.vehicleNumber && (
                <span className="d-flex align-items-center gap-1 fw-medium text-dark">
                  <Car size={14} />
                  {visitor.vehicleNumber}
                </span>
              )}
            </div>

            <div className="p-2.5 rounded-2 bg-white border text-secondary small">
              <div className="d-flex align-items-center gap-1.5 fw-medium text-dark mb-0.5">
                <Tag size={14} className="text-muted flex-shrink-0" />
                <span>{t('visitors.purpose_label', { purpose: visitor.purpose })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-end gap-2 mt-3 pt-2 border-top">
          <button
            className="btn btn-outline-danger btn-sm rounded-2 d-inline-flex align-items-center gap-1.5 px-3 fw-semibold"
            disabled={loading}
            onClick={() => onReject(visitor.id)}
          >
            <X size={16} />
            {t('visitors.reject_entry')}
          </button>
          <button
            className="btn btn-success btn-sm rounded-2 d-inline-flex align-items-center gap-1.5 px-4 fw-semibold text-white shadow-sm"
            disabled={loading}
            onClick={() => onApprove(visitor.id)}
          >
            <Check size={16} />
            {t('visitors.approve_entry')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalCard;
