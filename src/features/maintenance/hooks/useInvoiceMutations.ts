import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { maintenanceApi } from '../api/maintenanceApi';
import type { GenerateInvoicesPayload } from '../types/maintenance.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

export const useInvoiceMutations = (onSuccess?: () => void) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const generateInvoices = async (payload: GenerateInvoicesPayload): Promise<boolean> => {
    try {
      setLoading(true);
      await maintenanceApi.generateInvoices(payload);
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('maintenance.generate_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markInvoiceSettled = async (id: number, paymentRef?: string): Promise<boolean> => {
    try {
      setLoading(true);
      await maintenanceApi.markInvoiceSettled(id, paymentRef);
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('maintenance.mark_settled_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const applyOverduePenalties = async (): Promise<{ penaltiesApplied: number; remindersSent: number } | null> => {
    try {
      setLoading(true);
      const result = await maintenanceApi.applyPenalties();
      onSuccess?.();
      return result;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('maintenance.apply_penalties_failed')));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateInvoices,
    markInvoiceSettled,
    applyOverduePenalties,
    loading,
  };
};