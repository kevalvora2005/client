import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { amenityApi } from '../api/amenityApi';
import type { Amenity } from '../types/amenity.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

export const useAmenities = () => {
  const { t } = useTranslation();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAmenities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await amenityApi.list();
      setAmenities(data);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('amenities.fetch_failed')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await amenityApi.list();
        if (!cancelled) setAmenities(data);
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('amenities.fetch_failed')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [t]);

  return { amenities, loading, refetch: fetchAmenities };
};
