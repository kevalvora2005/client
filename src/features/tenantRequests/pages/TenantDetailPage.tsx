import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import useTenantHistory from '../hooks/useTenantHistory';
import TenantOverview from '../components/TenantOverview';

const TenantDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const tenantId = Number(id);
  const navigate = useNavigate();
  const { tenants, loading } = useTenantHistory();

  const tenant = tenants.find((t) => t.id === tenantId) ?? null;

  if (loading) {
    return (
      <div className="container-fluid p-3 p-md-4">
        <div className="d-flex flex-column gap-4">
          <div className="skeleton mb-1" style={{ width: '130px', height: '24px', borderRadius: '6px' }} />
          <div className="card bg-white border border-light-subtle rounded-3 p-4 shadow-sm">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="skeleton rounded-circle flex-shrink-0" style={{ width: 56, height: 56 }} />
              <div className="d-flex flex-column gap-2 flex-grow-1">
                <div className="skeleton" style={{ width: '180px', height: '22px', borderRadius: '6px' }} />
                <div className="skeleton" style={{ width: '130px', height: '14px', borderRadius: '6px' }} />
              </div>
            </div>
            <div className="row g-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="col-12 col-sm-6 col-md-3">
                  <div className="skeleton" style={{ height: '70px', borderRadius: '10px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="container-fluid p-3 p-md-4">
        <button
          type="button"
          onClick={() => navigate('/tenant')}
          className="btn btn-sm btn-link text-decoration-none d-inline-flex align-items-center gap-1 px-0 mb-3 fw-semibold"
          style={{ color: '#4b5563' }}
        >
          <ArrowLeft size={16} /> {t('tenantRequests.back_to_tenants')}
        </button>
        <div className="text-center py-5">
          <i className="bi bi-person-x d-block mb-2" style={{ fontSize: '2rem', color: '#d1d5db' }} />
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{t('tenantRequests.tenant_not_found')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4">
      <TenantOverview tenant={tenant} onBack={() => navigate('/tenant')} />
    </div>
  );
};

export default TenantDetailPage;
