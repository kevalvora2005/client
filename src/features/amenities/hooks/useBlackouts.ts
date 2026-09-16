import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { amenityApi } from '../api/amenityApi';
import type { CreateBlackoutPayload } from '../types/amenity.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showSuccess, showError } from '../../../utils/toast';

export const useBlackouts = (amenityId: number, refetch: () => void) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const create = async (payload: CreateBlackoutPayload): Promise<boolean> => {
    try {
      setLoading(true);
      await amenityApi.createBlackout(amenityId, payload);
      showSuccess(t('amenities.blackout_added'));
      refetch();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('amenities.add_blackout_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (bid: number): Promise<boolean> => {
    try {
      setLoading(true);
      await amenityApi.deleteBlackout(amenityId, bid);
      showSuccess(t('amenities.blackout_removed'));
      refetch();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('amenities.remove_blackout_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { create, remove, loading };
};
