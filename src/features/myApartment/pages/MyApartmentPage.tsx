import { useTranslation } from 'react-i18next';
import useAuth from '../../../hooks/useAuth';
import FamilyMembersSection from './FamilyMembersSection';
import VehiclesSection from './VehiclesSection';

const MyApartmentPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const residentId = user?.residentId ?? 0;

  if (!user || !user.residentId) {
    return (
      <div className="container-fluid p-3 p-md-4">
        <div className="error-state">
          <i className="bi bi-exclamation-circle error-state__icon" />
          <p className="error-state__title">{t('myApartment.resident_not_found_title')}</p>
          <p className="error-state__sub">{t('myApartment.resident_not_found_desc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4">

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <h4 className="fw-bold mb-2 fs-4 fs-sm-3" style={{ color: '#1a1f36' }}>
            {t('myApartment.page_title')}
          </h4>
          <p className="text-muted mb-0 small">
            {t('myApartment.page_desc')}
          </p>
        </div>
      </div>

      {/* ── Family Members ── */}
      <FamilyMembersSection residentId={residentId} />

      {/* ── Vehicles ── */}
      <VehiclesSection residentId={residentId} />

    </div>
  );
};

export default MyApartmentPage;
