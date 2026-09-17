import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UserPlus, UserCheck, Mail, Phone, Calendar, Clock } from 'lucide-react';
import { useScrollLock } from '../../../hooks/useScrollLock';
import { StatusBadge } from '../../../components/StatusBadge/StatusBadge';
import DatePicker from '../../../components/DatePicker/DatePicker';
import { formatDateOnly } from '../../../utils/formatDate';
import type { OwnerTenantStatus, SubmitTenantRequestPayload } from '../types/tenantRequest.types';

const TODAY = new Date().toISOString().split('T')[0];

const RequestForm = ({
  loading,
  onSubmit,
  onCancel,
}: {
  loading: boolean;
  onSubmit: (payload: SubmitTenantRequestPayload) => Promise<void>;
  onCancel: () => void;
}) => {
  const { t } = useTranslation();

  const tenantRequestSchema = useMemo(
    () =>
      Yup.object({
        tenantName: Yup.string().trim().required(t('tenantRequests.tenant_name_required')),
        tenantEmail: Yup.string()
          .trim()
          .email(t('tenantRequests.invalid_email'))
          .required(t('tenantRequests.tenant_email_required')),
        tenantPhone: Yup.string()
          .matches(/^\d{10}$/, t('tenantRequests.phone_digits_required'))
          .required(t('tenantRequests.tenant_phone_required')),
        moveInDate: Yup.string()
          .required(t('tenantRequests.move_in_date_required'))
          .test('not-past', t('tenantRequests.move_in_not_past'), (value) =>
            value ? value >= TODAY : false
          ),
      }),
    [t]
  );

  const formik = useFormik({
    initialValues: {
      tenantName: '',
      tenantEmail: '',
      tenantPhone: '',
      moveInDate: '',
    },
    validationSchema: tenantRequestSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit({
          tenantName: values.tenantName.trim(),
          tenantEmail: values.tenantEmail.trim(),
          tenantPhone: values.tenantPhone.trim(),
          moveInDate: values.moveInDate,
        });
      } catch {
        /* error surfaced via toast */
      }
    },
  });

  const fieldClass = (field: keyof typeof formik.values) =>
    `form-control shadow-none rounded-2 text-dark ${formik.touched[field] && formik.errors[field] ? 'is-invalid' : ''}`;

  const fieldBorder = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field] ? '#dc3545' : '#e5e7eb';

  const errorFor = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field] ? (
      <div className="invalid-feedback d-block text-danger mt-1" style={{ fontSize: '0.8rem' }}>
        {formik.errors[field]}
      </div>
    ) : null;

  return (
    <form onSubmit={formik.handleSubmit}>
      <p className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
        {t('tenantRequests.tenant_details')}
      </p>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-medium text-secondary small mb-1">{t('tenantRequests.tenant_full_name')} <span className="text-danger">*</span></label>
          <input
            type="text"
            name="tenantName"
            autoComplete="name"
            className={fieldClass('tenantName')}
            placeholder={t('tenantRequests.enter_full_name')}
            value={formik.values.tenantName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{ fontSize: '0.875rem', borderColor: fieldBorder('tenantName') }}
          />
          {errorFor('tenantName')}
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium text-secondary small mb-1">{t('tenantRequests.tenant_email')} <span className="text-danger">*</span></label>
          <input
            type="email"
            name="tenantEmail"
            autoComplete="email"
            className={fieldClass('tenantEmail')}
            placeholder={t('tenantRequests.enter_email')}
            value={formik.values.tenantEmail}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{ fontSize: '0.875rem', borderColor: fieldBorder('tenantEmail') }}
          />
          {errorFor('tenantEmail')}
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium text-secondary small mb-1">{t('tenantRequests.tenant_phone')} <span className="text-danger">*</span></label>
          <input
            type="text"
            name="tenantPhone"
            autoComplete="tel"
            className={fieldClass('tenantPhone')}
            placeholder={t('tenantRequests.enter_phone')}
            value={formik.values.tenantPhone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{ fontSize: '0.875rem', borderColor: fieldBorder('tenantPhone') }}
          />
          {errorFor('tenantPhone')}
        </div>

        <div className="col-md-6">
          <DatePicker
            label={t('tenantRequests.expected_move_in_date')}
            name="moveInDate"
            required
            direction="auto"
            minDate={TODAY}
            value={formik.values.moveInDate}
            onChange={(e) => {
              const val = typeof e === 'string' ? e : e?.target?.value;
              formik.setFieldValue('moveInDate', val);
            }}
            onBlur={() => formik.setFieldTouched('moveInDate', true)}
            error={formik.errors.moveInDate}
            touched={formik.touched.moveInDate}
            style={{ height: '40px' }}
          />
        </div>
      </div>

      <div className="d-grid d-sm-flex gap-2 justify-content-sm-end mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn btn-outline-secondary rounded-2 d-flex align-items-center justify-content-center"
          style={{ height: '38px', fontSize: '0.875rem' }}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-dark fw-medium d-flex align-items-center justify-content-center gap-2"
          style={{ height: '38px', fontSize: '0.875rem', borderRadius: '8px', backgroundColor: '#1a1f36', borderColor: '#1a1f36', opacity: loading ? 0.55 : 1 }}
        >
          {loading ? <span className="spinner-border spinner-border-sm" /> : <UserPlus size={16} />}
          {t('tenantRequests.submit_request')}
        </button>
      </div>
    </form>
  );
};

