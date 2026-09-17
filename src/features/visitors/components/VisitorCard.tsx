import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Visitor } from '../types/visitor.types';
import VisitorStatusBadge from './VisitorStatusBadge';
import { User, Phone, Car, Tag, Calendar, Check, X, LogIn, LogOut, Trash2 } from 'lucide-react';
import { formatDate, formatDateOnly } from '../../../utils/formatDate';
import type { UserRole } from '../../auth/types/auth.types';

export interface VisitorCardProps {
  visitor: Visitor;
  userRole?: UserRole | 'admin' | 'resident' | 'security';
  onApprove?: (visitorId: number) => Promise<void> | void;
  onReject?: (visitorId: number) => Promise<void> | void;
  onCheckIn?: (visitorId: number) => Promise<void> | void;
  onCheckOut?: (visitorId: number) => Promise<void> | void;
  onCancel?: (visitorId: number) => Promise<void> | void;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  actionVariant?: 'primary' | 'danger' | 'outline-secondary' | 'success' | 'dark';
}

export const VisitorCard: React.FC<VisitorCardProps> = ({
  visitor,
  userRole = 'resident',
  onApprove,
  onReject,
  onCheckIn,
  onCheckOut,
  onCancel,
  actionLabel,
  onAction,
  actionLoading,
  actionVariant = 'primary',
}) => {
  const { t } = useTranslation();
  return (
    <div
      className="card border-0 shadow-sm rounded-3 overflow-hidden h-100 bg-white"
      style={{
        border: '1px solid rgba(226, 232, 240, 0.8)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div className="card-body p-3 p-md-4 d-flex flex-column">
        {/* Header row: Photo / Avatar + Name + Status Badge */}
        <div className="d-flex align-items-start gap-3 mb-3">
          {visitor.photoUrl ? (
            <img
              src={visitor.photoUrl}
              alt={visitor.name}
              className="rounded-3 flex-shrink-0 object-fit-cover border"
              style={{ width: 56, height: 56, borderColor: '#e2e8f0' }}
            />
          ) : (
            <div
              className="rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center border"
              style={{
                width: 56,
                height: 56,
                backgroundColor: '#f8fafc',
                color: '#64748b',
                borderColor: '#e2e8f0',
              }}
            >
              <User size={26} />
            </div>
          )}

          <div className="flex-grow-1 overflow-hidden">
            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap mb-1">
              <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '0.98rem', color: '#0f172a' }}>
                {visitor.name}
              </h6>
              <VisitorStatusBadge status={visitor.status} size="sm" />
            </div>

            <div className="d-flex align-items-center gap-2 text-muted small flex-wrap" style={{ fontSize: '0.82rem' }}>
              <span className="d-flex align-items-center gap-1">
                <Phone size={13} className="text-secondary" />
                {visitor.phone}
              </span>
              {visitor.isPreRegistered && (
                <span
                  className="badge rounded-pill px-2"
                  style={{ backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: '0.7rem' }}
                >
                  {t('visitors.pre_registered_badge')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details section */}
        <div className="p-3 rounded-3 mb-3 flex-grow-1" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
          <div className="row g-2" style={{ fontSize: '0.83rem' }}>
            <div className="col-12">
              <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t('visitors.label_purpose')}
              </span>
              <div className="fw-medium text-dark d-flex align-items-center gap-1.5">
                <Tag size={14} className="text-secondary flex-shrink-0" />
                <span>{visitor.purpose}</span>
              </div>
            </div>

            {visitor.vehicleNumber && (
              <div className="col-12 col-sm-6 mt-2">
                <span className="text-muted d-block small mb-0.5 fw-medium" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  {t('visitors.label_vehicle')}
                </span>
                <div className="fw-semibold text-dark d-flex align-items-center gap-1.5">
                  <Car size={14} className="text-secondary flex-shrink-0" />
                  <span>{visitor.vehicleNumber}</span>
                </div>
              </div>
            )}

            {visitor.expectedAt && (
              <div className="col-12 col-sm-6 mt-2">
                <span className="text-muted d-block small mb-0.5 fw-medium" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  {t('visitors.label_expected_arrival')}
                </span>
                <div className="text-dark d-flex align-items-center gap-1.5">
                  <Calendar size={14} className="text-secondary flex-shrink-0" />
                  <span>{formatDateOnly(visitor.expectedAt)}</span>
                </div>
              </div>
            )}

            {visitor.checkedInAt && (
              <div className="col-12 col-sm-6 mt-2">
                <span className="text-muted d-block small mb-0.5 fw-medium" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  {t('visitors.label_checked_in')}
                </span>
                <div className="text-success fw-medium d-flex align-items-center gap-1.5">
                  <LogIn size={14} className="flex-shrink-0" />
                  <span>{formatDate(visitor.checkedInAt)}</span>
                </div>
              </div>
            )}

            {visitor.checkedOutAt && (
              <div className="col-12 col-sm-6 mt-2">
                <span className="text-muted d-block small mb-0.5 fw-medium" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  {t('visitors.label_checked_out')}
                </span>
                <div className="text-secondary fw-medium d-flex align-items-center gap-1.5">
                  <LogOut size={14} className="flex-shrink-0" />
                  <span>{formatDate(visitor.checkedOutAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex align-items-center justify-content-end gap-2 flex-wrap pt-1">
          {/* Legacy / Simple action button support */}
          {actionLabel && onAction && (
            <button
              className={`btn btn-${actionVariant} btn-sm rounded-2 d-flex align-items-center gap-1.5 px-3 fw-semibold`}
              onClick={onAction}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <span className="spinner-border spinner-border-sm me-1" role="status" />
              ) : null}
              {actionLabel}
            </button>
          )}

          {/* Resident Actions */}
          {userRole === 'resident' && visitor.status === 'Pending' && (
            <>
              <button
                className="btn btn-outline-danger btn-sm rounded-2 d-flex align-items-center gap-1 px-3 fw-semibold"
                onClick={() => onReject?.(visitor.id)}
              >
                <X size={15} />
                {t('visitors.reject')}
              </button>
              <button
                className="btn btn-success btn-sm rounded-2 d-flex align-items-center gap-1 px-3 text-white fw-semibold shadow-xs"
                onClick={() => onApprove?.(visitor.id)}
              >
                <Check size={15} />
                {t('visitors.approve')}
              </button>
            </>
          )}

          {userRole === 'resident' && visitor.isPreRegistered && !visitor.checkedInAt && visitor.status === 'Approved' && (
            <button
              className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1 text-danger border-danger-subtle"
              onClick={() => onCancel?.(visitor.id)}
            >
              <Trash2 size={14} />
              {t('visitors.cancel_pre_registration')}
            </button>
          )}

          {/* Security Actions */}
          {userRole === 'security' && visitor.status === 'Approved' && (
            <button
              className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1.5 px-3 fw-semibold shadow-xs"
              onClick={() => onCheckIn?.(visitor.id)}
            >
              <LogIn size={15} />
              {t('visitors.check_in_visitor')}
            </button>
          )}

          {userRole === 'security' && visitor.status === 'CheckedIn' && (
            <button
              className="btn btn-dark btn-sm rounded-2 d-flex align-items-center gap-1.5 px-3 fw-semibold shadow-xs"
              onClick={() => onCheckOut?.(visitor.id)}
            >
              <LogOut size={15} />
              {t('visitors.check_out_visitor')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorCard;