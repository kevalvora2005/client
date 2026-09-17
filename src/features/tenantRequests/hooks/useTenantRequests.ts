import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tenantRequestApi } from '../api/tenantRequestApi';
import type { TenantRequest, TenantRequestFilters } from '../types/tenantRequest.types';
import type { PaginatedResult } from '../../../types/pagination.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

const INITIAL_FILTERS: TenantRequestFilters = {
  status: 'All',
  pageNumber: 1,
  pageSize: 10,
};

const useTenantRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<TenantRequest[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResult<TenantRequest>, 'items'>>({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [filters, setFilters] = useState<TenantRequestFilters>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const data = await tenantRequestApi.listTenantRequests(filters);
        if (!cancelled) {
          setRequests(data.items);
          setPagination({
            totalCount: data.totalCount,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalPages: data.totalPages,
            hasNextPage: data.hasNextPage,
            hasPreviousPage: data.hasPreviousPage,
          });
        }
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('tenantRequests.toast_fetch_list_failed')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [filters, refreshKey, t]);

  const updateFilters = (patch: Partial<TenantRequestFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, pageNumber: 1 }));
  };

  const changePage = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  const refetch = () => setRefreshKey((prev) => prev + 1);

  return { requests, pagination, filters, loading, updateFilters, changePage, refetch };
};

export default useTenantRequests;
