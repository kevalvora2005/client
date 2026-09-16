import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DatePicker from '../../../components/DatePicker/DatePicker';
import type { CreateBlackoutPayload } from '../types/amenity.types';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const today = () => new Date().toISOString().slice(0, 10);

const getInitialTimes = () => {
  const now = new Date();
  const nextHour = (now.getHours() + 1) % 24;
  const afterNextHour = (nextHour + 1) % 24;
  const startStr = `${String(nextHour).padStart(2, '0')}:00`;
  const endStr = `${String(afterNextHour === 0 ? 23 : afterNextHour).padStart(2, '0')}:${afterNextHour === 0 ? '59' : '00'}`;
  return { startStr, endStr };
};

const createSchema = (t: TFunction) =>
  Yup.object({
    date: Yup.string()
      .matches(DATE_RE, t('validation.date_req'))
      .required(t('validation.date_req'))
      .test('not-in-past', t('validation.date_not_past'), (value) => {
        if (!value) return true;
        return value >= today();
      }),
    startTime: Yup.string()
      .matches(TIME_RE, t('validation.hhmm_req'))
      .required(t('validation.start_time_req'))
      .test('future-time-if-today', t('validation.start_time_future'), function (value) {
        const { date } = this.parent;
        if (!value || !date) return true;
        if (date === today()) {
          const now = new Date();
          const currentH = String(now.getHours()).padStart(2, '0');
          const currentM = String(now.getMinutes()).padStart(2, '0');
          const currentTimeStr = `${currentH}:${currentM}`;
          return value > currentTimeStr;
        }
        return true;
      }),
    endTime: Yup.string()
      .matches(TIME_RE, t('validation.hhmm_req'))
      .required(t('validation.end_time_req'))
      .test('after-start', t('validation.end_time_after_start'), function (value) {
        const { startTime } = this.parent;
        if (!value || !startTime) return true;
        return value > startTime;
      }),
    reason: Yup.string()
      .trim()
      .min(2, t('validation.reason_min2'))
      .max(500, t('validation.reason_max500'))
      .required(t('validation.reason_req')),
  });

interface BlackoutModalProps {
  loading: boolean;
  onSubmit: (payload: CreateBlackoutPayload) => Promise<boolean>;
  onCancel: () => void;
}

const BlackoutModal = ({ loading, onSubmit, onCancel }: BlackoutModalProps) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createSchema(t), [t]);
  const { startStr, endStr } = getInitialTimes();

  const formik = useFormik({
    initialValues: {
      date: today(),
      startTime: startStr,
      endTime: endStr,
      reason: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      await onSubmit({
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        reason: values.reason.trim(),
      });
    },
  });

  const fieldClass = (field: string) =>
    `form-control shadow-none ${formik.touched[field as keyof typeof formik.touched] && formik.errors[field as keyof typeof formik.errors] ? 'is-invalid' : 'border-light-subtle'}`;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)', zIndex: 1050 }}>
      <div className="modal-dialog modal-md modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 rounded-3 shadow-lg bg-white" style={{ overflow: 'visible' }}>
          <div className="modal-header border-bottom border-light-subtle px-3 px-sm-4 pt-4 pb-3 align-items-start position-relative">
            <div>
              <h5 className="modal-title fw-bold fs-6" style={{ color: '#1a1f36' }}>{t('amenities.add_blackout')}</h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>{t('amenities.blackout_modal_desc')}</p>
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

          <div className="modal-body p-3 p-sm-4" style={{ overflow: 'visible' }}>
            <form onSubmit={formik.handleSubmit}>
              <div className="row g-3">
                {/* Full-width Date Picker */}
                <div className="col-12">
                  <DatePicker
                    label={t('amenities.blackout_date')}
                    name="date"
                    required
                    align="left"
                    direction="down"
                    value={formik.values.date}
                    minDate={today()}
                    onChange={(e) => {
                      const val = typeof e === 'string' ? e : e?.target?.value;
                      formik.setFieldValue('date', val);
                    }}
                    onBlur={() => formik.setFieldTouched('date', true)}
                    error={formik.errors.date}
                    touched={formik.touched.date}
                    style={{ height: '42px' }}
                  />
                </div>

                {/* Start & End Times side-by-side */}
                <div className="col-6">
                  <label className="form-label fw-medium text-secondary small mb-1">
                    {t('amenities.start_time')} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    className={fieldClass('startTime')}
                    value={formik.values.startTime}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    style={{ fontSize: '0.875rem', height: '42px' }}
                  />
                  {formik.touched.startTime && formik.errors.startTime && (
                    <div className="invalid-feedback">{formik.errors.startTime}</div>
                  )}
                </div>

                <div className="col-6">
                  <label className="form-label fw-medium text-secondary small mb-1">
                    {t('amenities.end_time')} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    className={fieldClass('endTime')}
                    value={formik.values.endTime}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    style={{ fontSize: '0.875rem', height: '42px' }}
                  />
                  {formik.touched.endTime && formik.errors.endTime && (
                    <div className="invalid-feedback">{formik.errors.endTime}</div>
                  )}
                </div>

                {/* Reason Field */}
                <div className="col-12">
                  <label className="form-label fw-medium text-secondary small mb-1">
                    {t('amenities.reason')} <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="reason"
                    className={fieldClass('reason')}
                    value={formik.values.reason}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t('amenities.blackout_reason_placeholder')}
                    style={{ fontSize: '0.875rem', height: '90px', resize: 'none' }}
                  />
                  {formik.touched.reason && formik.errors.reason && (
                    <div className="invalid-feedback">{formik.errors.reason}</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="col-12 pt-2">
                  <div className="d-grid d-sm-flex gap-2 justify-content-sm-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-2 px-3 small"
                      onClick={onCancel}
                      disabled={loading}
                      style={{ height: '38px', fontSize: '0.875rem' }}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-dark fw-medium px-3 d-inline-flex align-items-center justify-content-center"
                      disabled={loading}
                      style={{ height: '38px', fontSize: '0.875rem', borderRadius: '8px', opacity: loading ? 0.55 : 1 }}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <>
                          <i className="bi bi-plus-lg me-1" /> {t('amenities.add_blackout')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlackoutModal;
