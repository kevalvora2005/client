import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppTable from '../../../components/AppTable/AppTable';
import type { TableColumn } from '../../../components/AppTable/AppTable';
import type { TenantRequest } from '../types/tenantRequest.types';
import { formatDateOnly } from '../../../utils/formatDate';

const AVATAR_COLORS = [
  { bg: '#e8eaf6', color: '#3949ab' },
  { bg: '#e3f2fd', color: '#1565c0' },
  { bg: '#fce4ec', color: '#c62828' },
  { bg: '#e8f5e9', color: '#2e7d32' },
  { bg: '#fff3e0', color: '#e65100' },
  { bg: '#f3e5f5', color: '#6a1b9a' },
  { bg: '#e0f2f1', color: '#00695c' },
];

const getAvatarColor = (name: string) => {
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

interface TenantRequestTableProps {
  requests: TenantRequest[];
  loading: boolean;
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  Pending: { bg: '#fef3c7', color: '#92400e' },
  Approved: { bg: '#dcfce7', color: '#166534' },
  Rejected: { bg: '#fee2e2', color: '#991b1b' },
};

const WIDTH = '16.66%';

const TenantRequestTable = ({ requests, loading }: TenantRequestTableProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns: TableColumn<TenantRequest>[] = useMemo(
    () => [
      {
        key: 'tenant',
        label: t('tenantRequests.col_tenant_name'),
        width: WIDTH,
        headerPaddingLeft: '1.5rem',
        render: (r) => {
          const { bg, color } = getAvatarColor(r.tenantName);
          return (
            <div className="d-flex align-items-center gap-3 py-1">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                style={{
                  background: bg,
                  color: color,
                  width: '42px',
                  height: '42px',
                  fontSize: '0.85rem',
                }}
              >
                {getInitials(r.tenantName)}
              </div>
              <div className="text-start">
                <p className="fw-bold m-0 text-dark" style={{ fontSize: '0.925rem', letterSpacing: '-0.01em' }}>
                  {r.tenantName}
                </p>
                <p className="m-0 text-muted" style={{ fontSize: '0.8rem' }}>
                  {r.tenantEmail}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        key: 'requester',
        label: t('tenantRequests.col_requested_by'),
        width: WIDTH,
        align: 'center',
        render: (r) => (
          <div className="text-center">
            <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.9rem' }}>
              {r.owner?.user?.name ?? t('tenantRequests.owner_number', { number: r.requestedBy })}
            </span>
            {r.owner?.user?.email && (
              <span className="text-muted d-block" style={{ fontSize: '0.78rem' }}>
                {r.owner.user.email}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'apartment',
        label: t('tenantRequests.col_apartment'),
        width: WIDTH,
        align: 'center',
        render: (r) => (
          <span className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
            {r.apartment
              ? `${r.apartment.block}-${r.apartment.floorNumber}${r.apartment.unitNumber}`
              : t('tenantRequests.apt_number', { number: r.apartmentId })}
          </span>
        ),
      },
      {
        key: 'moveInDate',
        label: t('tenantRequests.col_move_in'),
        width: WIDTH,
        align: 'center',
        render: (r) => (
          <span className="text-dark" style={{ fontSize: '0.875rem' }}>
            {formatDateOnly(r.moveInDate)}
          </span>
        ),
      },
      {
        key: 'status',
        label: t('common.status'),
        width: WIDTH,
        align: 'center',
        render: (r) => {
          const s = STATUS_BADGE[r.status] ?? STATUS_BADGE.Pending;
          return (
            <span className="fw-semibold px-3 py-2 rounded-pill" style={{ backgroundColor: s.bg, color: s.color, fontSize: '0.78rem' }}>
              {t(`status.${r.status.toLowerCase()}`)}
            </span>
          );
        },
      },
      {
        key: 'actions',
        label: t('common.actions'),
        width: WIDTH,
        align: 'center',
        render: (r) => (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            onClick={(e) => { e.stopPropagation(); navigate(`/tenant-requests/${r.id}`); }}
            style={{ borderRadius: '6px', fontSize: '0.78rem' }}
          >
            <i className="bi bi-eye" />
          </button>
        ),
      },
    ],
    [t, navigate]
  );

  return (
    <AppTable
      columns={columns}
      data={requests}
      loading={loading}
      rowKey={(r) => r.id}
      emptyTitle={t('tenantRequests.no_tenant_requests')}
      emptySubtitle={t('tenantRequests.no_tenant_requests_subtitle')}
      emptyIcon="bi-clipboard-data"
      skeletonRows={5}
    />
  );
};

export default TenantRequestTable;
