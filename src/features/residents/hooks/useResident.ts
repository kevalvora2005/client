import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { residentApi } from "../api/residentApi";
import type { ResidentDetail } from "../types/resident.types";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { showError } from "../../../utils/toast";

export const useResident = (id: number) => {
  const { t } = useTranslation();
  const [resident, setResident] = useState<ResidentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchResident = useCallback(async () => {
    setLoading(true);
    try {
      const response = await residentApi.getResident(id);
      setResident(response);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t("residents.fetch_single_failed")));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const response = await residentApi.getResident(id);
        if (!cancelled) setResident(response);
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t("residents.fetch_single_failed")));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [id, t]);

  return { resident, loading, refetch: fetchResident };
};