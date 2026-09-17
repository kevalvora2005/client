import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AppTable, { type TableColumn } from '../../../components/AppTable/AppTable';
import type { Visitor } from '../types/visitor.types';
import VisitorStatusBadge from './VisitorStatusBadge';
import { highlightMatch } from '../../../utils/highlight';
import { getInitials, getAvatarColor } from '../../residents/components/residentTableHelpers';
import { formatDate, formatDateOnly } from '../../../utils/formatDate';

interface VisitorTableProps {
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
}

const VisitorTable: React.FC<VisitorTableProps> = ({
  visitors,
  loading,
  search = '',
  isResident,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const columns: TableColumn<Visitor>[] = useMemo(() => [
    {
      key: 'name',
      label: t('visitors.col_visitor_details'),
      width: '14.28%',
      align: 'start',
      headerAlign: 'start',
      headerPaddingLeft: '1.25rem',
      render: (v) => {
        const { bg, color } = getAvatarColor(v.name);
        return (
          <div className="d-flex align-items-center gap-3 py-1.5 ps-2">
            {v.photoUrl ? (
              <img
                src={v.photoUrl}
                alt={v.name}
                className="rounded-circle flex-shrink-0 object-fit-cover border border-white shadow-xs"
                style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                onClick={() => setSelectedPhoto(v.photoUrl)}
                title={t('visitors.click_view_photo')}
              />
            ) : (
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold shadow-xs border border-white"
                style={{
                  background: bg,
                  color: color,
                  width: '40px',
                  height: '40px',
                  fontSize: '0.85rem',
                }}
              >
                {getInitials(v.name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="fw-semibold text-dark m-0 text-truncate" style={{ fontSize: '0.9rem', lineHeight: '1.3' }}>
                {highlightMatch(v.name, search)}
              </p>
              <p className="m-0 text-muted small d-flex align-items-center gap-1 mt-0.5" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-telephone text-secondary" style={{ fontSize: '0.75rem' }} />
                {highlightMatch(v.phone, search)}
              </p>
              {v.vehicleNumber && (
                <span className="badge bg-light text-secondary border border-light-subtle mt-1 font-monospace" style={{ fontSize: '0.68rem', fontWeight: 500 }}>
                  <i className="bi bi-car-front me-1" />
                  {v.vehicleNumber}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    ...(!isResident
      ? [{
          key: 'apartment',
          label: t('visitors.col_apartment'),
          width: '14.28%',
          align: 'center' as const,
          headerAlign: 'center' as const,
          render: (v: Visitor) => {
            const apt = v.apartment;
            const occupantName = v.resident?.user?.name;
            return (
              <div className="d-flex flex-column align-items-center py-1">
                {apt ? (
                  <span className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                    {apt.block}-{apt.floorNumber}{apt.unitNumber}
                  </span>
                ) : (
                  <span className="text-secondary small fw-medium" style={{ fontSize: '0.825rem' }}>
                    #{v.apartmentId}
                  </span>
                )}
                {occupantName && (
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {occupantName}
                  </span>
                )}
              </div>
            );
          },
        }]
      : []),
    {
      key: 'type',
      label: t('visitors.col_type'),
      width: '14.28%',
      align: 'center',
      headerAlign: 'center',
      render: (v) => (
        <div className="d-flex justify-content-center py-1">
          {v.isPreRegistered ? (
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill fw-medium px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
              {t('visitors.pre_registered_badge')}
            </span>
          ) : (
            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill fw-medium px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
              {t('visitors.walk_in_badge')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'purpose',
      label: t('visitors.col_purpose'),
      width: '14.28%',
      align: 'center',
      headerAlign: 'center',
      render: (v) => (
        <p className="m-0 text-secondary text-center small py-1" style={{ fontSize: '0.84rem', lineHeight: '1.45', wordBreak: 'break-word' }} title={v.purpose}>
          {v.purpose || '—'}
        </p>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      width: '14.28%',
      align: 'center',
      headerAlign: 'center',
      render: (v) => (
        <div className="d-flex justify-content-center py-1">
          <VisitorStatusBadge status={v.status} size="sm" />
        </div>
      ),
    },
    {
      key: 'checkIn',
      label: t('visitors.col_checkin_expected'),
      width: '14.28%',
      align: 'center',
      headerAlign: 'center',
      render: (v) => (
        <div className="d-flex justify-content-center py-1">
          <span className="text-secondary small fw-medium" style={{ fontSize: '0.825rem' }}>
            {v.checkedInAt ? (
              <span className="text-dark">{formatDate(v.checkedInAt)}</span>
            ) : v.expectedAt ? (
              <span className="text-primary">{t('visitors.exp_prefix', { date: formatDateOnly(v.expectedAt) })}</span>
            ) : (
              '—'
            )}
          </span>
        </div>
      ),
    },
    {
      key: 'checkOut',
      label: t('visitors.col_checkout'),
      width: '14.28%',
      align: 'center',
      headerAlign: 'center',
      render: (v) => (
        <div className="d-flex justify-content-center py-1">
          <span className="text-secondary small fw-medium" style={{ fontSize: '0.825rem' }}>
            {formatDate(v.checkedOutAt)}
          </span>
        </div>
      ),
    },
    ...(isResident
      ? [{
          key: 'actions',
          label: '',
          width: '6%',
          align: 'center' as const,
          headerAlign: 'center' as const,
          render: (v: Visitor) =>
            v.isPreRegistered && v.status !== 'CheckedIn' && v.status !== 'CheckedOut' && v.status !== 'Cancelled' && onCancel ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1 rounded-2"
                onClick={() => onCancel(v.id)}
                style={{ fontSize: '0.78rem' }}
                title={t('visitors.cancel_pre_registration')}
              >
                <i className="bi bi-x-lg" />
              </button>
            ) : null,
        }]
      : []),
  ], [t, isResident, search, onCancel]);

  return (
    <>
      <AppTable
        columns={columns}
        data={visitors}
        loading={loading}
        rowKey={(v) => v.id}
        minWidth="960px"
        emptyTitle={t('visitors.no_visitors_found')}
        emptySubtitle={search ? t('visitors.no_visitors_match') : t('visitors.no_visitors_recorded')}
        emptyIcon="bi-person-badge"
      />

      {/* ── Photo Preview Modal ── */}
      {selectedPhoto && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10050 }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-3 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom p-3 bg-light">
                <h6 className="modal-title fw-bold text-dark mb-0">{t('visitors.visitor_photo_title')}</h6>
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
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisitorTable;
