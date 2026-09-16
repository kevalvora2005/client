import { useMemo } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import type { ResidentDetail, CreateResidentPayload, UpdateResidentPayload } from "../types/resident.types";
import { useScrollLock } from "../../../hooks/useScrollLock";

type Mode = "add" | "edit";

interface UseResidentFormProps {
  show: boolean;
  mode: Mode;
  resident?: ResidentDetail | null;
  onSubmit: (payload: CreateResidentPayload | UpdateResidentPayload, id?: number) => Promise<boolean>;
  onClose: () => void;
}

// ── Hook ─────────────────────────────────────────────────────
export const useResidentForm = ({ show, mode, resident, onSubmit, onClose }: UseResidentFormProps) => {
  const { t } = useTranslation();
  const isEdit = mode === "edit";

  useScrollLock(show);

  const addSchema = useMemo(() => Yup.object({
    name: Yup.string().trim().min(2, t('validation.name_min2')).max(100, t('validation.name_max100')).required(t('validation.name_req')),
    email: Yup.string().trim().email(t('validation.email_invalid')).required(t('validation.email_req')),
    phone: Yup.string().trim().length(10, t('validation.phone_10')).matches(/^\d+$/, t('validation.phone_digits')).required(t('validation.phone_req')),
    apartmentId: Yup.number().typeError(t('validation.apartment_id_number')).min(1, t('validation.apartment_select_req')).required(t('validation.apartment_id_req')),
  }), [t]);

  const editSchema = useMemo(() => Yup.object({
    name: Yup.string().trim().min(2, t('validation.name_min2')).max(100, t('validation.name_max100')).required(t('validation.name_req')),
    phone: Yup.string().trim().length(10, t('validation.phone_10')).matches(/^\d+$/, t('validation.phone_digits')).required(t('validation.phone_req')),
    apartmentId: Yup.number().typeError(t('validation.apartment_id_number')).min(1, t('validation.apartment_select_req')).required(t('validation.apartment_id_req')),
    isOwner: Yup.boolean().optional(),
    moveOutDate: Yup.date().typeError(t('validation.move_out_valid_date')).max(new Date(), t('validation.move_out_not_future')).optional().nullable(),
  }), [t]);

  const formik = useFormik({
    initialValues: isEdit
      ? {
        name: resident?.user.name ?? "",
        phone: resident?.user.phone ?? "",
        apartmentId: resident?.apartment?.id ?? 0,
        isOwner: resident?.isOwner ?? false,
        moveOutDate: resident?.moveOutDate ?? "",
      }
      : {
        name: "",
        email: "",
        phone: "",
        apartmentId: 0,
      },
    validationSchema: isEdit ? editSchema : addSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (isEdit) {
        if (!resident) return;
        const success = await onSubmit(values as unknown as UpdateResidentPayload, resident.id);
        if (success) onClose();
      } else {
        const success = await onSubmit(values as unknown as CreateResidentPayload);
        if (success) { resetForm(); onClose(); }
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // ── ApartmentSelect helper ────────────────────────────────
  const setApartmentId = (val: number) => {
    formik.setFieldValue("apartmentId", val);
  };

  return {
    isEdit,
    formik,
    handleClose,
    setApartmentId,
  };
};