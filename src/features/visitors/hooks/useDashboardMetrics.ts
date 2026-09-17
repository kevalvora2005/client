import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { visitorApi } from '../api/visitorApi';
import type { VisitorDashboardMetrics } from '../types/visitor.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

export const useDashboardMetrics = (enabled: boolean = true) => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<VisitorDashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);

  const fetchMetrics = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await visitorApi.getDashboardMetrics();
      setMetrics(data);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('visitors.fetch_metrics_failed')));
    } finally {
      setLoading(false);
    }
  }, [enabled, t]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await visitorApi.getDashboardMetrics();
        if (!cancelled) setMetrics(data);
      } catch (err: unknown) {
        if (!cancelled && !silent) showError(getErrorMessage(err, t('visitors.fetch_metrics_failed')));
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
  }, [enabled, t]);

  return { metrics, loading, refetch: fetchMetrics };
};