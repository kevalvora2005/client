import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { maintenanceApi } from '../api/maintenanceApi';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError, showSuccess } from '../../../utils/toast';
import { formatCurrency } from '../../../utils/formatCurrency';

interface UpiPaymentModalProps {
  invoiceId: number;
  amount: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const UpiPaymentModal = ({
  invoiceId,
  amount,
  onClose,
  onPaymentSuccess,
}: UpiPaymentModalProps) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState(false);

  const validationSchema = useMemo(() => Yup.object({
    utrNumber: Yup.string()
      .trim()
      .length(12, t('validation.utr_12_digits'))
      .matches(/^\d{12}$/, t('validation.utr_12_digits'))
      .required(t('validation.utr_req')),
  }), [t]);

  const formik = useFormik({
    initialValues: {
      utrNumber: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        await maintenanceApi.markInvoiceSettled(invoiceId, `UPI - ${values.utrNumber}`);
        showSuccess(t('maintenance.upi_success'));
        onPaymentSuccess();
        onClose();
      } catch (err: unknown) {
        showError(getErrorMessage(err, t('maintenance.upi_failed')));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleSubmit = async (e?: React.FormEvent, customUtr?: string) => {
    if (e) e.preventDefault();

    if (customUtr) {
      await formik.setFieldValue('utrNumber', customUtr);
      formik.setFieldTouched('utrNumber', true);
      const errors = await validationSchema.validateAt('utrNumber', { utrNumber: customUtr }).catch(() => null);
      if (!errors) {
        setSubmitting(true);
        try {
          await maintenanceApi.markInvoiceSettled(invoiceId, `UPI - ${customUtr}`);
          showSuccess(t('maintenance.upi_success'));
          onPaymentSuccess();
          onClose();
        } catch (err: unknown) {
          showError(getErrorMessage(err, t('maintenance.upi_failed')));
        } finally {
          setSubmitting(false);
        }
        return;
      }
    }

    formik.handleSubmit();
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('society@icici');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const upiUrl = `upi://pay?pa=society@icici&pn=Society%20Management&am=${amount.toFixed(2)}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div
      className="modal d-block bg-dark bg-opacity-50"
      style={{ backdropFilter: 'blur(4px)', zIndex: 1050, overflowY: 'auto' }}
      onClick={onClose}
      tabIndex={-1}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: '440px', width: '92%', margin: '1.75rem auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 rounded-3 shadow-lg bg-white overflow-hidden">

          {/* Modal Header */}
          <div className="modal-header border-bottom border-light-subtle px-4 py-4 position-relative align-items-center justify-content-between text-start">
            <div className="d-flex align-items-center gap-3 text-start">
              <div
                className="p-2 rounded-3 d-flex align-items-center justify-content-center text-dark"
                style={{ backgroundColor: '#f3f4f6', color: '#1a1f36', width: 42, height: 42, flexShrink: 0 }}
              >
                <i className="bi bi-qr-code-scan fs-5 text-dark" />
              </div>
              <div className="text-start">
                <h5 className="modal-title fw-bold fs-6 mb-0 text-dark text-start">{t('maintenance.upi_payment')}</h5>
                <p className="text-muted mb-0 small text-start" style={{ fontSize: '0.78rem' }}>
                  {t('maintenance.upi_payment_desc')}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
              style={{ top: 22, right: 22, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem', borderRadius: '6px' }}
              onClick={onClose}
              disabled={submitting}
              aria-label={t('common.close')}
            >
              <i className="bi bi-x" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            
            {/* Amount Banner */}
            <div className="rounded-3 p-3 text-center border mb-3" style={{ backgroundColor: '#f8fafc' }}>
              <span className="text-secondary small fw-medium d-block mb-1" style={{ fontSize: '0.78rem', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                {t('maintenance.amount_payable')}
              </span>
              <span className="fs-3 fw-bold text-dark">{formatCurrency(amount)}</span>
            </div>

            {/* QR Code Block */}
            <div className="text-center p-3 rounded-3 border mb-3 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: '#f8fafc' }}>
              <div className="bg-white p-2 rounded-3 shadow-sm border mb-2 d-inline-block position-relative" style={{ width: 176, height: 176 }}>
                {!qrError ? (
                  <img
                    src={qrCodeUrl}
                    alt="UPI Payment QR Code"
                    width={160}
                    height={160}
                    className="d-block mx-auto"
                    style={{ objectFit: 'contain' }}
                    onError={() => setQrError(true)}
                  />
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 p-2">
                    <svg width="140" height="140" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Corner Position Boxes */}
                      <rect x="5" y="5" width="28" height="28" rx="4" fill="#1a1f36" />
                      <rect x="9" y="9" width="20" height="20" rx="2" fill="#ffffff" />
                      <rect x="13" y="13" width="12" height="12" rx="1" fill="#1a1f36" />

                      <rect x="67" y="5" width="28" height="28" rx="4" fill="#1a1f36" />
                      <rect x="71" y="9" width="20" height="20" rx="2" fill="#ffffff" />
                      <rect x="75" y="13" width="12" height="12" rx="1" fill="#1a1f36" />

                      <rect x="5" y="67" width="28" height="28" rx="4" fill="#1a1f36" />
                      <rect x="9" y="71" width="20" height="20" rx="2" fill="#ffffff" />
                      <rect x="13" y="75" width="12" height="12" rx="1" fill="#1a1f36" />

                      {/* Dynamic Dot Grid Pattern */}
                      <rect x="40" y="8" width="6" height="6" fill="#1a1f36" />
                      <rect x="50" y="8" width="6" height="6" fill="#1a1f36" />
                      <rect x="40" y="18" width="6" height="6" fill="#1a1f36" />
                      <rect x="54" y="18" width="6" height="6" fill="#1a1f36" />
                      <rect x="40" y="28" width="6" height="6" fill="#1a1f36" />
                      <rect x="48" y="28" width="6" height="6" fill="#1a1f36" />

                      <rect x="8" y="40" width="6" height="6" fill="#1a1f36" />
                      <rect x="18" y="40" width="6" height="6" fill="#1a1f36" />
                      <rect x="28" y="40" width="6" height="6" fill="#1a1f36" />
                      <rect x="40" y="40" width="18" height="18" rx="2" fill="#0d6efd" />
                      <rect x="64" y="40" width="6" height="6" fill="#1a1f36" />
                      <rect x="74" y="40" width="6" height="6" fill="#1a1f36" />
                      <rect x="84" y="40" width="6" height="6" fill="#1a1f36" />

                      <rect x="8" y="50" width="6" height="6" fill="#1a1f36" />
                      <rect x="22" y="50" width="6" height="6" fill="#1a1f36" />
                      <rect x="64" y="50" width="6" height="6" fill="#1a1f36" />
                      <rect x="80" y="50" width="6" height="6" fill="#1a1f36" />

                      <rect x="40" y="64" width="6" height="6" fill="#1a1f36" />
                      <rect x="52" y="64" width="6" height="6" fill="#1a1f36" />
                      <rect x="64" y="64" width="6" height="6" fill="#1a1f36" />
                      <rect x="78" y="64" width="6" height="6" fill="#1a1f36" />
                      <rect x="86" y="64" width="6" height="6" fill="#1a1f36" />

                      <rect x="40" y="74" width="6" height="6" fill="#1a1f36" />
                      <rect x="48" y="74" width="6" height="6" fill="#1a1f36" />
                      <rect x="68" y="74" width="6" height="6" fill="#1a1f36" />
                      <rect x="82" y="74" width="6" height="6" fill="#1a1f36" />

                      <rect x="40" y="84" width="6" height="6" fill="#1a1f36" />
                      <rect x="54" y="84" width="6" height="6" fill="#1a1f36" />
                      <rect x="64" y="84" width="6" height="6" fill="#1a1f36" />
                      <rect x="74" y="84" width="6" height="6" fill="#1a1f36" />
                      <rect x="84" y="84" width="6" height="6" fill="#1a1f36" />
                    </svg>
                  </div>
                )}
              </div>
              
              <small className="text-secondary fw-semibold d-block mb-2" style={{ fontSize: '0.8rem' }}>
                {t('maintenance.scan_using_apps')}
              </small>

              <div className="d-inline-flex align-items-center gap-2 bg-white px-3 py-1.5 rounded-pill border">
                <span className="text-muted small">{t('maintenance.upi_id_label')}</span>
                <code className="text-dark fw-bold" style={{ fontSize: '0.85rem' }}>society@icici</code>
                <button
                  type="button"
                  className="btn btn-link p-0 text-primary border-0 ms-1 d-inline-flex align-items-center"
                  onClick={handleCopyUpi}
                  title={t('maintenance.copy_upi_id')}
                  style={{ textDecoration: 'none' }}
                >
                  <i className={`bi ${copied ? 'bi-check-lg text-success' : 'bi-clipboard'}`} />
                </button>
              </div>
            </div>

            {/* Mobile UPI Direct App Link */}
            <div className="mb-2">
              <a
                href={upiUrl}
                className="btn btn-primary w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                style={{ borderRadius: '8px', fontSize: '0.9rem' }}
              >
                <i className="bi bi-phone-vibrate fs-6" />
                {t('maintenance.open_upi_app')}
              </a>
            </div>


            {/* Divider */}
            <div className="d-flex align-items-center my-3">
              <div className="flex-grow-1 border-top" style={{ borderColor: '#e2e8f0' }} />
              <span
                className="px-2 text-uppercase text-secondary fw-semibold"
                style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}
              >
                {t('maintenance.or_enter_utr_manually')}
              </span>
              <div className="flex-grow-1 border-top" style={{ borderColor: '#e2e8f0' }} />
            </div>

            {/* Manual UTR Input Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary small mb-1">
                  {t('maintenance.utr_field_label')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="utrNumber"
                  className={`form-control shadow-none rounded-2 text-dark ${formik.touched.utrNumber && formik.errors.utrNumber ? 'is-invalid' : ''}`}
                  placeholder={t('maintenance.utr_placeholder')}
                  maxLength={12}
                  value={formik.values.utrNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    formik.setFieldValue('utrNumber', val);
                  }}
                  onBlur={formik.handleBlur}
                  disabled={submitting}
                  style={{
                    fontSize: '0.875rem',
                    height: '42px',
                    borderColor: formik.touched.utrNumber && formik.errors.utrNumber ? '#dc3545' : '#e5e7eb',
                  }}
                />
                {formik.touched.utrNumber && formik.errors.utrNumber && (
                  <div className="invalid-feedback d-block text-danger mt-1" style={{ fontSize: '0.8rem' }}>
                    {formik.errors.utrNumber}
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 justify-content-end mt-4 pt-1">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-2 px-3 small"
                  onClick={onClose}
                  disabled={submitting}
                  style={{ height: '38px', fontSize: '0.875rem' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-dark fw-medium px-3 d-inline-flex align-items-center"
                  disabled={submitting || formik.values.utrNumber.length !== 12}
                  style={{ height: '38px', fontSize: '0.875rem', borderRadius: '8px', opacity: submitting ? 0.55 : 1 }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span className="ms-1">{t('maintenance.verifying')}</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1" />
                      <span>{t('maintenance.submit_utr')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>

        </div>
      </div>
    </div>
  );
};
