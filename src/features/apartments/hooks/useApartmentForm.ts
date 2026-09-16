import { useMemo } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import type { Apartment, CreateApartmentPayload, UpdateApartmentPayload, ApartmentType } from "../types/apartment.types";
import { ApartmentType as ApartmentTypeEnum } from "../types/apartment.types";

interface UseApartmentFormProps {
  mode: "add" | "edit";
  apartment?: Apartment | null;
  onSubmit: (payload: CreateApartmentPayload | UpdateApartmentPayload, id?: number) => Promise<boolean>;
  onClose: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────

export const useApartmentForm = ({
  mode,
  apartment,
  onSubmit,
  onClose,
}: UseApartmentFormProps) => {
  const { t } = useTranslation();
  const isEdit = mode === "edit";

  const addSchema = useMemo(() => Yup.object({
    block: Yup.string()
      .trim()
      .length(1, t('validation.block_char'))
      .matches(/^[A-Z]$/, t('validation.block_letter'))
      .required(t('validation.block_req')),
    floorNumber: Yup.number()
      .transform((value, originalValue) => originalValue === "" ? undefined : value)
      .min(1, t('validation.floor_min1'))
      .required(t('validation.floor_req'))
      .typeError(t('validation.floor_req')),
    unitNumber: Yup.string().trim().required(t('validation.unit_req')),
    areaSqft: Yup.number()
      .transform((value, originalValue) => originalValue === "" ? undefined : value)
      .positive(t('validation.area_positive'))
      .required(t('validation.area_req'))
      .typeError(t('validation.area_req')),
    type: Yup.string()
      .oneOf(Object.values(ApartmentTypeEnum), t('validation.type_valid'))
      .required(t('validation.type_req')),
  }), [t]);

  const editSchema = useMemo(() => Yup.object({
    block: Yup.string().trim().optional(),
    floorNumber: Yup.number()
      .transform((value, originalValue) => originalValue === "" ? undefined : value)
      .min(1, t('validation.floor_min1'))
      .optional(),
    unitNumber: Yup.string().trim().optional(),
    areaSqft: Yup.number()
      .transform((value, originalValue) => originalValue === "" ? undefined : value)
      .positive(t('validation.area_positive'))
      .optional(),
    type: Yup.string()
      .oneOf(Object.values(ApartmentTypeEnum), t('validation.type_valid'))
      .optional(),
  }), [t]);

  const formik = useFormik({
    initialValues: isEdit
      ? {
        block: apartment?.block ?? "",
        floorNumber: apartment?.floorNumber ?? "",
        unitNumber: apartment?.unitNumber,
        areaSqft: apartment?.areaSqft ?? 0,
        type: apartment?.type ?? ("" as ApartmentType),
      }
      : {
        block: "",
        floorNumber: "",
        unitNumber: "",
        areaSqft: 0,
        type: "" as ApartmentType,
      },

    validationSchema: isEdit ? editSchema : addSchema,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values, { resetForm }) => {
      if (isEdit) {
        const success = await onSubmit(values as unknown as UpdateApartmentPayload, apartment?.id);
        if (success) onClose();
      } else {
        const success = await onSubmit(values as unknown as CreateApartmentPayload);
        if (success) { resetForm(); onClose(); }
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return {
    isEdit,
    formik,
    handleClose,
  };
};