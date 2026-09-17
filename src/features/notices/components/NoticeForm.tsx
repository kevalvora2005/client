import { useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import Select from '../../../components/Select/Select';
import type { Notice, NoticeCategory, CreateNoticePayload, UpdateNoticePayload } from '../types/notice.types';

const CATEGORIES: NoticeCategory[] = ['General', 'Maintenance', 'Emergency', 'Event'];

interface NoticeFormProps {
  notice?: Notice | null;
  loading: boolean;
  onSubmit: (payload: CreateNoticePayload | UpdateNoticePayload) => Promise<boolean>;
  onCancel: () => void;
}

const NoticeForm = ({ notice, loading, onSubmit, onCancel }: NoticeFormProps) => {
  const { t } = useTranslation();
  const isEdit = !!notice;

  const schema = useMemo(
    () =>
      Yup.object({
        title: Yup.string().trim().required(t('validation.title_req')),
        body: Yup.string().trim().required(t('validation.body_req')),
        category: Yup.string()
          .oneOf(CATEGORIES, t('validation.category_invalid'))
          .required(t('validation.category_req')),
      }),
    [t]
  );

  const categoryOptions = useMemo(
    () => [
      { value: 'General', label: t('notices.category_general') },
      { value: 'Maintenance', label: t('notices.category_maintenance') },
      { value: 'Emergency', label: t('notices.category_emergency') },
      { value: 'Event', label: t('notices.category_event') },
    ],
    [t]
  );

  const formik = useFormik({
    initialValues: {
      title: notice?.title ?? '',
      body: notice?.body ?? '',
      category: notice?.category ?? 'General',
    },
    validationSchema: schema,
    onSubmit: async (values, { resetForm }) => {
      const success = await onSubmit(values);
      if (success) resetForm();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="row g-3">

        {/* Title */}
        <div className="col-12">
          <label className="form-label fw-medium text-secondary small mb-1">
            {t('notices.label_title')} <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="title"
            className={`form-control shadow-none ${formik.touched.title && formik.errors.title ? 'is-invalid' : 'border-light-subtle'}`}
            placeholder={t('notices.placeholder_title')}
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{ fontSize: '0.875rem', height: '40px', borderColor: formik.values.title.length > 150 ? '#dc3545' : undefined }}
          />
          {formik.touched.title && formik.errors.title ? (
            <div className="invalid-feedback">{formik.errors.title}</div>
          ) : formik.values.title.length > 150 ? (
            <small className="text-danger d-block mt-1" style={{ fontSize: '0.78rem' }}>{t('notices.max_150_chars')}</small>
          ) : null}
        </div>

        {/* Category */}
        <div className="col-12">
          <Select
            label={t('notices.label_category')}
            name="category"
            required
            options={categoryOptions}
            placeholder={t('notices.select_category')}
            value={formik.values.category}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.category}
            touched={formik.touched.category}
            className="shadow-none"
          />
        </div>

        {/* Body */}
        <div className="col-12">
          <label className="form-label fw-medium text-secondary small mb-1">
            {t('notices.label_body')} <span className="text-danger">*</span>
          </label>
          <textarea
            name="body"
            rows={6}
            className={`form-control shadow-none ${formik.touched.body && formik.errors.body ? 'is-invalid' : 'border-light-subtle'}`}
            placeholder={t('notices.placeholder_body')}
            value={formik.values.body}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{ fontSize: '0.875rem', resize: 'vertical', minHeight: '120px', borderColor: formik.values.body.length > 2000 ? '#dc3545' : undefined }}
          />
          {formik.touched.body && formik.errors.body ? (
            <div className="invalid-feedback">{formik.errors.body}</div>
          ) : formik.values.body.length > 2000 ? (
            <small className="text-danger d-block mt-1" style={{ fontSize: '0.78rem' }}>{t('notices.max_2000_chars')}</small>
          ) : null}
        </div>

        {/* Actions */}
        <div className="col-12">
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
              className="btn btn-dark fw-medium px-3 d-inline-flex align-items-center"
              disabled={loading}
              style={{ height: '38px', fontSize: '0.875rem', borderRadius: '8px', opacity: loading ? 0.55 : 1 }}
            >
              {loading
                ? <span className="spinner-border spinner-border-sm" />
                : <><i className={`bi ${isEdit ? 'bi-check-lg' : 'bi-plus-lg'} me-1`} /> {isEdit ? t('notices.save_changes') : t('notices.add_notice')}</>
              }
            </button>
          </div>
        </div>

      </div>
    </form>
  );
};

export default NoticeForm;