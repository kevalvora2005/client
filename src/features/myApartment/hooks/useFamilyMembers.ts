import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { familyApi } from "../api/familyApi";
import type { FamilyMember, CreateFamilyMemberPayload, UpdateFamilyMemberPayload } from "../types/familyMember.types";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { showError, showSuccess } from "../../../utils/toast";

export const useFamilyMembers = (residentId: number) => {
  const { t } = useTranslation();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const data = await familyApi.getFamilyMembers(residentId);
        if (!cancelled) setFamilyMembers(data);
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('myApartment.fetch_family_failed')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [residentId, t]);

  const addFamilyMember = async (payload: CreateFamilyMemberPayload): Promise<boolean> => {
    try {
      const newMember = await familyApi.createFamilyMember(residentId, payload);
      setFamilyMembers((prev) => [...prev, newMember]);
      showSuccess(t('myApartment.add_family_success'));
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('myApartment.add_family_failed')));
      return false;
    }
  };

  const editFamilyMember = async (id: number, payload: UpdateFamilyMemberPayload): Promise<boolean> => {
    try {
      const updated = await familyApi.updateFamilyMember(residentId, id, payload);
      setFamilyMembers((prev) => prev.map((fm) => fm.id === id ? updated : fm));
      showSuccess(t('myApartment.update_family_success'));
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('myApartment.update_family_failed')));
      return false;
    }
  };

  const removeFamilyMember = async (id: number): Promise<boolean> => {
    try {
      await familyApi.deleteFamilyMember(residentId, id);
      setFamilyMembers((prev) => prev.filter((fm) => fm.id !== id));
      showSuccess(t('myApartment.remove_family_success'));
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('myApartment.remove_family_failed')));
      return false;
    }
  };

  return {
    familyMembers,
    loading,
    addFamilyMember,
    editFamilyMember,
    removeFamilyMember,
  };
};