import { Mail, Phone, User } from 'lucide-react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import type { ProfileUser, UpdateProfilePayload } from "../types/profile.types";

interface PersonalInfoFormProps {
  user: ProfileUser;
  loading: boolean;
  onSubmit: (payload: UpdateProfilePayload) => Promise<boolean>;
}

const PersonalInfoForm = ({ user, loading, onSubmit }: PersonalInfoFormProps) => {
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      name: user.name,
      phone: user.phone,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .min(2, t('validation.name_min2'))
        .max(100, t('validation.name_max100'))
        .required(t('validation.name_req')),
      phone: Yup.string()
        .trim()
        .length(10, t('validation.phone_10'))
        .matches(/^\d+$/, t('validation.phone_digits'))
        .required(t('validation.phone_req')),
    }),
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  const inputStyle = {
    paddingLeft: "42px",
    height: "46px",
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    fontSize: "0.95rem",
    borderRadius: "8px",
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: "#ef4444",
  };

  const getInputStyle = (fieldName: 'name' | 'phone') => {
    if (formik.touched[fieldName] && formik.errors[fieldName]) {
      return errorInputStyle;
    }
    return inputStyle;
  };

  return (
    <form className="card bg-white border border-light-subtle rounded-3 p-3 p-sm-4 h-100 shadow-sm" onSubmit={formik.handleSubmit}>

      <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-4">
        <h5 className="fs-6 fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <i className="bi bi-person text-secondary" />
          <span className="ms-1">{t('profile.personal_info')}</span>
        </h5>
      </div>

      <div className="row g-3">

        <div className="col-12 col-md-6">
          <label
            className="d-block fw-bold text-uppercase mb-2"
            htmlFor="name"
            style={{ fontSize: "0.72rem", letterSpacing: "0.06em", color: "#374151" }}
          >
            {t('profile.full_name')}
          </label>
          <div className="position-relative d-flex align-items-center">
            <User
              size={18}
              className="position-absolute"
              style={{ left: "14px", color: "#9ca3af" }}
            />
            <input
              type="text"
              id="name"
              placeholder={t('profile.full_name_placeholder')}
              {...formik.getFieldProps('name')}
              className="form-control shadow-none border"
              style={getInputStyle('name')}
              onFocus={(e) => {
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.borderColor = formik.touched.name && formik.errors.name ? "#ef4444" : "#111827";
                e.target.style.boxShadow = formik.touched.name && formik.errors.name
                  ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
                  : "0 0 0 3px rgba(17, 24, 39, 0.1)";
              }}
              onBlur={(e) => {
                formik.handleBlur(e);
                e.target.style.backgroundColor = "#f9fafb";
                e.target.style.borderColor = formik.touched.name && formik.errors.name ? "#ef4444" : "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          {formik.touched.name && formik.errors.name && (
            <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>
              {formik.errors.name}
            </div>
          )}
        </div>

        <div className="col-12 col-md-6">
          <label
            className="d-block fw-bold text-uppercase mb-2"
            htmlFor="phone"
            style={{ fontSize: "0.72rem", letterSpacing: "0.06em", color: "#374151" }}
          >
            {t('profile.phone')}
          </label>
          <div className="position-relative d-flex align-items-center">
            <Phone
              size={18}
              className="position-absolute"
              style={{ left: "14px", color: "#9ca3af" }}
            />
            <input
              type="text"
              id="phone"
              placeholder={t('profile.phone_placeholder')}
              {...formik.getFieldProps('phone')}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                formik.setFieldValue('phone', val);
              }}
              className="form-control shadow-none border"
              style={getInputStyle('phone')}
              onFocus={(e) => {
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.borderColor = formik.touched.phone && formik.errors.phone ? "#ef4444" : "#111827";
                e.target.style.boxShadow = formik.touched.phone && formik.errors.phone
                  ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
                  : "0 0 0 3px rgba(17, 24, 39, 0.1)";
              }}
              onBlur={(e) => {
                formik.handleBlur(e);
                e.target.style.backgroundColor = "#f9fafb";
                e.target.style.borderColor = formik.touched.phone && formik.errors.phone ? "#ef4444" : "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          {formik.touched.phone && formik.errors.phone && (
            <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>
              {formik.errors.phone}
            </div>
          )}
        </div>

        <div className="col-12">
          <label
            className="d-block fw-bold text-uppercase mb-2"
            htmlFor="email"
            style={{ fontSize: "0.72rem", letterSpacing: "0.06em", color: "#374151" }}
          >
            {t('profile.email_address')}
          </label>
          <div className="position-relative d-flex align-items-center">
            <Mail
              size={18}
              className="position-absolute"
              style={{ left: "14px", color: "#9ca3af" }}
            />
            <input
              type="text"
              id="email"
              placeholder={t('profile.email_address')}
              value={user.email}
              readOnly
              className="form-control shadow-none border bg-light text-muted"
              style={{
                paddingLeft: "42px",
                height: "46px",
                backgroundColor: "#f9fafb",
                borderColor: "#e5e7eb",
                fontSize: "0.95rem",
                borderRadius: "8px",
                cursor: "not-allowed"
              }}
            />
          </div>
          <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
            {t('profile.email_readonly_note')}
          </div>
        </div>

      </div>

      <div className="d-flex align-items-center justify-content-end mt-4 pt-2">
        <button
          type="submit"
          className="btn btn-dark fw-medium px-3 d-inline-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto"
          disabled={loading || !formik.isValid}
          style={{ height: '38px', fontSize: '0.875rem', borderRadius: '8px', opacity: loading ? 0.55 : 1 }}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm mx-auto" role="status" aria-hidden="true" />
          ) : (
            <>
              <i className="bi bi-floppy" /> {t('profile.save_changes')}
            </>
          )}
        </button>
      </div>

    </form>
  );
};

export default PersonalInfoForm;
