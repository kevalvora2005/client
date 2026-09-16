import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { amenityApi } from '../api/amenityApi';
import type { Amenity, Blackout } from '../types/amenity.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

export const useAmenityDetail = (id: number) => {
  const { t } = useTranslation();
  const [amenity, setAmenity] = useState<Amenity | null>(null);
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        amenityApi.get(id),
        amenityApi.listBlackouts(id).catch(() => []),
      ]);
      setAmenity(a);
      setBlackouts(b || []);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('amenities.load_failed')));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [a, b] = await Promise.all([
          amenityApi.get(id),
          amenityApi.listBlackouts(id).catch(() => []),
        ]);
        if (!cancelled) {
          setAmenity(a);
          setBlackouts(b || []);
        }
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('amenities.load_failed')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id, t]);

  return { amenity, blackouts, loading, refetch: fetchDetail };
};
