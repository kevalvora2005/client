import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CheckCircle2, Users } from 'lucide-react';
import DatePicker from '../../../components/DatePicker/DatePicker';
import Select from '../../../components/Select/Select';
import type { CreateBookingPayload } from '../types/amenity.types';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const today = () => new Date().toISOString().slice(0, 10);

const createSchema = (t: TFunction, operatingStart?: string, operatingEnd?: string) =>
  Yup.object({
    bookingDate: Yup.string()
      .matches(DATE_RE, t('validation.date_req'))
      .required(t('validation.date_req'))
      .test('not-in-past', t('validation.date_not_past'), (value) => {
        if (!value) return true;
        return value >= today();
      }),
    startTime: Yup.string()
      .matches(TIME_RE, t('validation.hhmm_req'))
      .required(t('validation.start_time_req'))
      .test('not-past-time-today', t('validation.start_time_future'), function (value) {
        const { bookingDate } = this.parent;
        if (!value || !bookingDate) return true;
        if (bookingDate === today()) {
          const now = new Date();
          const currentH = String(now.getHours()).padStart(2, '0');
          const currentM = String(now.getMinutes()).padStart(2, '0');
          const currentTimeStr = `${currentH}:${currentM}`;
          return value >= currentTimeStr;
        }
        return true;
      })
      .test('within-operating-start', t('validation.start_after_opening', { time: operatingStart || 'opening' }), (value) => {
        if (!value || !operatingStart) return true;
        return value >= operatingStart;
      }),
    endTime: Yup.string()
      .matches(TIME_RE, t('validation.hhmm_req'))
      .required(t('validation.end_time_req'))
      .test('after-start', t('validation.end_time_after_start'), function (value) {
        const { startTime } = this.parent;
        if (!value || !startTime) return true;
        return value > startTime;
      })
      .test('within-operating-end', t('validation.end_before_closing', { time: operatingEnd || 'closing' }), (value) => {
        if (!value || !operatingEnd) return true;
        return value <= operatingEnd;
      }),
    memberCount: Yup.number()
      .integer(t('validation.persons_integer'))
      .min(1, t('validation.persons_min1'))
      .max(5, t('validation.persons_max5'))
      .required(t('validation.persons_req')),
    purpose: Yup.string().nullable(),
  });

interface BookingFormModalProps {
  amenityId: number;
  amenityName?: string;
  isShared?: boolean;
  isAdmin?: boolean;
  initialDate?: string;
  initialStart?: string;
  initialEnd?: string;
  operatingStart?: string;
  operatingEnd?: string;
  loading: boolean;
  onSubmit: (payload: CreateBookingPayload) => Promise<boolean>;
  onCancel: () => void;
}

