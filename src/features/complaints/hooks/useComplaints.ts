import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { complaintApi } from '../api/complaintApi';
import type { PaginatedComplaints, ComplaintListParams } from '../types/complaint.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

export const useComplaints = (params?: ComplaintListParams, isAdmin: boolean = true, ownOnly: boolean = false) => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState<PaginatedComplaints | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const serializedParams = JSON.stringify(params);

  const fetchFn = isAdmin
    ? complaintApi.getComplaints
    : ownOnly
      ? complaintApi.getMyComplaints
      : complaintApi.getApartmentComplaints;

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const parsed = serializedParams ? JSON.parse(serializedParams) : undefined;
      const response = await fetchFn(parsed);
      setComplaints(response);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('complaints.fetch_failed')));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedParams, isAdmin, ownOnly, t]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const parsed = serializedParams ? JSON.parse(serializedParams) : undefined;
        const response = await fetchFn(parsed);
        if (!cancelled) setComplaints(response);
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('complaints.fetch_failed')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedParams, isAdmin, ownOnly, t]);

  return { complaints, loading, refetch: fetchComplaints };
};