import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { noticeApi } from '../api/noticeApi';
import type { Notice, NoticeListParams, PaginatedNotices } from '../types/notice.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

export const useNotices = (params?: NoticeListParams) => {
  const { t } = useTranslation();
  const [notices, setNotices] = useState<PaginatedNotices | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const serializedParams = JSON.stringify(params);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const parsed = serializedParams ? JSON.parse(serializedParams) : undefined;
      const response = await noticeApi.getNotices(parsed);
      setNotices(response);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('notices.fetch_failed')));
    } finally {
      setLoading(false);
    }
  }, [serializedParams, t]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const parsed = serializedParams ? JSON.parse(serializedParams) : undefined;
        const response = await noticeApi.getNotices(parsed);
        if (!cancelled) setNotices(response);
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('notices.fetch_failed')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [serializedParams, t]);

  return { notices, loading, refetch: fetchNotices };
};

export const useNotice = (id: number) => {
  const { t } = useTranslation();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotice = useCallback(async () => {
    setLoading(true);
    try {
      const response = await noticeApi.getNotice(id);
      setNotice(response);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('notices.fetch_single_failed')));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const response = await noticeApi.getNotice(id);
        if (!cancelled) setNotice(response);
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('notices.fetch_single_failed')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [id, t]);

  return { notice, loading, refetch: fetchNotice };
};