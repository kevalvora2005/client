import { Link } from 'react-router-dom';
import { Mail, Home, ArrowLeft } from 'lucide-react';
import { useForgotPassword } from '../hooks/useForgotPassword';

const ForgotPasswordPage = () => {
  const { formik, isLoading, isSubmitted } = useForgotPassword();

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
          {isSubmitted ? (
            <div className="d-flex flex-column align-items-center text-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: "64px", height: "64px", backgroundColor: "#eff6ff", color: "#2563eb" }}
              >
                <Mail size={28} strokeWidth={1.75} />
              </div>
              <h2 className="fw-bold fs-3 mb-1" style={{ color: "#111827" }}>Check your email</h2>
              <p className="text-body-secondary mb-4">
                If an account exists for <strong>{formik.values.email}</strong>, we've sent
                a verification code. Check your inbox and spam folder.
              </p>
              <p
                className="m-0 border rounded-2 px-3 py-2 text-body-secondary"
                style={{ fontSize: "0.85rem", backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
              >
                The verification code expires in <strong>10 minutes</strong>.
              </p>
              <Link
                to={`/reset-password?email=${encodeURIComponent(formik.values.email.trim())}`}
                className="btn w-100 fw-bold py-3 mt-4 border-0 d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: "#111827",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  letterSpacing: "0.08em",
                  borderRadius: "8px",
                  height: "38px",
                  textDecoration: "none"
                }}
              >
                ENTER VERIFICATION CODE
              </Link>
              <Link
                to="/login"
                className="d-inline-flex align-items-center gap-2 mt-3 fw-semibold text-decoration-none"
                style={{ fontSize: "0.875rem", color: "#374151", transition: "color 0.15s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#111827"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#374151"}
              >
                <ArrowLeft size={16} strokeWidth={2} />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="fw-bold fs-3 mb-1" style={{ color: "#111827" }}>Forgot password?</h2>
              <p className="text-body-secondary mb-4">
                Enter your email and we'll send you a verification code to reset your password.
              </p>

              <form onSubmit={formik.handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="form-label fw-bold text-uppercase mb-2"
                    style={{ fontSize: "0.72rem", letterSpacing: "0.06em", color: "#374151" }}
                  >
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
                      placeholder="name@society.com"
                      {...formik.getFieldProps('email')}
                      autoComplete="email"
                      disabled={isLoading}
                      className="form-control ps-5 py-3 shadow-none"
                      style={{
                        backgroundColor: "#f9fafb",
                        borderColor: formik.touched.email && formik.errors.email ? "#ef4444" : "#e5e7eb",
                        fontSize: "0.95rem",
                        borderRadius: "8px"
                      }}
                      onFocus={(e) => {
                        e.target.style.backgroundColor = "#ffffff";
                        if (!(formik.touched.email && formik.errors.email)) {
                          e.target.style.borderColor = "#111827";
                        }
                        e.target.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.1)";
                      }}
                      onBlur={(e) => {
                        formik.handleBlur(e);
                        e.target.style.backgroundColor = "#f9fafb";
                        if (!(formik.touched.email && formik.errors.email)) {
                          e.target.style.borderColor = "#e5e7eb";
                        }
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <div className="mt-1" style={{ color: "#ef4444", fontSize: "0.85rem" }}>
                      {formik.errors.email}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn w-100 fw-bold py-3 d-flex align-items-center justify-content-center border-0 mb-3"
                  style={{
                    backgroundColor: isLoading ? "#4b5563" : "#111827",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    letterSpacing: "0.08em",
                    borderRadius: "8px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "background-color 0.15s ease",
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
                    'SEND VERIFICATION CODE'
                  )}
                </button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="d-inline-flex align-items-center gap-2 fw-semibold text-decoration-none"
                    style={{ fontSize: "0.875rem", color: "#374151", transition: "color 0.15s ease" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#111827"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#374151"}
                  >
                    <ArrowLeft size={16} strokeWidth={2} />
                    Back to login
                  </Link>
                </div>

              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
