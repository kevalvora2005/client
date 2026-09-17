import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tenantRequestApi } from '../api/tenantRequestApi';
import type { OwnerTenantStatus, SubmitTenantRequestPayload } from '../types/tenantRequest.types';
import { showError, showSuccess } from '../../../utils/toast';
import { getErrorMessage } from '../../../utils/getErrorMessage';

const useOwnerTenantRequest = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<OwnerTenantStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notOwner, setNotOwner] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tenantRequestApi.getMyStatus();
      setStatus(data);
      setNotOwner(false);
    } catch (err) {
      const axiosError = err as { response?: { status?: number } };
      if (axiosError?.response?.status === 403) {
        setNotOwner(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const runLoad = async () => {
      setLoading(true);
      try {
        const data = await tenantRequestApi.getMyStatus();
        if (!cancelled) {
          setStatus(data);
          setNotOwner(false);
        }
      } catch (err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError?.response?.status === 403 && !cancelled) {
          setNotOwner(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    runLoad();
    return () => { cancelled = true; };
  }, []);

  const submitRequest = useCallback(
    async (payload: SubmitTenantRequestPayload) => {
      setActionLoading(true);
      try {
        await tenantRequestApi.submitRequest(payload);
        showSuccess(t('tenantRequests.toast_submit_success'));
        await load();
      } catch (err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        showError(axiosError?.response?.data?.error || t('tenantRequests.toast_submit_failed'));
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [load, t]
  );

  const revokeTenancy = useCallback(async () => {
    setActionLoading(true);
    try {
      await tenantRequestApi.revokeTenancy();
      showSuccess(t('tenantRequests.toast_revoke_success'));
      await load();
    } catch (err) {
      showError(getErrorMessage(err, t('tenantRequests.toast_revoke_failed')));
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [load, t]);

  return { status, loading, actionLoading, notOwner, load, submitRequest, revokeTenancy };
};

export default useOwnerTenantRequest;