interface TenantRequestSectionProps {
  status: OwnerTenantStatus | null;
  loading: boolean;
  actionLoading: boolean;
  notOwner: boolean;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  submitRequest: (payload: SubmitTenantRequestPayload) => Promise<void>;
}

const TenantRequestSection = ({
  status,
  loading,
  actionLoading,
  notOwner,
  showForm,
  setShowForm,
  submitRequest,
}: TenantRequestSectionProps) => {
  const { t } = useTranslation();
  useScrollLock(showForm);

  const handleSubmit = async (payload: SubmitTenantRequestPayload) => {
    await submitRequest(payload);
    setShowForm(false);
  };

  if (notOwner) return null;
  if (loading || !status) {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body text-center py-4">
          <div className="spinner-border text-secondary" role="status" />
        </div>
      </div>
    );
  }

  // ── Pending request ──────────────────────────────────────────────
  if (status.pendingRequest) {
    const r = status.pendingRequest;
    const infoCards = [
      { icon: UserCheck, label: t('tenantRequests.tenant_label'), value: r.tenantName, accent: 'info-card--blue' },
      { icon: Mail, label: t('tenantRequests.email_label'), value: r.tenantEmail, accent: 'info-card--green' },
      { icon: Phone, label: t('tenantRequests.phone_label'), value: r.tenantPhone, accent: 'info-card--purple' },
      { icon: Calendar, label: t('tenantRequests.move_in_label'), value: formatDateOnly(r.moveInDate), accent: 'info-card--amber' },
    ];
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div
            className="d-flex align-items-center gap-2 px-4 py-3 rounded-3 mb-4"
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontSize: '0.9rem',
            }}
          >
            <Clock size={18} className="flex-shrink-0" />
            <span className="fw-medium">{t('tenantRequests.awaiting_committee_review')}</span>
          </div>

          <div className="d-flex align-items-center gap-2 mb-3">
            <StatusBadge
              variant={r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'danger' : 'warning'}
              label={t(`status.${r.status.toLowerCase()}`)}
            />
          </div>

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
        </div>
      </div>
    );
  }

  // ── Active tenant ────────────────────────────────────────────────
  // The current tenant (and the revoke action) is now shown in the
  // "Tenant History" section on this page, so we don't render a separate
  // card here. Returning null also keeps the request form hidden.
  if (status.activeTenant) return null;

  // ── No tenant → request modal form (button lives in page header) ──
  return (
    <>
      {/* ── Request Tenant Modal ── */}
      {showForm && (
        <div className="modal d-block bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-3 shadow-lg bg-white" style={{ overflow: 'visible' }}>
              <div className="modal-header border-bottom border-light-subtle px-3 px-sm-4 pt-4 pb-3 align-items-start position-relative">
                <div>
                  <h5 className="modal-title fw-bold fs-6" style={{ color: '#1a1f36' }}>
                    {t('tenantRequests.request_a_tenant')}
                  </h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                    {t('tenantRequests.request_a_tenant_subtitle')}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
                  style={{ top: 22, right: 22, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem', borderRadius: '6px' }}
                  onClick={() => setShowForm(false)}
                  disabled={actionLoading}
                  aria-label="Close"
                >
                  <i className="bi bi-x" />
                </button>
              </div>
              <div className="modal-body p-3 p-sm-4" style={{ overflow: 'visible' }}>
                <RequestForm loading={actionLoading} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TenantRequestSection;
