import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apartmentApi } from "../api/apartmentApi";
import type { Apartment } from "../types/apartment.types";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { showError } from "../../../utils/toast";

export const useApartment = (id: number) => {
  const { t } = useTranslation();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const response = await apartmentApi.getApartment(id);
        if (!cancelled) setApartment(response);
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t("apartments.fetch_single_failed")));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [id, refreshKey, t]);

  const refetch = () => setRefreshKey((prev) => prev + 1);

  return { apartment, loading, refetch };
};