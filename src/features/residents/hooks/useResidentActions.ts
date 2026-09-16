import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useResidentMutations } from "./useResidentMutations";
import type { ResidentDetail, UpdateResidentPayload } from "../types/resident.types";
import { showSuccess } from "../../../utils/toast";

export const useResidentActions = () => {
  const { t } = useTranslation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState<ResidentDetail | null>(null);

  const {
    updateResident, updateLoading,
    deactivateResident, deactivateLoading,
  } = useResidentMutations();

  const handleEdit = (resident: ResidentDetail) => {
    setSelectedResident(resident);
    setShowEditModal(true);
  };

  const handleDeactivate = (resident: ResidentDetail) => {
    setSelectedResident(resident);
    setShowDeactivateModal(true);
  };

  const handleUpdate = async (id: number, payload: UpdateResidentPayload): Promise<boolean> => {
    const success = await updateResident(id, payload);
    if (success) showSuccess(t("residents.update_success"));
    return success;
  };

  const handleDeactivateConfirm = async (id: number): Promise<boolean> => {
    const success = await deactivateResident(id);
    if (success) showSuccess(t("residents.deactivate_success"));
    return success;
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedResident(null);
  };

  const handleCloseDeactivate = () => {
    setShowDeactivateModal(false);
    setSelectedResident(null);
  };

  return {
    showEditModal,
    showDeactivateModal,
    selectedResident,
    updateLoading,
    deactivateLoading,
    handleEdit,
    handleDeactivate,
    handleUpdate,
    handleDeactivateConfirm,
    handleCloseEdit,
    handleCloseDeactivate,
  };
};