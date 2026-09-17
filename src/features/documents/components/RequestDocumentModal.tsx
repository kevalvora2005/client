import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "../../../components/Select/Select";
import type { SelectOption } from "../../../components/Select/Select";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { DocModal } from "./DocModal";

import { OWNER_DOC_TYPES, TENANT_DOC_TYPES, getDocTypeLabel } from "../utils/getDocTypeLabel";

interface Props {
  open: boolean;
  onClose: () => void;
  isOwner: boolean;
  onSubmit: (payload: { documentType: string; customDocumentName?: string; note?: string }) => Promise<boolean>;
}

const RequestDocumentModal = ({ open, onClose, isOwner, onSubmit }: Props) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const docOptions: SelectOption[] = useMemo(() => {
    const list = isOwner ? OWNER_DOC_TYPES : TENANT_DOC_TYPES;
    return list.map((type) => ({
      value: type,
      label: getDocTypeLabel(type, t),
    }));
  }, [isOwner, t]);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        selectedDocType: Yup.string().required(t("documents.error_doc_type_required")),
        customDocName: Yup.string().when("selectedDocType", {
          is: "Other",
          then: (schema) =>
            schema
              .trim()
              .max(150, t("documents.error_custom_doc_max"))
              .required(t("documents.error_custom_doc_required")),
          otherwise: (schema) => schema.notRequired(),
        }),
        requestNote: Yup.string().trim().max(500, t("documents.error_note_max")).optional(),
      }),
    [t]
  );

  const defaultDocType = docOptions[0]?.value ?? "";

  const formik = useFormik({
    initialValues: {
      selectedDocType: defaultDocType,
      customDocName: "",
      requestNote: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setSubmitting(true);
      const ok = await onSubmit({
        documentType: values.selectedDocType === "Other" ? values.customDocName : values.selectedDocType,
        customDocumentName: values.selectedDocType === "Other" ? values.customDocName : undefined,
        note: values.requestNote || undefined,
      });
      setSubmitting(false);
      if (ok) {
        formik.resetForm();
        onClose();
      }
    },
  });

  const [prevIsOwner, setPrevIsOwner] = useState(isOwner);
  if (isOwner !== prevIsOwner) {
    setPrevIsOwner(isOwner);
    formik.setFieldValue("selectedDocType", defaultDocType);
  }

  const handleCancel = () => {
    const hasChanges =
      formik.values.selectedDocType !== defaultDocType ||
      formik.values.customDocName ||
      formik.values.requestNote;
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      formik.resetForm();
      onClose();
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    formik.resetForm();
    onClose();
  };

  const hasError = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field];

  const getBorderColor = (field: keyof typeof formik.values) =>
    hasError(field) ? "#dc3545" : undefined;

  const modalTitle = isOwner
    ? t("documents.modal_title_request_admin")
    : t("documents.modal_title_request_owner");

  return (
    <>
      <DocModal open={open} onClose={handleCancel} title={modalTitle} maxWidth="520px">
        <form onSubmit={formik.handleSubmit}>
          <div className="modal-body p-3 p-sm-4 d-flex flex-column gap-3">
            <Select
              label={t("documents.document_type_label")}
              required
              options={docOptions}
              value={formik.values.selectedDocType}
              onChange={(e) => formik.setFieldValue("selectedDocType", e.target.value)}
            />
            {hasError("selectedDocType") && (
              <small className="text-danger d-block" style={{ fontSize: "0.78rem", marginTop: "-0.5rem" }}>
                {formik.errors.selectedDocType}
              </small>
            )}
            {formik.values.selectedDocType === "Other" && (
              <div>
                <label className="form-label fw-medium text-secondary small mb-1">
                  {t("documents.custom_doc_name_label")} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control rounded-2 shadow-none small"
                  placeholder={t("documents.custom_doc_placeholder")}
                  value={formik.values.customDocName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="customDocName"
                  style={{ fontSize: "0.875rem", borderColor: getBorderColor("customDocName") }}
                />
                {hasError("customDocName") && (
                  <small className="text-danger d-block mt-1" style={{ fontSize: "0.78rem" }}>
                    {formik.errors.customDocName}
                  </small>
                )}
              </div>
            )}
            <div>
              <label className="form-label fw-medium text-secondary small mb-1">
                {t("documents.note_label")} <span className="text-muted fw-normal">{t("documents.optional")}</span>
              </label>
              <textarea
                rows={3}
                className="form-control rounded-2 shadow-none small"
                placeholder={isOwner ? t("documents.note_placeholder_owner") : t("documents.note_placeholder_tenant")}
                value={formik.values.requestNote}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="requestNote"
                style={{ fontSize: "0.875rem", height: "80px", resize: "none", borderColor: getBorderColor("requestNote") }}
              />
              {hasError("requestNote") && (
                <small className="text-danger d-block mt-1" style={{ fontSize: "0.78rem" }}>
                  {formik.errors.requestNote}
                </small>
              )}
            </div>
          </div>
          <div className="modal-footer border-top-0 px-3 px-sm-4 py-3 gap-2 d-flex justify-content-end align-items-center">
            <button type="button" className="btn btn-outline-secondary rounded-2 px-3 small" onClick={handleCancel} disabled={submitting} style={{ height: '38px', fontSize: '0.875rem' }}>
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="btn btn-dark fw-medium px-3 d-inline-flex align-items-center justify-content-center"
              disabled={submitting}
              style={{ height: '38px', fontSize: '0.875rem', borderRadius: '8px', opacity: submitting ? 0.55 : 1, minWidth: '130px' }}
            >
              {submitting ? <span className="spinner-border spinner-border-sm" /> : t("documents.submit_request")}
            </button>
          </div>
        </form>
      </DocModal>

      <ConfirmDialog
        show={showCancelConfirm}
        title={t("documents.discard_dialog_title")}
        message={t("documents.discard_dialog_message")}
        confirmLabel={t("documents.discard_dialog_confirm")}
        cancelLabel={t("documents.discard_dialog_cancel")}
        variant="warning"
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </>
  );
};

export default RequestDocumentModal;
