import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Ban } from "lucide-react";
import { DocModal } from "./DocModal";
import type { DocumentRequestItem } from "../types/documentRequest.types";
import { getDocTypeLabel } from "../utils/getDocTypeLabel";

interface Props {
  target: DocumentRequestItem | null;
  onClose: () => void;
  onSubmit: (requestId: number, reason?: string) => Promise<boolean>;
}

const RejectDocumentModal = ({ target, onClose, onSubmit }: Props) => {
  const { t } = useTranslation();
  const [rejecting, setRejecting] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        reason: Yup.string()
          .trim()
          .max(300, t("documents.reason_max_error")),
      }),
    [t]
  );

  const formik = useFormik({
    initialValues: { reason: "" },
    validationSchema,
    onSubmit: async (values) => {
      if (!target) return;
      setRejecting(true);
      const ok = await onSubmit(target.id, values.reason);
      setRejecting(false);
      if (ok) {
        formik.resetForm();
        onClose();
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const docName = target?.documentType ? getDocTypeLabel(target.documentType, t) : "";

  return (
    <DocModal open={!!target} onClose={handleClose} title={t("documents.decline_modal_title")} maxWidth="460px">
      <form onSubmit={formik.handleSubmit}>
        <div className="modal-body p-3 p-sm-4 d-flex flex-column gap-3">
          <p className="text-secondary small mb-0">
            {t("documents.decline_confirm_msg", { name: docName })}
          </p>
          <div>
            <label className="form-label fw-medium text-secondary small mb-1">
              {t("documents.reason_label")} <span className="text-muted fw-normal">{t("documents.optional")}</span>
            </label>
            <textarea
              className="form-control rounded-2 shadow-none small"
              placeholder={t("documents.reason_placeholder")}
              {...formik.getFieldProps("reason")}
              style={{
                fontSize: "0.875rem",
                height: 80,
                resize: "none",
                borderColor: formik.touched.reason && formik.errors.reason
                  ? '#dc3545'
                  : undefined,
              }}
            />
            {formik.touched.reason && formik.errors.reason && (
              <small className="text-danger d-block mt-1" style={{ fontSize: '0.78rem' }}>{formik.errors.reason}</small>
            )}
          </div>
        </div>
        <div className="modal-footer border-top border-light-subtle px-3 px-sm-4 py-3 gap-2 d-flex justify-content-end align-items-center">
          <button type="button" className="btn btn-outline-secondary rounded-2 px-3 small" onClick={handleClose} disabled={rejecting} style={{ height: '38px', fontSize: '0.875rem' }}>
            {t("common.cancel")}
          </button>
          <button type="submit" className="btn btn-dark fw-medium px-3 d-inline-flex align-items-center" disabled={rejecting} style={{ height: '38px', fontSize: '0.875rem', borderRadius: '8px', opacity: rejecting ? 0.55 : 1 }}>
            {rejecting ? <span className="spinner-border spinner-border-sm" /> : <><Ban size={16} className="me-1" /> {t("documents.decline_request")}</>}
          </button>
        </div>
      </form>
    </DocModal>
  );
};

export default RejectDocumentModal;
