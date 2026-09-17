import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { noticeApi } from '../api/noticeApi';
import type { CreateNoticePayload, UpdateNoticePayload } from '../types/notice.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showSuccess, showError } from '../../../utils/toast';

export const useNoticeMutations = (onSuccess?: () => void) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const createNotice = async (payload: CreateNoticePayload): Promise<boolean> => {
    try {
      setLoading(true);
      await noticeApi.createNotice(payload);
      showSuccess(t('notices.create_success'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('notices.create_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateNotice = async (id: number, payload: UpdateNoticePayload): Promise<boolean> => {
    try {
      setLoading(true);
      await noticeApi.updateNotice(id, payload);
      showSuccess(t('notices.update_success'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('notices.update_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteNotice = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await noticeApi.deleteNotice(id);
      showSuccess(t('notices.delete_success'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('notices.delete_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await noticeApi.togglePin(id);
      showSuccess(t('notices.pin_success'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('notices.pin_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createNotice,
    updateNotice,
    deleteNotice,
    togglePin,
    loading,
  };
};