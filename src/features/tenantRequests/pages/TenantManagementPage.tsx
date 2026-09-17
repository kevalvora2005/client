import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import TenantRequestSection from '../components/TenantRequestSection';
import TenantHistorySection from '../components/TenantHistorySection';
import useOwnerTenantRequest from '../hooks/useOwnerTenantRequest';

const TenantManagementPage = () => {
  const { t } = useTranslation();
  const { status, loading, actionLoading, notOwner, submitRequest } = useOwnerTenantRequest();
  const [showForm, setShowForm] = useState(false);

  const canRequestTenant =
    !notOwner && !loading && !!status && !status.pendingRequest && !status.activeTenant;

  return (
    <div className="container-fluid p-3 p-md-4">

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <h4 className="fw-bold mb-2 fs-4 fs-sm-3" style={{ color: '#1a1f36' }}>
            {t('tenantRequests.mgmt_title')}
          </h4>
          <p className="text-muted mb-0 small">
            {t('tenantRequests.mgmt_subtitle')}
          </p>
        </div>

        {canRequestTenant && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-dark fw-medium d-inline-flex align-items-center gap-2 px-3 py-2 small shadow-sm"
              onClick={() => setShowForm(true)}
              style={{ fontSize: '0.875rem', borderRadius: '8px', backgroundColor: '#1a1f36', borderColor: '#1a1f36' }}
            >
              <UserPlus size={16} strokeWidth={2} />
              {t('tenantRequests.request_tenant_btn')}
            </button>
          </div>
        )}
      </div>

      <TenantRequestSection
        status={status}
        loading={loading}
        actionLoading={actionLoading}
        notOwner={notOwner}
        showForm={showForm}
        setShowForm={setShowForm}
        submitRequest={submitRequest}
      />

      <TenantHistorySection />

    </div>
  );
};

export default TenantManagementPage;
