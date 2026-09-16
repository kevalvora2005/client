import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { QrCode, Phone, Check, Copy, CheckCircle2 } from 'lucide-react';
import { bookingApi } from '../api/bookingApi';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError, showSuccess } from '../../../utils/toast';
import { formatCurrency } from '../../../utils/formatCurrency';

interface BookingPaymentModalProps {
  bookingId: number;
  amenityName: string;
  amount: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const createValidationSchema = (t: TFunction) =>
  Yup.object({
    utrNumber: Yup.string()
      .trim()
      .length(12, t('validation.utr_12_digits'))
      .matches(/^\d{12}$/, t('validation.utr_12_digits'))
      .required(t('validation.utr_req')),
  });

export const BookingPaymentModal = ({
  bookingId,
  amenityName,
  amount,
  onClose,
  onPaymentSuccess,
}: BookingPaymentModalProps) => {
  const { t } = useTranslation();
  const validationSchema = useMemo(() => createValidationSchema(t), [t]);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState(false);

  const formik = useFormik({
    initialValues: {
      utrNumber: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        await bookingApi.settle(bookingId, `UPI - ${values.utrNumber}`);
        showSuccess(t('amenities.booking_fee_paid'));
        onPaymentSuccess();
        onClose();
      } catch (err: unknown) {
        showError(getErrorMessage(err, t('amenities.upi_payment_failed')));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('society@icici');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const upiUrl = `upi://pay?pa=society@icici&pn=Amenity%20Booking&am=${amount.toFixed(2)}&cu=INR`;
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
          <div className="modal-header border-bottom border-light-subtle px-4 py-3 position-relative align-items-center justify-content-between text-start">
            <div className="d-flex align-items-center gap-3 text-start">
              <div
                className="p-2 rounded-3 d-flex align-items-center justify-content-center text-dark"
                style={{ backgroundColor: '#f3f4f6', color: '#1a1f36', width: 40, height: 40, flexShrink: 0 }}
              >
                <QrCode size={20} className="text-dark" />
              </div>
              <div className="text-start">
                <h5 className="modal-title fw-bold fs-6 mb-0 text-dark text-start">{t('amenities.pay_amenity_fee')}</h5>
                <p className="text-muted mb-0 small text-start" style={{ fontSize: '0.78rem' }}>
                  {t('amenities.booking_ref', { name: amenityName, id: bookingId })}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
              style={{ top: 20, right: 20, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem', borderRadius: '6px' }}
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
                {t('amenities.booking_fee_payable')}
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
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 p-2 text-muted">
                    <QrCode size={64} className="text-secondary opacity-50 mb-1" />
                    <span style={{ fontSize: '0.75rem' }}>{t('amenities.scan_with_upi_app')}</span>
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
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Mobile UPI Direct App Link */}
            <div className="mb-2">
              <a
                href={upiUrl}
                className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                style={{ borderRadius: '8px', fontSize: '0.88rem', backgroundColor: '#1a1f36', borderColor: '#1a1f36' }}
              >
                <Phone size={16} /> {t('maintenance.open_upi_app')}
              </a>
            </div>

            {/* Divider */}
            <div className="d-flex align-items-center my-3">
              <div className="flex-grow-1 border-top" style={{ borderColor: '#e2e8f0' }} />
              <span className="px-2 text-uppercase text-secondary fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                {t('amenities.enter_utr_to_verify')}
              </span>
              <div className="flex-grow-1 border-top" style={{ borderColor: '#e2e8f0' }} />
            </div>

            {/* Manual UTR Input Form */}
            <form onSubmit={formik.handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary small mb-1">
                  {t('amenities.utr_field_label')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="utrNumber"
                  className={`form-control shadow-none rounded-2 text-dark ${formik.touched.utrNumber && formik.errors.utrNumber ? 'is-invalid' : ''}`}
                  placeholder="e.g. 123456789012"
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
                      <span className="spinner-border spinner-border-sm me-1" />
                      <span>{t('maintenance.verifying')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="me-1" />
                      <span>{t('amenities.submit_payment')}</span>
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

export default BookingPaymentModal;
