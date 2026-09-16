import { Mail, Lock, Eye, EyeOff, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useLogin from '../hooks/useLogin';

const LoginPage = () => {
  const { t } = useTranslation();
  const {
    formik,
    showPassword, setShowPassword,
    isLoading,
    handleSubmit,
  } = useLogin();

  const hasIdentifierError = formik.touched.identifier && !!formik.errors.identifier;
  const hasPasswordError = formik.touched.password && !!formik.errors.password;

  const getInputBorder = (hasError: boolean) => ({
    backgroundColor: hasError ? '#fef2f2' : '#f9fafb',
    borderColor: hasError ? '#ef4444' : '#e5e7eb',
    fontSize: '0.95rem' as const,
    borderRadius: '8px' as const,
  });

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-body-tertiary px-3 py-4">
      <div className="w-100" style={{ maxWidth: "480px" }}>

        {/* Brand */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2 mb-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-2"
              style={{ width: "38px", height: "38px", backgroundColor: "#111827" }}
            >
              <Home size={20} strokeWidth={2} color="#ffffff" />
            </div>
            <span className="fw-bold fs-5" style={{ color: "#111827" }}>
              Civic Horizon
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white p-4 p-sm-5 rounded-4 shadow-sm border-0">
          <h2 className="fw-bold fs-3 mb-1" style={{ color: "#111827" }}>
            {t('auth.welcome_back')}
          </h2>
          <p className="text-body-secondary mb-4">
            {t('auth.enter_credentials')}
          </p>

          <form onSubmit={handleSubmit}>

            {/* Email or Mobile */}
            <div className="mb-3">
              <label
                htmlFor="identifier"
                className="form-label fw-bold text-uppercase mb-2"
                style={{ fontSize: "0.72rem", letterSpacing: "0.06em", color: "#374151" }}
              >
                {t('auth.email_or_mobile')}
              </label>
              <div className="position-relative">
                <Mail
                  size={18}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 pe-none"
                  style={{ color: "#9ca3af" }}
                />
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  placeholder={t('auth.email_or_mobile_placeholder')}
                  value={formik.values.identifier}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                  className="form-control ps-5 py-3 shadow-none"
                  style={getInputBorder(Boolean(hasIdentifierError))}
                  onFocus={(e) => {
                    if (!hasIdentifierError) {
                      e.target.style.backgroundColor = "#ffffff";
                      e.target.style.borderColor = "#111827";
                      e.target.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.1)";
                    }
                  }}
                  onBlurCapture={(e) => {
                    formik.handleBlur(e);
                    if (!hasIdentifierError) {
                      e.target.style.backgroundColor = "#f9fafb";
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                />
              </div>
              {hasIdentifierError && (
                <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>
                  {formik.errors.identifier}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label
                  htmlFor="password"
                  className="fw-bold text-uppercase mb-0"
                  style={{ fontSize: "0.72rem", letterSpacing: "0.06em", color: "#374151" }}
                >
                  {t('auth.password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="fw-semibold text-decoration-none"
                  style={{ fontSize: "0.85rem", color: "#1f2937" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#111827"; e.currentTarget.style.textDecoration = "underline"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#1f2937"; e.currentTarget.style.textDecoration = "none"; }}
                >
                  {t('auth.forgot_link')}
                </Link>
              </div>
              <div className="position-relative">
                <Lock
                  size={18}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 pe-none"
                  style={{ color: "#9ca3af" }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder={t('auth.password_placeholder')}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                  className="form-control ps-5 pe-5 py-3 shadow-none"
                  style={getInputBorder(Boolean(hasPasswordError))}
                  onFocus={(e) => {
                    if (!hasPasswordError) {
                      e.target.style.backgroundColor = "#ffffff";
                      e.target.style.borderColor = "#111827";
                      e.target.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.1)";
                    }
                  }}
                  onBlurCapture={(e) => {
                    formik.handleBlur(e);
                    if (!hasPasswordError) {
                      e.target.style.backgroundColor = "#f9fafb";
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent p-2 pe-3 d-flex align-items-center justify-content-center"
                  style={{ color: "#9ca3af", cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#4b5563"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {hasPasswordError && (
                <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn w-100 fw-bold py-3 d-flex align-items-center justify-content-center border-0"
              style={{
                backgroundColor: isLoading ? "#4b5563" : "#111827",
                color: "#ffffff",
                fontSize: "0.875rem",
                letterSpacing: "0.08em",
                borderRadius: "8px",
                cursor: isLoading ? "not-allowed" : "pointer",
                height: '38px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = "#1f2937";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = "#111827";
                }
              }}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm mx-auto" role="status" aria-hidden="true" />
              ) : (
                t('auth.sign_in_btn')
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
