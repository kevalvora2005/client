import { useState } from "react";
import { useTranslation } from "react-i18next";
import { documentRequestApi } from "../api/documentRequestApi";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { showSuccess, showError } from "../../../utils/toast";

export const useDocumentRequestMutations = (onSuccess?: () => void) => {
  const { t } = useTranslation();
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const createRequest = async (payload: { documentType: string; customDocumentName?: string; note?: string }): Promise<boolean> => {
    setSubmittingRequest(true);
    try {
      await documentRequestApi.createRequest(payload);
      showSuccess(t("documents.toast_create_request_success"));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t("documents.toast_create_request_failed")));
      return false;
    } finally {
      setSubmittingRequest(false);
    }
  };

  const uploadDocument = async (requestId: number, file: File): Promise<boolean> => {
    setUploading(true);
    try {
      await documentRequestApi.uploadDocument(requestId, file);
      showSuccess(t("documents.toast_upload_success"));
      onSuccess?.();
      return true;
    } catch {
      showError(t("documents.toast_upload_failed"));
      return false;
    } finally {
      setUploading(false);
    }
  };

  const rejectRequest = async (requestId: number, reason?: string): Promise<boolean> => {
    setRejecting(true);
    try {
      await documentRequestApi.rejectRequest(requestId, reason || "");
      showSuccess(t("documents.toast_reject_success"));
      onSuccess?.();
      return true;
    } catch {
      showError(t("documents.toast_reject_failed"));
      return false;
    } finally {
      setRejecting(false);
    }
  };

  const cancelRequest = async (requestId: number): Promise<boolean> => {
    try {
      await documentRequestApi.cancelRequest(requestId);
      showSuccess(t("documents.toast_cancel_success"));
      onSuccess?.();
      return true;
    } catch {
      showError(t("documents.toast_cancel_failed"));
      return false;
    }
  };

  return {
    createRequest,
    uploadDocument,
    rejectRequest,
    cancelRequest,
    submittingRequest,
    uploading,
    rejecting,
  };
};
