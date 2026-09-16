import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apartmentApi } from "../api/apartmentApi";
import type { Apartment, ApartmentStats } from "../types/apartment.types";
import type { PaginatedResult } from "../../../types/pagination.types";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { useApartmentStore } from "./useApartmentStore";
import { showError } from "../../../utils/toast";

export const useApartments = () => {
  const { t } = useTranslation();
  const { filters, updateFilters, changePage } = useApartmentStore();

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResult<Apartment>, "items">>({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [stats, setStats] = useState<ApartmentStats>({
    totalCount: 0,
    totalOccupied: 0,
    totalVacant: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const response = await apartmentApi.getApartments(filters);
        if (!cancelled) {
          setApartments(response.items);
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
        if (!cancelled) showError(getErrorMessage(err, t("apartments.fetch_failed")));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [filters, refreshKey, t]);

  const refetch = () => setRefreshKey((prev) => prev + 1);

  return {
    apartments,
    pagination,
    stats,
    filters,
    loading,
    updateFilters,
    changePage,
    refetch,
  };
};