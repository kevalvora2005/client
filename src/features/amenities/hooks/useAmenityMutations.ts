import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { amenityApi } from '../api/amenityApi';
import type { CreateAmenityPayload, UpdateAmenityPayload } from '../types/amenity.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showSuccess, showError } from '../../../utils/toast';

export const useAmenityMutations = (onSuccess?: () => void) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const create = async (payload: CreateAmenityPayload | FormData): Promise<boolean> => {
    try {
      setLoading(true);
      await amenityApi.create(payload);
      showSuccess(t('amenities.created_success'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('amenities.create_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: number, payload: UpdateAmenityPayload | FormData): Promise<boolean> => {
    try {
      setLoading(true);
      await amenityApi.update(id, payload);
      showSuccess(t('amenities.updated_success'));
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('amenities.update_failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { create, update, loading };
};
