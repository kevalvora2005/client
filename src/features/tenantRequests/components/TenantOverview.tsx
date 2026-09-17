import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Receipt, ClipboardList, Calendar, Mail, Phone, Users, CarFront, UserCheck } from "lucide-react";
import { useComplaints } from "../../complaints/hooks/useComplaints";
import { useInvoicesPage } from "../../maintenance/hooks/useInvoicesPage";
import { maintenanceApi } from "../../maintenance/api/maintenanceApi";
import FamilyMembersSection from "../../myApartment/pages/FamilyMembersSection";
import VehiclesSection from "../../myApartment/pages/VehiclesSection";
import ComplaintList from "../../complaints/components/ComplaintList";
import AppTable from "../../../components/AppTable/AppTable";
import InvoiceStatusBadge from "../../maintenance/components/InvoiceStatusBadge";
import type { TableColumn } from "../../../components/AppTable/AppTable";
import type { Invoice } from "../../maintenance/types/maintenance.types";
import type { TenantHistoryItem } from "../../residents/types/resident.types";
import { getAvatarColor, getInitials } from "../../residents/components/residentTableHelpers";
import { formatDateOnly } from "../../../utils/formatDate";
import { showError } from "../../../utils/toast";

interface TenantOverviewProps {
  tenant: TenantHistoryItem;
  onBack: () => void;
}

const SectionCard = ({ icon: Icon, title, children }: { icon: typeof Receipt; title: string; children: React.ReactNode }) => (
  <div className="card bg-white border border-light-subtle rounded-3 shadow-sm mt-3">
    <div className="card-header bg-white border-bottom border-light-subtle px-3 px-sm-4 py-3 d-flex align-items-center gap-2">
      <Icon size={18} className="text-dark" />
      <h6 className="fw-bold mb-0" style={{ color: '#1a1f36' }}>{title}</h6>
    </div>
    <div className="card-body px-3 px-sm-4 py-3">{children}</div>
  </div>
);

type TabKey = 'family' | 'vehicles' | 'maintenance' | 'complaints';

