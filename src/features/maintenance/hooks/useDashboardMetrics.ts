import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { maintenanceApi } from '../api/maintenanceApi';
import type { AdminDashboardMetrics, ResidentDashboardMetrics } from '../types/maintenance.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

export const useDashboardMetrics = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | ResidentDashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await maintenanceApi.getDashboardMetrics();
      setMetrics(data);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('maintenance.fetch_metrics_failed')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await maintenanceApi.getDashboardMetrics();
        if (!cancelled) setMetrics(data);
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('maintenance.fetch_metrics_failed')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [t]);

  return { metrics, loading, refetch: fetchMetrics };
};