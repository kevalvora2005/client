import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Visitor, VisitorStatus, VisitorListParams } from '../types/visitor.types';
import { visitorApi } from '../api/visitorApi';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

interface UseVisitorsOptions {
  userRole?: 'admin' | 'resident' | 'security';
  pageSize?: number;
  status?: VisitorStatus | 'ALL';
}

export const useVisitors = (options: UseVisitorsOptions = {}) => {
  const { t } = useTranslation();
  const { userRole = 'security', pageSize = 10, status: initialStatus } = options;

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [statusFilter, setStatusFilter] = useState<VisitorStatus | 'ALL'>(initialStatus ?? 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);
      const params: VisitorListParams = {
        pageNumber,
        pageSize,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery.trim() || undefined,
        loggedOnly: statusFilter === 'ALL' && userRole !== 'resident' ? true : undefined,
      };

      const result = userRole === 'resident'
        ? await visitorApi.getMyVisitors(params)
        : await visitorApi.getAll(params);

      setVisitors(result.items);
      setTotalPages(result.totalPages || 1);
      setTotalCount(result.totalCount || result.items.length);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('visitors.fetch_logs_failed')));
    } finally {
      setLoading(false);
    }
  }, [userRole, pageNumber, pageSize, statusFilter, searchQuery, t]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const params: VisitorListParams = {
          pageNumber,
          pageSize,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: searchQuery.trim() || undefined,
          loggedOnly: statusFilter === 'ALL' && userRole !== 'resident' ? true : undefined,
        };

        const result = userRole === 'resident'
          ? await visitorApi.getMyVisitors(params)
          : await visitorApi.getAll(params);

        if (isMounted) {
          setVisitors(result.items);
          setTotalPages(result.totalPages || 1);
          setTotalCount(result.totalCount || result.items.length);
        }
      } catch (err: unknown) {
        if (isMounted && !silent) {
          showError(getErrorMessage(err, t('visitors.fetch_logs_failed')));
        }
      } finally {
        if (isMounted && !silent) {
          setLoading(false);
        }
      }
    };

    loadData();

    const handleVisitorUpdate = () => loadData(true);
    window.addEventListener('visitor-updated', handleVisitorUpdate);
    window.addEventListener('focus', handleVisitorUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('visitor-updated', handleVisitorUpdate);
      window.removeEventListener('focus', handleVisitorUpdate);
    };
  }, [userRole, pageNumber, pageSize, statusFilter, searchQuery, t]);

  const handleFilterChange = (status: VisitorStatus | 'ALL') => {
    setStatusFilter(status);
    setPageNumber(1);
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setPageNumber(1);
  };

  return {
    visitors,
    loading,
    statusFilter,
    searchQuery,
    pageNumber,
    totalPages,
    totalCount,
    setPageNumber,
    setStatusFilter: handleFilterChange,
    setSearchQuery: handleSearchSubmit,
    refetch: fetchVisitors,
  };
};

export default useVisitors;
