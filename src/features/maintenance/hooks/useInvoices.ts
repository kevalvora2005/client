import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { maintenanceApi } from '../api/maintenanceApi';
import type { PaginatedInvoices, InvoiceListParams } from '../types/maintenance.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

export const useInvoices = (params?: InvoiceListParams, isAdmin: boolean = true, apartmentView: boolean = false) => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<PaginatedInvoices | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const serializedParams = JSON.stringify(params);

  const fetchFn = isAdmin
    ? maintenanceApi.getInvoices
    : apartmentView
      ? maintenanceApi.getApartmentInvoices
      : maintenanceApi.getMyInvoices;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const parsed = serializedParams ? JSON.parse(serializedParams) : undefined;
      const response = await fetchFn(parsed);
      setInvoices(response);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('maintenance.fetch_invoices_failed')));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedParams, isAdmin, apartmentView, t]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const parsed = serializedParams ? JSON.parse(serializedParams) : undefined;
        const response = await fetchFn(parsed);
        if (!cancelled) setInvoices(response);
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('maintenance.fetch_invoices_failed')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedParams, isAdmin, apartmentView, t]);

  return { invoices, loading, refetch: fetchInvoices };
};