import { useState } from "react";
import { useTranslation } from "react-i18next";
import { residentApi, type ResidentImportResponse } from "../api/residentApi";
import type { CreateResidentPayload, UpdateResidentPayload, CreateResidentResponse } from "../types/resident.types";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { showError } from "../../../utils/toast";

export const useResidentMutations = (onSuccess?: () => void) => {
  const { t } = useTranslation();
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const createResident = async (payload: CreateResidentPayload): Promise<CreateResidentResponse | null> => {
    try {
      setCreateLoading(true);
      const res = await residentApi.createResident(payload);
      onSuccess?.();
      return res;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t("residents.create_failed")));
      return null;
    } finally {
      setCreateLoading(false);
    }
  };

  const updateResident = async (id: number, payload: UpdateResidentPayload): Promise<boolean> => {
    try {
      setUpdateLoading(true);
      await residentApi.updateResident(id, payload);
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t("residents.update_failed")));
      return false;
    } finally {
      setUpdateLoading(false);
    }
  };

  const deactivateResident = async (id: number): Promise<boolean> => {
    try {
      setDeactivateLoading(true);
      await residentApi.deactivateResident(id);
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t("residents.deactivate_failed")));
      return false;
    } finally {
      setDeactivateLoading(false);
    }
  };

  const importResidents = async (file: File): Promise<ResidentImportResponse | null> => {
    try {
      setImportLoading(true);
      const res = await residentApi.importResidents(file);
      onSuccess?.();
      return res;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t("residents.import_failed")));
      return null;
    } finally {
      setImportLoading(false);
    }
  };

  return {
    createResident,
    createLoading,
    updateResident,
    updateLoading,
    deactivateResident,
    deactivateLoading,
    importResidents,
    importLoading,
  };
};