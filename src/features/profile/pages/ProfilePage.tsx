import { useTranslation } from 'react-i18next';
import useAuth from '../../../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import PersonalInfoForm from '../components/PersonalInfoForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { getAvatarColor, getInitials } from '../../residents/components/residentTableHelpers';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { updateProfile, updateLoading, changePassword, passwordLoading } = useProfile();

  if (!user) return null;

  const { bg, color } = getAvatarColor(user.name);

  return (
    // .pf-page: padding: 28px 32px (16px/p-3 on mobile), gap: 20px (gap-3)
    <div className="container-fluid p-3 p-md-4 d-flex flex-column gap-3 max-vw-100">

      {/* ── Hero (.pf-hero) ── */}
      {/* Uses border, white bg, rounded-3 (12px), p-4 (24px), flex-wrap, and stack updates for mobile */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center bg-white border border-light-subtle rounded-3 p-3 p-sm-4 gap-4">

        {/* Avatar (.pf-avatar) */}
        {/* Bootstrap 5 doesn't dynamically style random hex colors from props via classes, so we pass only your unique user avatar colors here */}
        <div
          className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
          style={{ background: bg, color: color, width: '72px', height: '72px', fontSize: '1.4rem' }}
        >
          {getInitials(user.name)}
        </div>

        {/* Info */}
        <div>
          {/* .pf-hero__name: font-size: 1.15rem (fs-5), color: #111827 (text-dark) */}
          <h4 className="m-0 fw-bold fs-5 text-dark mb-1">
            {user.name}
          </h4>

          {/* .pf-hero__meta: gap: 16px (gap-3), color: #6b7280 (text-secondary) */}
          <div className="d-flex flex-wrap align-items-center gap-3 mb-2 text-secondary small">
            <span className="d-inline-flex align-items-center gap-1">
              <i className="bi bi-envelope" /> {user.email}
            </span>
            <span className="d-inline-flex align-items-center gap-1">
              <i className="bi bi-telephone" /> {user.phone}
            </span>
          </div>

          {/* .pf-hero__badges */}
          <div className="d-flex gap-2">
            {/* Role Badge */}
            <span className="badge rounded-pill text-capitalize bg-primary-subtle text-primary px-2.5 py-1.5 fw-medium">
              {t(`roles.${user.role?.toLowerCase()}`)}
            </span>
            {/* Status Badge */}
            <span className={`badge rounded-pill text-capitalize px-2.5 py-1.5 fw-medium ${user.isActive ? 'bg-success-subtle text-success' : 'bg-light text-secondary border'
              }`}>
              {user.isActive ? t('common.active') : t('common.inactive')}
            </span>
          </div>
        </div>
      </div>

      {/* ── Grid Side-by-Side (.pf-grid) ── */}
      {/* Matches the 16px gap via g-3, stacks on mobile, goes split screen at col-lg-6 */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <PersonalInfoForm
            user={user}
            loading={updateLoading}
            onSubmit={updateProfile}
          />
        </div>
        <div className="col-12 col-lg-6">
          <ChangePasswordForm
            loading={passwordLoading}
            onSubmit={changePassword}
          />
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;