const TenantOverview = ({ tenant, onBack }: TenantOverviewProps) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('family');

  const TABS: { key: TabKey; label: string; icon: typeof Users }[] = useMemo(
    () => [
      { key: 'family', label: t('tenantRequests.tab_family'), icon: Users },
      { key: 'vehicles', label: t('tenantRequests.tab_vehicles'), icon: CarFront },
      { key: 'maintenance', label: t('tenantRequests.tab_maintenance'), icon: Receipt },
      { key: 'complaints', label: t('tenantRequests.tab_complaints'), icon: ClipboardList },
    ],
    [t]
  );

  const formatMonth = useCallback(
    (month: number, year: number): string =>
      new Intl.DateTimeFormat(i18n.language || 'en', { month: 'long', year: 'numeric' }).format(
        new Date(year, month - 1)
      ),
    [i18n.language]
  );

  const { complaints: complaintData, loading: cLoading } = useComplaints({}, false, false);
  const complaintItems = (complaintData?.items ?? []).filter((c) => c.residentId === tenant.id);

  const { invoices, loading: invLoading } = useInvoicesPage(false, true);
  const invoiceItems = (invoices?.items ?? []).filter((inv) => inv.residentId === tenant.id);

  const handleDownload = useCallback(
    async (invoiceId: number) => {
      try {
        const blob = await maintenanceApi.downloadReceipt(invoiceId);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        showError(t('maintenance.download_failed'));
      }
    },
    [t]
  );

  const isCurrent = tenant.isActive && !tenant.moveOutDate;
  const { bg, color } = getAvatarColor(tenant.user.name);

  const infoCards = [
    { icon: Phone, label: t('tenantRequests.phone_label'), value: tenant.user.phone, accent: 'info-card--blue' },
    { icon: Mail, label: t('tenantRequests.email_label'), value: tenant.user.email, accent: 'info-card--green' },
    { icon: Calendar, label: t('tenantRequests.move_in_date_label'), value: formatDateOnly(tenant.moveInDate) || '—', accent: 'info-card--purple' },
    { icon: UserCheck, label: t('tenantRequests.move_out_date_label'), value: formatDateOnly(tenant.moveOutDate) || '—', accent: 'info-card--amber' },
  ];

  const invoiceColumns: TableColumn<Invoice>[] = useMemo(
    () => [
      {
        key: 'monthYear', label: t('maintenance.col_month_year'), width: '10%', align: 'center',
        render: (inv) => (
          <span className="fw-medium" style={{ fontSize: '0.875rem', color: '#1a1f36' }}>
            {formatMonth(inv.month, inv.year)}
          </span>
        ),
      },
      {
        key: 'baseAmount', label: t('maintenance.col_base_amount'), width: '15%', align: 'center',
        render: (inv) => (
          <span className="fw-medium text-dark" style={{ fontSize: '0.875rem' }}>
            ₹{inv.baseAmount.toFixed(2)}
          </span>
        ),
      },
      {
        key: 'extraCharges', label: t('maintenance.col_extra_charges'), width: '17%', align: 'center',
        render: (inv) => {
          const hasExtra = inv.extraCharges && inv.extraCharges.length > 0;
          if (!hasExtra) return <span className="text-muted" style={{ fontSize: '0.875rem' }}>—</span>;
          return (
            <div className="d-flex flex-wrap justify-content-center gap-1" style={{ maxWidth: '200px', margin: '0 auto' }}>
              {inv.extraCharges.map((charge, idx) => (
                <span
                  key={idx}
                  className="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle"
                  style={{ fontSize: '0.65rem', padding: '2px 5px', fontWeight: 500 }}
                >
                  {charge.label}: ₹{charge.amount}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        key: 'totalAmount', label: t('maintenance.col_total_amount'), width: '17%', align: 'center',
        render: (inv) => (
          <span className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
            ₹{inv.totalAmount.toFixed(2)}
          </span>
        ),
      },
      {
        key: 'dueDate', label: t('maintenance.col_due_date'), width: '17%', align: 'center',
        render: (inv) => (
          <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
            {formatDateOnly(inv.dueDate)}
          </span>
        ),
      },
      {
        key: 'status', label: t('common.status'), width: '11%', align: 'center',
        render: (inv) => <InvoiceStatusBadge status={inv.status} />,
      },
      {
        key: 'actions', label: t('common.actions'), width: '13%', align: 'center',
        render: (inv) => inv.status === 'Paid' ? (
          <button
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            onClick={() => handleDownload(inv.id)}
            style={{ borderRadius: '6px', fontSize: '0.78rem' }}
            title={t('maintenance.download_receipt')}
          >
            <i className="bi bi-download text-dark" />
          </button>
        ) : (
          <span className="text-muted" style={{ fontSize: '0.78rem' }}>—</span>
        ),
      },
    ],
    [t, formatMonth, handleDownload]
  );

  return (
    <div className="d-flex flex-column gap-4">
      <button
        type="button"
        onClick={onBack}
        className="back-btn"
      >
        <ArrowLeft size={16} strokeWidth={2} /> {t('tenantRequests.back_to_tenants')}
      </button>

      {/* ── Current Active Tenant Card (same card layout as tenant history) ── */}
      <div className="section-card">
        <div className="section-card__header d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
          <h6 className="section-card__title d-flex align-items-center gap-2 mb-0" style={{ fontSize: '0.95rem', color: '#111827' }}>
            <UserCheck size={18} className="text-success" />
            {isCurrent ? t('tenantRequests.current_active_tenant') : t('tenantRequests.past_tenant_details')}
          </h6>
          <span className={`badge-pill badge-pill--${isCurrent ? 'active' : 'inactive'}`}>
            {isCurrent ? t('tenantRequests.active_occupant') : t('tenantRequests.past_tenant')}
          </span>
        </div>

        <div className="p-4">
          <div className="d-flex flex-column gap-4">
            {/* Header Card copied directly from Resident Detail */}
            <div className="detail-header">
              <div className="detail-header__left min-w-0">
                <div
                  className="rounded-circle fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 56, height: 56, fontSize: '1rem', background: bg, color }}
                >
                  {getInitials(tenant.user.name)}
                </div>
                <div className="min-w-0 flex-grow-1">
                  <div className="detail-header__name-row">
                    <h4 className="detail-header__name text-truncate">{tenant.user.name}</h4>
                    <span className={`badge-pill badge-pill--${isCurrent ? 'active' : 'inactive'}`}>
                      {isCurrent ? t('common.active') : t('common.inactive')}
                    </span>
                    <span className="badge-pill badge-pill--tenant">{t('roles.tenant')}</span>
                  </div>
                  <div className="detail-header__meta">
                    <span><Calendar size={13} strokeWidth={1.75} /> {t('tenantRequests.moved_in_date', { date: formatDateOnly(tenant.moveInDate) || '—' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Cards Grid copied directly from Resident Detail */}
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
        </div>
      </div>

      {/* ── 4 Tabs below the Current Active Tenant Card ── */}
      <div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className="btn btn-sm fw-semibold d-inline-flex align-items-center gap-2 px-3 py-2"
                style={{
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  backgroundColor: active ? '#1a1f36' : '#fff',
                  color: active ? '#fff' : '#4b5563',
                  border: `1px solid ${active ? '#1a1f36' : '#e5e7eb'}`,
                }}
              >
                <Icon size={16} /> {label}
              </button>
            );
          })}
        </div>

        {/* Tab panels — all mounted so initial loads happen together and switching tabs is instant */}
        <div className={activeTab === 'family' ? 'd-block' : 'd-none'}>
          <FamilyMembersSection residentId={tenant.id} readOnly />
        </div>

        <div className={activeTab === 'vehicles' ? 'd-block' : 'd-none'}>
          <VehiclesSection residentId={tenant.id} readOnly />
        </div>

        <div className={activeTab === 'maintenance' ? 'd-block' : 'd-none'}>
          <SectionCard icon={Receipt} title={t('tenantRequests.tab_maintenance')}>
            {invLoading ? (
              <div className="d-flex flex-column gap-3 py-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton rounded-3" style={{ height: '52px' }} />
                ))}
              </div>
            ) : invoiceItems.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '64px', height: '64px', backgroundColor: '#f3f4f6' }}
                >
                  <Receipt size={28} style={{ color: '#9ca3af' }} />
                </div>
                <p className="fw-semibold mb-1" style={{ fontSize: '0.95rem', color: '#4b5563' }}>{t('tenantRequests.no_invoices_found')}</p>
                <p className="text-secondary small mb-0" style={{ fontSize: '0.8rem' }}>{t('tenantRequests.no_maintenance_records')}</p>
              </div>
            ) : (
              <AppTable
                columns={invoiceColumns}
                data={invoiceItems}
                loading={invLoading}
                rowKey={(inv) => inv.id}
                emptyTitle={t('tenantRequests.no_invoices_found')}
                emptySubtitle={t('tenantRequests.no_maintenance_records')}
                skeletonRows={4}
              />
            )}
          </SectionCard>
        </div>

        <div className={activeTab === 'complaints' ? 'd-block' : 'd-none'}>
          <SectionCard icon={ClipboardList} title={t('tenantRequests.tab_complaints')}>
            {cLoading ? (
              <div className="d-flex flex-column gap-3 py-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton rounded-3" style={{ height: '76px' }} />
                ))}
              </div>
            ) : complaintItems.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '64px', height: '64px', backgroundColor: '#f3f4f6' }}
                >
                  <ClipboardList size={28} style={{ color: '#9ca3af' }} />
                </div>
                <p className="fw-semibold mb-1" style={{ fontSize: '0.95rem', color: '#4b5563' }}>{t('tenantRequests.no_complaints_found')}</p>
                <p className="text-secondary small mb-0" style={{ fontSize: '0.8rem' }}>{t('tenantRequests.no_complaints_for_tenant')}</p>
              </div>
            ) : (
              <ComplaintList
                complaints={complaintItems}
                loading={cLoading}
                isAdmin={false}
                disableChat
                hideChatColumn
                bare
              />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default TenantOverview;
