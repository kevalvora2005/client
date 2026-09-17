import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Ban, Calendar, Mail, Phone, ArrowRight, UserCheck, Clock } from "lucide-react";
import useTenantHistory from "../hooks/useTenantHistory";
import { tenantRequestApi } from "../api/tenantRequestApi";
import { showError, showSuccess } from "../../../utils/toast";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { getAvatarColor, getInitials } from "../../residents/components/residentTableHelpers";
import { formatDateOnly } from "../../../utils/formatDate";
import type { TenantHistoryItem } from "../../residents/types/resident.types";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import AppTable from "../../../components/AppTable/AppTable";
import type { TableColumn } from "../../../components/AppTable/AppTable";

const TenantHistorySection = () => {
  const { t } = useTranslation();
  const { tenants, loading, notOwner, load } = useTenantHistory();
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState<TenantHistoryItem | null>(null);
  const navigate = useNavigate();

  const currentTenant = tenants.find((t) => t.isActive && !t.moveOutDate);
  const pastTenants = tenants.filter((t) => !(t.isActive && !t.moveOutDate));

  const COL_WIDTH = '157px';

  const pastTenantColumns: TableColumn<TenantHistoryItem>[] = useMemo(
    () => [
      {
        key: 'name',
        label: t('tenantRequests.col_resident_name'),
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
        label: t('tenantRequests.col_phone'),
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
        label: t('tenantRequests.col_move_in_date'),
        width: COL_WIDTH,
        align: 'center',
        render: (r) => (
          <span className="text-dark fw-normal" style={{ fontSize: '0.875rem' }}>
            {formatDateOnly(r.moveInDate)}
          </span>
        ),
      },
      {
        key: 'moveOutDate',
        label: t('tenantRequests.col_move_out_date'),
        width: COL_WIDTH,
        align: 'center',
        render: (r) => (
          <span className="text-dark fw-normal" style={{ fontSize: '0.875rem' }}>
            {formatDateOnly(r.moveOutDate)}
          </span>
        ),
      },
      {
        key: 'occupant',
        label: t('common.status'),
        width: COL_WIDTH,
        align: 'center',
        render: (r) => (
          <span
            className="badge rounded-pill fw-semibold px-3 py-2"
            style={{
              fontSize: '0.75rem',
              backgroundColor: r.isOccupant ? '#dcfce7' : '#e5e7eb',
              color: r.isOccupant ? '#166534' : '#6b7280'
            }}
          >
            {r.isOccupant ? t('tenantRequests.occupant') : t('tenantRequests.past_tenant')}
          </span>
        ),
      },
      {
        key: 'actions',
        label: t('common.view'),
        width: COL_WIDTH,
        align: 'center',
        render: (r) => (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            onClick={() => navigate(`/tenant/${r.id}`)}
            style={{ borderRadius: '6px', fontSize: '0.78rem' }}
            title={t('tenantRequests.view_details')}
          >
            <i className="bi bi-eye" />
          </button>
        ),
      },
    ],
    [t, navigate]
  );

  const handleConfirmRevoke = async () => {
    if (!showRevokeModal) return;
    const tenantToRevoke = showRevokeModal;
    setRevokingId(tenantToRevoke.id);
    try {
      await tenantRequestApi.revokeTenancy();
      showSuccess(t('tenantRequests.toast_tenancy_revoked', { name: tenantToRevoke.user.name }));
      setShowRevokeModal(null);
      await load();
    } catch (err) {
      showError(getErrorMessage(err, t('tenantRequests.toast_revoke_failed')));
    } finally {
      setRevokingId(null);
    }
  };

  if (notOwner) return null;

  return (
    <div className="d-flex flex-column gap-4 mb-4">
      {/* ── Current Active Tenant Section ── */}
      <div className="section-card">
        <div className="section-card__header d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
          <h6 className="section-card__title d-flex align-items-center gap-2 mb-0" style={{ fontSize: '0.95rem', color: '#111827' }}>
            <UserCheck size={18} className="text-success" />
            {t('tenantRequests.current_active_tenant')}
          </h6>
          {currentTenant && (
            <span className="badge-pill badge-pill--active">
              {t('tenantRequests.active_occupant')}
            </span>
          )}
        </div>

        <div className="p-4">
          {loading ? (
            <div className="d-flex flex-column gap-3">
              <div className="skeleton" style={{ height: 100, borderRadius: 12 }} />
              <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
            </div>
          ) : currentTenant ? (
            (() => {
              const { bg, color } = getAvatarColor(currentTenant.user.name);

              const infoCards = [
                { icon: Phone, label: t('tenantRequests.phone_label'), value: currentTenant.user.phone, accent: 'info-card--blue' },
                { icon: Mail, label: t('tenantRequests.email_label'), value: currentTenant.user.email, accent: 'info-card--green' },
                { icon: Calendar, label: t('tenantRequests.move_in_date_label'), value: formatDateOnly(currentTenant.moveInDate), accent: 'info-card--purple' },
                { icon: UserCheck, label: t('tenantRequests.occupancy_label'), value: t('tenantRequests.occupant'), accent: 'info-card--amber' },
              ];

              return (
                <div className="d-flex flex-column gap-4">
                  {/* ── Header Card copied directly from Resident Detail ── */}
                  <div className="detail-header">
                    <div className="detail-header__left min-w-0">
                      <div
                        className="rounded-circle fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 56, height: 56, fontSize: '1rem', background: bg, color }}
                      >
                        {getInitials(currentTenant.user.name)}
                      </div>
                      <div className="min-w-0 flex-grow-1">
                        <div className="detail-header__name-row">
                          <h4 className="detail-header__name text-truncate">{currentTenant.user.name}</h4>
                          <span className="badge-pill badge-pill--active">{t('common.active')}</span>
                          <span className="badge-pill badge-pill--tenant">{t('roles.tenant')}</span>
                        </div>
                        <div className="detail-header__meta">
                          <span><Calendar size={13} strokeWidth={1.75} /> {t('tenantRequests.moved_in_date', { date: formatDateOnly(currentTenant.moveInDate) })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-header__actions d-flex flex-wrap align-items-center gap-2 ms-auto">
                      <button
                        className="btn btn-outline-danger d-inline-flex align-items-center justify-content-center gap-2"
                        style={{ fontSize: '0.875rem', borderRadius: '8px' }}
                        onClick={() => setShowRevokeModal(currentTenant)}
                      >
                        <Ban size={16} /> {t('tenantRequests.revoke_btn')}
                      </button>
                      <button
                        className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2"
                        style={{ fontSize: '0.875rem', borderRadius: '8px' }}
                        onClick={() => navigate(`/tenant/${currentTenant.id}`)}
                      >
                        <ArrowRight size={16} /> {t('tenantRequests.view_details_btn')}
                      </button>
                    </div>
                  </div>

                  {/* ── Info Cards Grid copied directly from Resident Detail ── */}
                  <div className="info-grid">
                    {infoCards.map((card) => {
                      const Icon = card.icon;
                      return (
                        <div key={card.label} className={`info-card ${card.accent}`}>
                          <div className="info-card__icon-box">
                            <Icon size={18} strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0 flex-grow-1">
                            <p className="info-card__label">{card.label}</p>
                            <p className="info-card__value text-truncate" title={String(card.value)}>{card.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="section-card__body--empty text-center py-4">
              <i className="bi bi-clock-history placeholder-icon d-block mb-2" style={{ fontSize: '2rem', color: '#d1d5db' }} />
              <p className="placeholder-text text-muted mb-0">{t('tenantRequests.no_active_tenant')}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Past Tenants History Section ── */}
      <div className="section-card">
        <div className="section-card__header d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
          <h6 className="section-card__title d-flex align-items-center gap-2 mb-0" style={{ fontSize: '0.95rem', color: '#111827' }}>
            <Clock size={18} className="text-secondary" />
            {t('tenantRequests.tenant_history')}
          </h6>
          <span className="badge-pill badge-pill--inactive">
            {pastTenants.length === 1 ? t('tenantRequests.record_one') : t('tenantRequests.record_other', { count: pastTenants.length })}
          </span>
        </div>

        <AppTable
          columns={pastTenantColumns}
          data={pastTenants}
          loading={loading}
          rowKey={(tItem) => tItem.id}
          emptyTitle={t('tenantRequests.no_past_tenants')}
          emptySubtitle={t('tenantRequests.no_past_tenants_subtitle')}
          emptyIcon="bi-people"
        />
      </div>

      <ConfirmDialog
        show={!!showRevokeModal}
        title={t('tenantRequests.revoke_dialog_title')}
        message={
          showRevokeModal
            ? t('tenantRequests.revoke_dialog_message', { name: showRevokeModal.user.name })
            : ""
        }
        confirmLabel={t('tenantRequests.revoke_dialog_confirm')}
        variant="danger"
        loading={!!showRevokeModal && revokingId === showRevokeModal.id}
        onConfirm={handleConfirmRevoke}
        onCancel={() => setShowRevokeModal(null)}
      />
    </div>
  );
};

export default TenantHistorySection;
