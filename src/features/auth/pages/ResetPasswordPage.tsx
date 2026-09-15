import { Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Home, ArrowLeft, Mail, KeyRound } from 'lucide-react';
import { useResetPassword } from '../hooks/useResetPassword';

const ResetPasswordPage = () => {
  const {
    token,
    formik,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isLoading,
  } = useResetPassword();

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.backgroundColor = "#ffffff";
    e.target.style.borderColor = "#111827";
    e.target.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.1)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.backgroundColor = "#f9fafb";
    e.target.style.borderColor = "#e5e7eb";
    e.target.style.boxShadow = "none";
  };

  const labelStyle: React.CSSProperties = { fontSize: "0.72rem", letterSpacing: "0.06em", color: "#374151" };
  const linkStyle: React.CSSProperties = { fontSize: "0.875rem", color: "#374151", transition: "color 0.15s ease" };

  const submitBtnStyle = (): React.CSSProperties => ({
    backgroundColor: isLoading ? "#4b5563" : "#111827",
    color: "#ffffff",
    fontSize: "0.875rem",
    letterSpacing: "0.08em",
    borderRadius: "8px",
    cursor: isLoading ? "not-allowed" : "pointer",
    transition: "background-color 0.15s ease",
    height: '38px'
  });

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    backgroundColor: "#f9fafb",
    borderColor: hasError ? "#dc2626" : "#e5e7eb",
    fontSize: "0.95rem",
    borderRadius: "8px",
  });

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-body-tertiary px-3 py-4">
      <div className="w-100" style={{ maxWidth: "480px" }}>
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

        <div className="bg-white p-4 p-sm-5 rounded-4 shadow-sm border-0">
          <h2 className="fw-bold fs-3 mb-1" style={{ color: "#111827" }}>
            {token ? 'Set new password' : 'Reset password'}
          </h2>
          <p className="text-body-secondary mb-4">
            {token
              ? 'Your new password must be at least 8 characters and contain an uppercase letter, a number, and a special character.'
              : 'Enter your email, the verification code sent to your inbox, and your new password.'}
          </p>

          <form onSubmit={formik.handleSubmit}>
            {!token && (
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-bold text-uppercase mb-2" style={labelStyle}>
                  Email Address
                </label>
                <div className="position-relative">
                  <Mail
                    size={18}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 pe-none"
                    style={{ color: "#9ca3af" }}
                  />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="name@society.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    className="form-control ps-5 pe-3 py-3 shadow-none"
                    style={inputStyle(!!(formik.touched.email && formik.errors.email))}
                    onFocus={handleFocus}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>
                    {formik.errors.email}
                  </div>
                )}
              </div>
            )}

            {!token && (
              <div className="mb-3">
                <label htmlFor="code" className="form-label fw-bold text-uppercase mb-2" style={labelStyle}>
                  Verification Code
                </label>
                <div className="position-relative">
                  <KeyRound
                    size={18}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 pe-none"
                    style={{ color: "#9ca3af" }}
                  />
                  <input
                    type="text"
                    id="code"
                    name="code"
                    placeholder="Enter code from email"
                    value={formik.values.code}
                    onChange={formik.handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    className="form-control ps-5 pe-3 py-3 shadow-none"
                    style={inputStyle(!!(formik.touched.code && formik.errors.code))}
                    onFocus={handleFocus}
                  />
                </div>
                {formik.touched.code && formik.errors.code && (
                  <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>
                    {formik.errors.code}
                  </div>
                )}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label fw-bold text-uppercase mb-2" style={labelStyle}>
                New Password
              </label>
              <div className="position-relative">
                <Lock
                  size={18}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 pe-none"
                  style={{ color: "#9ca3af" }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  placeholder="Min 8 characters"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className="form-control ps-5 pe-5 py-3 shadow-none"
                  style={inputStyle(!!(formik.touched.newPassword && formik.errors.newPassword))}
                  onFocus={handleFocus}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent p-2 pe-3 d-flex align-items-center justify-content-center"
                  style={{ color: "#9ca3af" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>
                  {formik.errors.newPassword}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label fw-bold text-uppercase mb-2" style={labelStyle}>
                Confirm Password
              </label>
              <div className="position-relative">
                <Lock
                  size={18}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 pe-none"
                  style={{ color: "#9ca3af" }}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter new password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className="form-control ps-5 pe-5 py-3 shadow-none"
                  style={inputStyle(!!(formik.touched.confirmPassword && formik.errors.confirmPassword))}
                  onFocus={handleFocus}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent p-2 pe-3 d-flex align-items-center justify-content-center"
                  style={{ color: "#9ca3af" }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>
                  {formik.errors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn w-100 fw-bold py-3 d-flex align-items-center justify-content-center border-0 mb-3"
              style={submitBtnStyle()}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "#1f2937"; }}
              onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "#111827"; }}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm mx-auto" role="status" aria-hidden="true" />
              ) : 'RESET PASSWORD'}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="d-inline-flex align-items-center gap-2 fw-semibold text-decoration-none"
                style={linkStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = "#111827"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#374151"}
              >
                <ArrowLeft size={16} strokeWidth={2} /> Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
