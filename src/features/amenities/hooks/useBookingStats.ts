import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { bookingApi } from '../api/bookingApi';
import type { BookingStats } from '../types/amenity.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

export const useBookingStats = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingApi.stats();
      setStats(data);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('amenities.load_stats_failed')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let ignore = false;
    bookingApi.stats()
      .then((data) => {
        if (!ignore) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          showError(getErrorMessage(err, t('amenities.load_stats_failed')));
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [t]);

  return { stats, loading, refetch: fetchStats };
};
