import { useTranslation } from "react-i18next";
import ApartmentSelect from "../../apartments/components/ApartmentSelect";
import DatePicker from "../../../components/DatePicker/DatePicker";
import { useResidentForm } from "../hooks/useResidentForm";
import type { ResidentFormModalProps } from "../types/resident.types";

const ResidentFormModal = ({ show, mode, resident, loading, onClose, onSubmit }: ResidentFormModalProps) => {
  const { t } = useTranslation();
  const { isEdit, formik, handleClose, setApartmentId } =
    useResidentForm({ show, mode, resident, onSubmit, onClose });

  if (!show) return null;

  return (
    <div
      className="modal d-block bg-dark bg-opacity-50"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <div className="modal-dialog modal-md modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 rounded-3 shadow-lg bg-white">

          {/* ── Header ── */}
          <div className="modal-header d-flex align-items-start justify-content-between border-bottom border-light-subtle px-4 py-3 position-relative">
            <div>
              <h5 className="modal-title fw-bold m-0 text-dark" style={{ fontSize: "1rem", color: "#1a1f36" }}>
                {isEdit ? t("residents.edit_resident", { name: resident?.user.name }) : t("residents.add_new_resident")}
              </h5>
              <p className="text-muted m-0 small" style={{ fontSize: "0.8rem" }}>
                {isEdit ? t("residents.edit_desc") : t("residents.add_desc")}
              </p>
            </div>

            <button
              type="button"
              className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
              style={{ top: 18, right: 18, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem', borderRadius: '6px' }}
              onClick={handleClose}
              disabled={loading}
              aria-label={t("common.close")}
            >
              <i className="bi bi-x" />
            </button>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="modal-body px-4 py-3">
              <div className="d-flex flex-column gap-3">

                {/* Full Name */}
                <div>
                  <label className="form-label fw-medium text-secondary small mb-1">{t("residents.label_full_name")} <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    className={`form-control shadow-none rounded-2 text-dark ${formik.touched.name && formik.errors.name ? "is-invalid" : ""}`}
                    placeholder={t("residents.placeholder_name")}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    style={{
                      fontSize: "0.875rem",
                      borderColor: formik.values.name.length > 100 ? "#dc3545" : formik.touched.name && formik.errors.name ? "#dc3545" : "#e5e7eb"
                    }}
                  />
                  {formik.touched.name && formik.errors.name ? (
                    <div className="invalid-feedback d-block text-danger mt-1" style={{ fontSize: "0.8rem" }}>{formik.errors.name}</div>
                  ) : formik.values.name.length > 100 ? (
                    <small className="text-danger d-block mt-1" style={{ fontSize: '0.78rem' }}>{t("residents.max_100_chars")}</small>
                  ) : null}
                </div>

                {/* Email — add only */}
                {!isEdit && (
                  <div>
                    <label className="form-label fw-medium text-secondary small mb-1">{t("residents.label_email")} <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      className={`form-control shadow-none rounded-2 text-dark ${formik.touched.email && formik.errors.email ? "is-invalid" : ""}`}
                      placeholder={t("residents.placeholder_email")}
                      value={formik.values.email ?? ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      style={{
                        fontSize: "0.875rem",
                        borderColor: formik.touched.email && formik.errors.email ? "#dc3545" : "#e5e7eb"
                      }}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div className="invalid-feedback d-block text-danger mt-1" style={{ fontSize: "0.8rem" }}>{formik.errors.email}</div>
                    )}
                  </div>
                )}

                {/* Phone */}
                <div>
                  <label className="form-label fw-medium text-secondary small mb-1">{t("residents.label_phone")} <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="phone"
                    autoComplete="phone"
                    className={`form-control shadow-none rounded-2 text-dark ${formik.touched.phone && formik.errors.phone ? "is-invalid" : ""}`}
                    placeholder={t("residents.placeholder_phone")}
                    value={formik.values.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      formik.setFieldValue('phone', val);
                    }}
                    onBlur={formik.handleBlur}
                    style={{
                      fontSize: "0.875rem",
                      borderColor: formik.values.phone.length > 10 ? "#dc3545" : formik.touched.phone && formik.errors.phone ? "#dc3545" : "#e5e7eb"
                    }}
                  />
                  {formik.touched.phone && formik.errors.phone ? (
                    <div className="invalid-feedback d-block text-danger mt-1" style={{ fontSize: "0.8rem" }}>{formik.errors.phone}</div>
                  ) : formik.values.phone.length > 10 ? (
                    <small className="text-danger d-block mt-1" style={{ fontSize: '0.78rem' }}>{t("residents.max_10_digits")}</small>
                  ) : null}
                </div>

                {/* Apartment Select (Add mode) */}
                {!isEdit && (
                  <div>
                    <label className="form-label fw-medium text-secondary small mb-1">{t("residents.label_apartment")} <span className="text-danger">*</span></label>
                    <ApartmentSelect
                      value={formik.values.apartmentId ?? 0}
                      onChange={async (id) => {
                        setApartmentId(id);
                        await formik.setFieldValue('apartmentId', id, true);
                        formik.setFieldTouched('apartmentId', true, true);
                      }}
                      onlyVacant={true}
                      error={formik.touched.apartmentId && formik.errors.apartmentId
                        ? String(formik.errors.apartmentId)
                        : undefined}
                    />
                  </div>
                )}

                {/* Apartment Readonly (Edit mode) */}
                {isEdit && resident?.apartment && (
                  <div>
                    <label className="form-label fw-medium text-secondary small mb-1">{t("residents.label_apartment")}</label>
                    <input
                      type="text"
                      className="form-control rfm-input"
                      value={`${resident.apartment.block}-${resident.apartment.floorNumber}${resident.apartment.unitNumber}`}
                      readOnly
                      disabled
                    />
                  </div>
                )}

                {/* Move-out date — edit only */}
                {isEdit && (
                  <div>
                    <DatePicker
                      label={t("residents.label_move_out_date")}
                      name="moveOutDate"
                      maxDate={new Date().toISOString().split('T')[0]}
                      value={formik.values.moveOutDate ?? ""}
                      onChange={(e) => {
                        const val = typeof e === 'string' ? e : e?.target?.value;
                        formik.setFieldValue('moveOutDate', val || null);
                      }}
                      onBlur={() => formik.setFieldTouched('moveOutDate', true)}
                      error={formik.errors.moveOutDate}
                      touched={formik.touched.moveOutDate}
                      style={{ height: '40px' }}
                    />
                    {formik.values.moveOutDate && (
                      <div className="d-flex align-items-center gap-1 mt-2 small" style={{ color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '6px 10px' }}>
                        <i className="bi bi-exclamation-triangle" />
                        {t("residents.move_out_warning")}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* ── Footer ── */}
            <div className="modal-footer border-top border-light-subtle px-4 py-3">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-2 px-3 small d-inline-flex align-items-center"
                onClick={handleClose}
                disabled={loading}
                style={{ height: "38px", fontSize: "0.875rem" }}
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="btn btn-dark fw-medium px-3 d-inline-flex align-items-center"
                disabled={loading}
                style={{
                  height: "38px",
                  fontSize: "0.875rem",
                  borderRadius: "8px",
                  opacity: loading ? 0.55 : 1
                }}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm mx-auto" role="status" />
                ) : (
                  <>
                    <i className={`bi ${isEdit ? "bi-check-lg" : "bi-person-plus"} me-1`} />
                    {isEdit ? t("residents.save_changes") : t("residents.create_resident")}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ResidentFormModal;