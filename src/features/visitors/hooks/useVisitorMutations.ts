import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { visitorApi } from '../api/visitorApi';
import type { Visitor, LogWalkInPayload } from '../types/visitor.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError, showSuccess } from '../../../utils/toast';

interface PreRegisterPayload {
  name: string;
  phone: string;
  purpose: string;
  expectedAt: string;
  vehicleNumber?: string;
}

export const useVisitorMutations = (onSuccess?: () => void) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const preRegister = useCallback(async (payload: PreRegisterPayload, photo?: File): Promise<Visitor | null> => {
    try {
      setSubmitting(true);
      setLoading(true);
      const visitor = await visitorApi.preRegister(payload, photo);
      showSuccess(t('visitors.pre_register_success'));
      window.dispatchEvent(new CustomEvent('visitor-updated'));
      onSuccess?.();
      return visitor;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('visitors.pre_register_failed')));
      return null;
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  }, [onSuccess, t]);

  const logWalkIn = useCallback(async (payload: LogWalkInPayload, photo?: File): Promise<boolean> => {
    try {
      setSubmitting(true);
      setLoading(true);
      await visitorApi.logWalkIn(payload, photo);
      showSuccess(t('visitors.log_walkin_success'));
      window.dispatchEvent(new CustomEvent('visitor-updated'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('visitors.log_walkin_failed')));
      return false;
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  }, [onSuccess, t]);

  const respond = useCallback(async (visitorId: number, decision: 'Approve' | 'Reject'): Promise<boolean> => {
    try {
      setActionId(visitorId);
      setLoading(true);
      await visitorApi.respond(visitorId, decision);
      showSuccess(decision === 'Approve' ? t('visitors.respond_approved_success') : t('visitors.respond_rejected_success'));
      window.dispatchEvent(new CustomEvent('visitor-updated'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, decision === 'Approve' ? t('visitors.respond_approved_failed') : t('visitors.respond_rejected_failed')));
      return false;
    } finally {
      setActionId(null);
      setLoading(false);
    }
  }, [onSuccess, t]);

  const checkIn = useCallback(async (visitorId: number, photo?: File): Promise<boolean> => {
    try {
      setActionId(visitorId);
      setLoading(true);
      await visitorApi.checkIn(visitorId, photo);
      showSuccess(t('visitors.checkin_success'));
      window.dispatchEvent(new CustomEvent('visitor-updated'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('visitors.checkin_failed')));
      return false;
    } finally {
      setActionId(null);
      setLoading(false);
    }
  }, [onSuccess, t]);

  const checkOut = useCallback(async (visitorId: number): Promise<boolean> => {
    try {
      setActionId(visitorId);
      setLoading(true);
      await visitorApi.checkOut(visitorId);
      showSuccess(t('visitors.checkout_success'));
      window.dispatchEvent(new CustomEvent('visitor-updated'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('visitors.checkout_failed')));
      return false;
    } finally {
      setActionId(null);
      setLoading(false);
    }
  }, [onSuccess, t]);

  const cancel = useCallback(async (visitorId: number): Promise<boolean> => {
    try {
      setActionId(visitorId);
      setLoading(true);
      await visitorApi.cancel(visitorId);
      showSuccess(t('visitors.cancel_success'));
      window.dispatchEvent(new CustomEvent('visitor-updated'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('visitors.cancel_failed')));
      return false;
    } finally {
      setActionId(null);
      setLoading(false);
    }
  }, [onSuccess, t]);

  return {
    loading,
    submitting,
    actionId,
    preRegister,
    logWalkIn,
    respond,
    checkIn,
    checkOut,
    cancel,
  };
};

export default useVisitorMutations;