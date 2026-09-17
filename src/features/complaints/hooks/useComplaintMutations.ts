import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { complaintApi } from '../api/complaintApi';
import type { UpdateComplaintStatusPayload } from '../types/complaint.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showSuccess, showError } from '../../../utils/toast';

export const useComplaintMutations = (onSuccess?: () => void) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const createComplaint = async (formData: FormData): Promise<boolean> => {
    try {
      setLoading(true);
      await complaintApi.createComplaint(formData);
      showSuccess(t('complaints.create_success'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('complaints.create_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, payload: UpdateComplaintStatusPayload): Promise<boolean> => {
    try {
      setLoading(true);
      await complaintApi.updateStatus(id, payload);
      showSuccess(t('complaints.update_status_success'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('complaints.update_status_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (id: number, content: string): Promise<boolean> => {
    try {
      setLoading(true);
      await complaintApi.addComment(id, content);
      showSuccess(t('complaints.comment_success'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('complaints.comment_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteComplaint = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await complaintApi.deleteComplaint(id);
      showSuccess(t('complaints.delete_success'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('complaints.delete_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createComplaint,
    updateStatus,
    addComment,
    deleteComplaint,
    loading,
  };
};