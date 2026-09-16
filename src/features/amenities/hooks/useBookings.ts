import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { bookingApi } from '../api/bookingApi';
import type { Booking, BookingListFilters } from '../types/amenity.types';
import type { PaginatedResult } from '../../../types/pagination.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

export const useMyBookings = (scope: 'upcoming' | 'past', pageNumber = 1, pageSize = 10) => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResult<unknown>, 'items'>>({
    pageNumber: 1,
    totalPages: 1,
    pageSize: pageSize,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await bookingApi.listMine(scope, pageNumber, pageSize);
        if (!cancelled) {
          setBookings(data.items);
          setPagination({
            pageNumber: data.pageNumber,
            totalPages: data.totalPages,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            hasNextPage: data.hasNextPage,
            hasPreviousPage: data.hasPreviousPage,
          });
        }
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('amenities.load_bookings_failed')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [scope, pageNumber, pageSize, nonce, t]);

  return { bookings, pagination, loading, refetch };
};

export const useAdminBookings = (
  filters: BookingListFilters = {},
  pageNumber = 1,
  pageSize = 10
) => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResult<unknown>, 'items'>>({
    pageNumber: 1,
    totalPages: 1,
    pageSize: pageSize,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  const serialized = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const parsed = serialized ? JSON.parse(serialized) : {};
        const data = await bookingApi.listAdmin({ ...parsed, pageNumber, pageSize });
        if (!cancelled) {
          setBookings(data.items);
          setPagination({
            pageNumber: data.pageNumber,
            totalPages: data.totalPages,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            hasNextPage: data.hasNextPage,
            hasPreviousPage: data.hasPreviousPage,
          });
        }
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('amenities.load_bookings_failed')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [serialized, pageNumber, pageSize, nonce, t]);

  return { bookings, pagination, loading, refetch };
};