const BookingFormModal = ({
  amenityId,
  amenityName,
  isShared = false,
  initialDate,
  initialStart,
  initialEnd,
  operatingStart,
  operatingEnd,
  loading,
  onSubmit,
  onCancel,
}: BookingFormModalProps) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createSchema(t, operatingStart, operatingEnd), [t, operatingStart, operatingEnd]);

  const personOptions = useMemo(() => [
    { value: '1', label: t('amenities.person_1') },
    { value: '2', label: t('amenities.persons_count', { count: 2 }) },
    { value: '3', label: t('amenities.persons_count', { count: 3 }) },
    { value: '4', label: t('amenities.persons_count', { count: 4 }) },
    { value: '5', label: t('amenities.persons_count', { count: 5 }) },
  ], [t]);

  const formik = useFormik({
    initialValues: {
      bookingDate: initialDate ?? today(),
      startTime: initialStart ?? operatingStart ?? '08:00',
      endTime: initialEnd ?? operatingEnd ?? '09:00',
      memberCount: 1,
      purpose: isShared ? `${amenityName || 'Amenity'} Session` : '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const payload: CreateBookingPayload = {
        amenityId,
        bookingDate: values.bookingDate,
        startTime: values.startTime,
        endTime: values.endTime,
        memberCount: values.memberCount,
        purpose: values.purpose?.trim() || null,
      };
      await onSubmit(payload);
    },
  });

  const fieldClass = (field: string) =>
    `form-control shadow-none ${
      formik.touched[field as keyof typeof formik.touched] &&
      formik.errors[field as keyof typeof formik.errors]
        ? 'is-invalid'
        : 'border-light-subtle'
    }`;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)', zIndex: 1050 }}>
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 rounded-3 shadow-lg bg-white" style={{ overflow: 'visible' }}>
          <div className="modal-header border-bottom border-light-subtle px-3 px-sm-4 pt-4 pb-3 align-items-start position-relative">
            <div>
              <h5 className="modal-title fw-bold fs-6" style={{ color: '#1a1f36' }}>
                {isShared
                  ? t('amenities.reserve_spot_title', { name: amenityName || t('amenities.shared_facility') })
                  : t('amenities.book_amenity_title', { name: amenityName || '' })}
              </h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                {t('amenities.booking_modal_desc')}
                {operatingStart && operatingEnd && (
                  <span className="fw-medium text-dark ms-1">
                    {t('amenities.operating_hours_parenthesis', { start: operatingStart, end: operatingEnd })}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
              style={{
                top: 22,
                right: 22,
                width: 28,
                height: 28,
                border: '1px solid #e9ecef',
                background: '#fff',
                fontSize: '1.1rem',
                borderRadius: '6px',
              }}
              onClick={onCancel}
              disabled={loading}
              aria-label={t('common.close')}
            >
              <i className="bi bi-x" />
            </button>
          </div>

          <div className="modal-body p-3 p-sm-4" style={{ overflow: 'visible' }}>
            {/* Shared Facility Info Alert */}
            {isShared && (
              <div className="p-3 rounded-3 mb-3 d-flex align-items-center gap-3 bg-success-subtle border border-success-subtle">
                <CheckCircle2 size={24} className="text-success flex-shrink-0" />
                <div>
                  <div className="fw-bold small text-success">
                    {t('amenities.shared_facility_auto_confirmed')}
                  </div>
                  <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>
                    {t('amenities.shared_facility_auto_confirmed_desc')}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={formik.handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <DatePicker
                    label={t('amenities.booking_date')}
                    name="bookingDate"
                    required
                    minDate={today()}
                    value={formik.values.bookingDate}
                    onChange={(e) => {
                      const val = typeof e === 'string' ? e : e?.target?.value;
                      formik.setFieldValue('bookingDate', val);
                    }}
                    onBlur={() => formik.setFieldTouched('bookingDate', true)}
                    error={formik.errors.bookingDate}
                    touched={formik.touched.bookingDate}
                    style={{ height: '40px' }}
                  />
                </div>
                <div className="col-12 col-md-4">
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
                    style={{ fontSize: '0.875rem', height: '40px' }}
                  />
                  {formik.touched.startTime && formik.errors.startTime && (
                    <div className="invalid-feedback">{formik.errors.startTime}</div>
                  )}
                </div>
                <div className="col-12 col-md-4">
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
                    style={{ fontSize: '0.875rem', height: '40px' }}
                  />
                  {formik.touched.endTime && formik.errors.endTime && (
                    <div className="invalid-feedback">{formik.errors.endTime}</div>
                  )}
                </div>

                {isShared && (
                  <div className="col-12 col-md-6">
                    <Select
                      label={t('amenities.number_of_persons')}
                      required
                      name="memberCount"
                      options={personOptions}
                      value={String(formik.values.memberCount)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        formik.setFieldValue('memberCount', val);
                      }}
                      onBlur={() => formik.setFieldTouched('memberCount', true)}
                      error={formik.errors.memberCount}
                      touched={formik.touched.memberCount}
                      style={{ height: '40px' }}
                    />
                  </div>
                )}

                <div className={isShared ? "col-12 col-md-6" : "col-12"}>
                  <label className="form-label fw-medium text-secondary small mb-1">
                    {isShared ? t('amenities.notes_activity_optional') : t('amenities.purpose_optional')}
                  </label>
                  <input
                    type="text"
                    name="purpose"
                    className={fieldClass('purpose')}
                    value={formik.values.purpose}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={
                      isShared
                        ? t('amenities.activity_placeholder')
                        : t('amenities.purpose_placeholder')
                    }
                    style={{ fontSize: '0.875rem', height: '40px' }}
                  />
                </div>

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
                      className="btn btn-dark fw-medium px-4 d-inline-flex align-items-center justify-content-center"
                      disabled={loading}
                      style={{
                        height: '38px',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        opacity: loading ? 0.55 : 1,
                      }}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : isShared ? (
                        <>
                          <Users size={16} className="me-1" />{' '}
                          {formik.values.memberCount > 1
                            ? t('amenities.confirm_free_spots', { count: formik.values.memberCount })
                            : t('amenities.confirm_free_spot')}
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-1" /> {t('amenities.submit_request')}
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

export default BookingFormModal;
