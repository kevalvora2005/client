import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Layers, Maximize2, Home, Mail, Phone, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApartment } from '../hooks/useApartment';
import { formatArea, formatFloor, apartmentTypeLabels } from '../components/apartmentTableHelpers';
import { getAvatarColor, getInitials, formatDate } from '../../residents/components/residentTableHelpers';
import { residentApi } from '../../residents/api/residentApi';
import type { ResidentDetail } from '../../residents/types/resident.types';
import { showError } from '../../../utils/toast';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import AppTable from '../../../components/AppTable/AppTable';
import type { TableColumn } from '../../../components/AppTable/AppTable';
import { StatusBadge } from '../../../components/StatusBadge/StatusBadge';

const ApartmentDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apartment, loading } = useApartment(Number(id));
  const [residents, setResidents] = useState<ResidentDetail[]>([]);
  const [residentsLoading, setResidentsLoading] = useState(false);

  useEffect(() => {
    if (!apartment?.id) return;
    let cancelled = false;
    const fetchResidents = async () => {
      setResidentsLoading(true);
      try {
        const response = await residentApi.getResidents({
          apartmentId: apartment.id,
          pageNumber: 1,
          pageSize: 100,
        });
        if (!cancelled) setResidents(response.items);
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('apartments.fetch_residents_failed')));
      } finally {
        if (!cancelled) setResidentsLoading(false);
      }
    };
    fetchResidents();
    return () => { cancelled = true; };
  }, [apartment?.id, t]);

  const owner = residents.find((r) => r.isOwner && r.isActive) ?? null;
  const tenantHistory = residents
    .filter((r) => !r.isOwner)
    .sort((a, b) => new Date(b.moveInDate).getTime() - new Date(a.moveInDate).getTime());

  const COL_WIDTH = '157px';

  const tenantColumns: TableColumn<ResidentDetail>[] = [
    {
      key: 'name',
      label: t('residents.col_name'),
      width: COL_WIDTH,
      render: (r) => (
        <div className="d-flex align-items-center gap-3 py-1">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
            style={{
              background: getAvatarColor(r.user?.name ?? '').bg,
              color: getAvatarColor(r.user?.name ?? '').color,
              width: '42px',
              height: '42px',
              fontSize: '0.85rem'
            }}
          >
            {getInitials(r.user?.name ?? '?')}
          </div>
          <div>
            <p className="fw-bold m-0 text-dark" style={{ fontSize: '0.925rem', letterSpacing: '-0.01em' }}>
              {r.user?.name}
            </p>
            <p className="m-0 text-muted" style={{ fontSize: '0.8rem' }}>
              {r.user?.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: t('residents.label_phone'),
      width: COL_WIDTH,
      align: 'center',
      render: (r) => (
        <span className="text-dark" style={{ fontSize: '0.875rem' }}>
          {r.user?.phone}
        </span>
      ),
    },
    {
      key: 'moveInDate',
      label: t('residents.move_in_date'),
      width: COL_WIDTH,
      align: 'center',
      render: (r) => (
        <span className="text-dark fw-normal" style={{ fontSize: '0.875rem' }}>
          {formatDate(r.moveInDate)}
        </span>
      ),
    },
    {
      key: 'moveOutDate',
      label: t('residents.move_out_date'),
      width: COL_WIDTH,
      align: 'center',
      render: (r) => (
        <span className="text-dark fw-normal" style={{ fontSize: '0.875rem' }}>
          {formatDate(r.moveOutDate)}
        </span>
      ),
    },
    {
      key: 'occupant',
      label: t('common.status'),
      width: COL_WIDTH,
      align: 'center',
      render: (r) => (
        <StatusBadge variant={r.isOccupant ? 'success' : 'secondary'} label={r.isOccupant ? t('apartments.occupant') : t('apartments.past_tenant')} />
      ),
    },
    {
      key: 'actions',
      label: t('common.view').toUpperCase(),
      width: COL_WIDTH,
      align: 'center',
      render: (r) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
          onClick={() => navigate(`/residents/${r.id}`)}
          style={{ borderRadius: '6px', fontSize: '0.78rem' }}
          title={t('apartments.view_details')}
        >
          <i className="bi bi-eye" />
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--subtitle" />
        <div className="info-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="info-card">
              <div className="skeleton skeleton--label" />
              <div className="skeleton skeleton--value" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="page">
        <div className="error-state">
          <i className="bi bi-exclamation-circle error-state__icon" />
          <p className="error-state__title">{t('apartments.failed_to_load')}</p>
          <button className="back-btn" onClick={() => navigate('/apartments')}>
            <ArrowLeft size={16} /> {t('apartments.back_to_apartments')}
          </button>
        </div>
      </div>
    );
  }

  const infoCards = [
    { icon: Building2, label: t('apartments.label_block'), value: t('apartments.block_prefix', { block: apartment.block }), accent: 'info-card--blue' },
    { icon: Layers, label: t('apartments.label_floor'), value: formatFloor(apartment.floorNumber), accent: 'info-card--green' },
    { icon: Maximize2, label: t('apartments.label_area'), value: `${formatArea(apartment.areaSqft)} sq ft`, accent: 'info-card--purple' },
    { icon: Home, label: t('apartments.label_type'), value: apartmentTypeLabels[apartment.type] ?? apartment.type, accent: 'info-card--amber' },
  ];

  return (
    <div className="page">

      <button className="back-btn" onClick={() => navigate('/apartments')}>
        <ArrowLeft size={16} strokeWidth={2} />
        {t('apartments.back_to_apartments')}
      </button>

      {/* ── Header ── */}
      <div className="detail-header">
        <div className="detail-header__left">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3"
            style={{ width: 56, height: 56, background: '#eff6ff', color: '#2563eb' }}
          >
            <Building2 size={24} strokeWidth={1.75} />
          </div>
          <div>
            <div className="detail-header__name-row">
              <h4 className="detail-header__name">{apartment.block}-{apartment.floorNumber}{apartment.unitNumber}</h4>
              <StatusBadge variant={apartment.isOccupied ? 'success' : 'secondary'} label={apartment.isOccupied ? t('apartments.status_occupied') : t('apartments.status_vacant')} />
              <span className="badge-pill badge-pill--type">
                {apartmentTypeLabels[apartment.type] ?? apartment.type}
              </span>
            </div>
            <div className="detail-header__meta">
              <span>{t('apartments.block_prefix', { block: apartment.block })}</span>
              <span>·</span>
              <span>{formatFloor(apartment.floorNumber)}</span>
              <span>·</span>
              <span>{formatArea(apartment.areaSqft)} sq ft</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="info-grid">
        {infoCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`info-card ${card.accent}`}>
              <div className="info-card__icon-box">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <div>
                <p className="info-card__label">{card.label}</p>
                <p className="info-card__value">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Owner ── */}
      <div className="section-card">
        <div className="section-card__header">
          <h6 className="section-card__title d-flex align-items-center gap-2">
            <Crown size={16} style={{ color: '#d97706' }} /> {t('apartments.owner')}
          </h6>
        </div>

        {owner ? (
          <div
            className="px-4 py-3 d-flex align-items-center justify-content-between"
            onClick={() => navigate(`/residents/${owner.id}`)}
            style={{ cursor: 'pointer', transition: 'background 0.12s' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 48, height: 48, fontSize: '1rem',
                  background: getAvatarColor(owner.user?.name ?? '').bg,
                  color: getAvatarColor(owner.user?.name ?? '').color,
                }}
              >
                {getInitials(owner.user?.name ?? '?')}
              </div>
              <div>
                <p className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#111827', letterSpacing: '-0.01em' }}>
                  {owner.user?.name}
                </p>
                <div className="d-flex align-items-center gap-3 mt-1">
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    <Mail size={13} strokeWidth={1.75} className="me-1" />{owner.user?.email}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    <Phone size={13} strokeWidth={1.75} className="me-1" />{owner.user?.phone}
                  </span>
                </div>
              </div>
            </div>

            <i className="bi bi-chevron-right" style={{ color: '#9ca3af', fontSize: '0.875rem' }} />
          </div>
        ) : (
          <div className="section-card__body--empty">
            <i className="bi bi-person placeholder-icon" />
            <p className="placeholder-text">{t('apartments.no_owner_linked')}</p>
          </div>
        )}
      </div>

      {/* ── Tenant History ── */}
      <div className="section-card">
        <div className="section-card__header">
          <h6 className="section-card__title">{t('apartments.tenant_history')}</h6>
        </div>

        {residentsLoading ? (
          <div className="section-card__body--empty">
            <p className="placeholder-text">{t('apartments.loading_tenants')}</p>
          </div>
        ) : tenantHistory.length > 0 ? (
          <AppTable
            columns={tenantColumns}
            data={tenantHistory}
            loading={residentsLoading}
            rowKey={(r) => r.id!}
            emptyTitle={t('apartments.no_tenants_found')}
            emptySubtitle={t('apartments.no_tenant_history')}
            emptyIcon="bi-people"
          />
        ) : (
          <div className="section-card__body--empty">
            <i className="bi bi-people placeholder-icon" />
            <p className="placeholder-text">{t('apartments.no_tenant_history')}</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ApartmentDetailPage;