import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { bookingApi } from '../api/bookingApi';
import type { CreateBookingPayload } from '../types/amenity.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showSuccess, showError } from '../../../utils/toast';

export const useBookingMutations = (onSuccess?: () => void) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const create = async (payload: CreateBookingPayload): Promise<boolean> => {
    try {
      setLoading(true);
      await bookingApi.create(payload);
      showSuccess(t('amenities.booking_created'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('amenities.create_booking_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (id: number, reason: string): Promise<boolean> => {
    try {
      setLoading(true);
      await bookingApi.cancel(id, reason);
      showSuccess(t('amenities.booking_cancelled'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('amenities.cancel_booking_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await bookingApi.approve(id);
      showSuccess(t('amenities.booking_approved'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('amenities.approve_booking_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id: number, reason: string): Promise<boolean> => {
    try {
      setLoading(true);
      await bookingApi.reject(id, reason);
      showSuccess(t('amenities.booking_rejected'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('amenities.reject_booking_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const settle = async (id: number, paymentRef: string): Promise<boolean> => {
    try {
      setLoading(true);
      await bookingApi.settle(id, paymentRef);
      showSuccess(t('amenities.payment_recorded'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('amenities.record_payment_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { create, cancel, approve, reject, settle, loading };
};
