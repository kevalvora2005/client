import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { documentRequestApi } from "../api/documentRequestApi";
import type { DocumentRequestDetail } from "../types/documentRequest.types";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { showSuccess, showError } from "../../../utils/toast";

export interface VoteEntry {
  committeeMemberId: number;
  vote: "Approve" | "Reject";
}

export const useDocumentRequestVotes = (onSuccess?: () => void) => {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<DocumentRequestDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [recording, setRecording] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const loadDetail = useCallback(async (requestId: number) => {
    setLoadingDetail(true);
    try {
      const data = await documentRequestApi.getDetail(requestId);
      setDetail(data);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t("documents.toast_load_detail_failed")));
    } finally {
      setLoadingDetail(false);
    }
  }, [t]);

  const recordVotes = useCallback(async (requestId: number, votes: VoteEntry[]): Promise<boolean> => {
    setRecording(true);
    try {
      await documentRequestApi.bulkRecordVotes(requestId, votes);
      showSuccess(t("documents.toast_record_votes_success"));
      await loadDetail(requestId);
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t("documents.toast_record_votes_failed")));
      return false;
    } finally {
      setRecording(false);
    }
  }, [loadDetail, t]);

  const finalize = useCallback(async (requestId: number): Promise<boolean> => {
    setFinalizing(true);
    try {
      await documentRequestApi.finalizeRequest(requestId);
      showSuccess(t("documents.toast_finalize_outcome_success"));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t("documents.toast_finalize_failed")));
      return false;
    } finally {
      setFinalizing(false);
    }
  }, [onSuccess, t]);

  const closeDetail = useCallback(() => {
    setDetail(null);
  }, []);

  return {
    detail,
    loadingDetail,
    recording,
    finalizing,
    loadDetail,
    recordVotes,
    finalize,
    closeDetail,
  };
};
