import { useState } from "react";
import { useTranslation } from "react-i18next";
import { profileApi } from "../api/profileApi";
import type { UpdateProfilePayload, ChangePasswordPayload } from "../types/profile.types";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { showSuccess, showError } from "../../../utils/toast";
import useAuth from "../../../hooks/useAuth";

export const useProfile = () => {
  const { t } = useTranslation();
  const { updateUser } = useAuth(); 
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const updateProfile = async (payload: UpdateProfilePayload): Promise<boolean> => {
    try {
      setUpdateLoading(true);
      await profileApi.updateProfile(payload);
      updateUser(payload); 
      showSuccess('profile.profile_updated');
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('profile.update_profile_failed')));
      return false;
    } finally {
      setUpdateLoading(false);
    }
  };

  const changePassword = async (payload: ChangePasswordPayload): Promise<boolean> => {
    try {
      setPasswordLoading(true);
      await profileApi.changePassword(payload);
      showSuccess('profile.password_changed');
      return true;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('profile.change_password_failed')));
      return false;
    } finally {
      setPasswordLoading(false);
    }
  };

  return {
    updateProfile,
    updateLoading,
    changePassword,
    passwordLoading,
  };
};