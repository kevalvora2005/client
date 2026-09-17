import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../../../hooks/useAuth';
import { getMeApi } from '../../auth/api/authApi';
import { formatDateOnly } from '../../../utils/formatDate';

const POLL_INTERVAL_MS = 4000;

const TenantWelcomePage = () => {
  const { t } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const resident = user?.resident ?? null;
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? '';

  const formatMoveInDate = (value: string | null): string => {
    if (!value) return t('tenantRequests.soon');
    const formatted = formatDateOnly(value);
    return formatted || t('tenantRequests.soon');
  };

  // Redirect anyone who isn't actually a locked tenant away from this page.
  useEffect(() => {
    if (resident && (resident.isOwner || resident.isOccupant)) {
      navigate('/my-apartment', { replace: true });
    }
  }, [resident, navigate]);

  // Poll /me so we unlock the moment the cron promotes the tenant to occupant.
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const updatedUser = await getMeApi();
        if (!active) return;
        updateUser(updatedUser as Partial<import('../../auth/types/auth.types').User>);
        // Navigation is handled by the useEffect above that watches `resident`.
      } catch {
        // keep showing the welcome page if the refresh fails
      }
    };
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [updateUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-sm border-0" style={{ maxWidth: 520, width: '100%' }}>
        <div className="card-body p-4 p-md-5 text-center">
          <div
            className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
            style={{ width: 72, height: 72 }}
          >
            <i className="bi bi-house-heart" style={{ fontSize: '2rem' }}></i>
          </div>

          <h2 className="h4 fw-bold mb-1">
            {t('tenantRequests.welcome_title', { name: firstName ? `, ${firstName}` : '' })}
          </h2>
          <p className="text-muted mb-4">
            {t('tenantRequests.request_approved_subtitle')}
          </p>

          <div className="alert alert-primary border-0" role="alert">
            <div className="fw-semibold mb-1">
              {t('tenantRequests.access_features_from')}
            </div>
            <div className="fs-5 fw-bold">{formatMoveInDate(resident?.moveInDate ?? null)}</div>
          </div>

          <p className="text-muted small mb-4">
            {t('tenantRequests.access_explanation')}
          </p>

          <button className="btn btn-outline-secondary" onClick={handleLogout}>
            {t('tenantRequests.logout_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantWelcomePage;
