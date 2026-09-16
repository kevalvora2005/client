import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useResidents } from "./useResidents";
import { useResidentMutations } from "./useResidentMutations";
import type {
  ResidentDetail,
  CreateResidentPayload,
  UpdateResidentPayload,
} from "../types/resident.types";
import { showSuccess } from "../../../utils/toast";
import { useNavigate } from "react-router-dom";

export const useResidentsPage = () => {
  const { t } = useTranslation();
  // ── Data ──────────────────────────────────────────────────
  const {
    residents,
    pagination,
    stats,
    filters,
    loading,
    updateFilters,
    changePage,
    refetch,
  } = useResidents();

  const {
    createResident, createLoading, updateResident, updateLoading,
    deactivateResident, deactivateLoading, importResidents, importLoading
  } = useResidentMutations(refetch);

  // ── Modal state ───────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState<ResidentDetail | null>(null);

  // ── Handlers ──────────────────────────────────────────────
  const navigate = useNavigate();

  const handleView = (resident: ResidentDetail) => {
    navigate(`/residents/${resident.id}`);
  };

  const handleEdit = (resident: ResidentDetail) => {
    setSelectedResident(resident);
    setShowEditModal(true);
  };

  const handleDeactivate = (resident: ResidentDetail) => {
    setSelectedResident(resident);
    setShowDeactivateModal(true);
  };

  const handleCreate = async (payload: CreateResidentPayload): Promise<boolean> => {
    const result = await createResident(payload);
    if (result) {
      setShowAddModal(false);
      showSuccess(t("residents.create_success"));
      return true;
    }
    return false;
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
    // data
    residents,
    pagination,
    stats,
    filters,
    loading,

    // actions
    updateFilters,
    changePage,

    // modal states
    showAddModal,
    showEditModal,
    showDeactivateModal,
    selectedResident,
    createLoading,
    updateLoading,
    deactivateLoading,
    importLoading,

    // modal handlers
    setShowAddModal,
    handleView,
    handleEdit,
    handleDeactivate,
    handleCreate,
    handleUpdate,
    handleDeactivateConfirm,
    handleCloseEdit,
    handleCloseDeactivate,
    importResidents,
  };
};