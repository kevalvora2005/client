import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { visitorApi } from '../api/visitorApi';
import type { Visitor } from '../types/visitor.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

export const useCurrentlyInside = () => {
  const { t } = useTranslation();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await visitorApi.getCurrentlyInside();
      setVisitors(data);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('visitors.fetch_inside_failed')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    const load = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await visitorApi.getCurrentlyInside();
        if (!cancelled) setVisitors(data);
      } catch (err: unknown) {
        if (!cancelled && !silent) showError(getErrorMessage(err, t('visitors.fetch_inside_failed')));
      } finally {
        if (!cancelled && !silent) setLoading(false);
      }
    };

    load();

    const handleVisitorUpdate = () => load(true);
    window.addEventListener('visitor-updated', handleVisitorUpdate);
    window.addEventListener('focus', handleVisitorUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener('visitor-updated', handleVisitorUpdate);
      window.removeEventListener('focus', handleVisitorUpdate);
    };
  }, [t]);

  return { visitors, loading, refetch: fetchVisitors };
};