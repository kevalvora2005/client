import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const createSchema = (t: TFunction) =>
  Yup.object({
    paymentRef: Yup.string()
      .trim()
      .matches(/^UPI\d{12}$/, t('validation.payment_ref_upi_format'))
      .required(t('validation.payment_ref_req')),
  });

interface SettleModalProps {
  loading: boolean;
  onSubmit: (paymentRef: string) => Promise<boolean>;
  onCancel: () => void;
}

const SettleModal = ({ loading, onSubmit, onCancel }: SettleModalProps) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createSchema(t), [t]);

  const formik = useFormik({
    initialValues: { paymentRef: '' },
    validationSchema: schema,
    onSubmit: async (values) => {
      await onSubmit(values.paymentRef.trim());
    },
  });

  return (
    <div className="modal d-block bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 rounded-3 shadow-lg bg-white">
          <div className="modal-header border-bottom border-light-subtle px-3 px-sm-4 pt-4 pb-3 align-items-start position-relative">
            <div>
              <h5 className="modal-title fw-bold fs-6" style={{ color: '#1a1f36' }}>{t('amenities.record_payment')}</h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>{t('amenities.record_payment_desc')}</p>
            </div>
            <button
              type="button"
              className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
              style={{ top: 22, right: 22, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem', borderRadius: '6px' }}
              onClick={onCancel}
              disabled={loading}
              aria-label={t('common.close')}
            >
              <i className="bi bi-x" />
            </button>
          </div>

          <div className="modal-body p-3 p-sm-4">
            <form onSubmit={formik.handleSubmit}>
              <label className="form-label fw-medium text-secondary small mb-1">{t('amenities.upi_reference')} <span className="text-danger">*</span></label>
              <input
                type="text"
                name="paymentRef"
                className={`form-control shadow-none ${formik.touched.paymentRef && formik.errors.paymentRef ? 'is-invalid' : 'border-light-subtle'}`}
                placeholder="UPI123456789012"
                value={formik.values.paymentRef}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                style={{ fontSize: '0.875rem', height: '40px' }}
              />
              {formik.touched.paymentRef && formik.errors.paymentRef && (
                <div className="invalid-feedback">{formik.errors.paymentRef}</div>
              )}
              <div className="d-grid d-sm-flex gap-2 justify-content-sm-end mt-3">
                <button type="button" className="btn btn-outline-secondary rounded-2 px-3 small" onClick={onCancel} disabled={loading} style={{ height: '38px', fontSize: '0.875rem' }}>{t('common.cancel')}</button>
                <button type="submit" className="btn btn-dark fw-medium px-3 d-inline-flex align-items-center justify-content-center" disabled={loading} style={{ height: '38px', fontSize: '0.875rem', borderRadius: '8px', opacity: loading ? 0.55 : 1 }}>
                  {loading ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-cash me-1" /> {t('amenities.record_payment')}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettleModal;
