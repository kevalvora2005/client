import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { residentApi } from "../api/residentApi";
import type { ResidentDetail, ResidentStats } from "../types/resident.types";
import type { PaginatedResult } from "../../../types/pagination.types";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { showError } from "../../../utils/toast";
import { useResidentStore } from "./useResidentStore";

export const useResidents = () => {
  const { t } = useTranslation();
  const { filters, updateFilters, changePage } = useResidentStore();

  const [residents, setResidents] = useState<ResidentDetail[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResult<ResidentDetail>, "items">>({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [stats, setStats] = useState<ResidentStats>({
    totalCount: 0,
    totalActive: 0,
    totalOwners: 0,
    totalTenants: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const response = await residentApi.getResidents(filters);
        if (!cancelled) {
          setResidents(response.items);
          setPagination({
            totalCount: response.totalCount,
            pageNumber: response.pageNumber,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
            hasNextPage: response.hasNextPage,
            hasPreviousPage: response.hasPreviousPage,
          });
          setStats(response.stats);
        }
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t("residents.fetch_failed")));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [filters, refreshKey, t]);

  const refetch = () => setRefreshKey((prev) => prev + 1);

  return {
    residents,
    pagination,
    stats,
    filters,
    loading,
    updateFilters,
    changePage,
    refetch,
  };
};