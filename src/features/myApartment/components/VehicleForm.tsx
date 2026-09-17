import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "../../../components/Select/Select";
import type { CreateVehiclePayload, FuelType, UpdateVehiclePayload, Vehicle, VehicleType } from "../types/vehicle.types";

const VEHICLE_TYPES: VehicleType[] = ["Car", "Bike", "Scooter", "Other"];
const FUEL_TYPES: FuelType[] = ["Petrol", "Diesel", "Electric", "CNG", "Hybrid"];

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  loading: boolean;
  onSubmit: (payload: CreateVehiclePayload | UpdateVehiclePayload) => Promise<boolean>;
  onCancel: () => void;
}

const VehicleForm = ({ vehicle, loading, onSubmit, onCancel }: VehicleFormProps) => {
  const { t } = useTranslation();
  const isEdit = !!vehicle;

  const schema = useMemo(
    () =>
      Yup.object({
        plateNumber: Yup.string().trim().required(t('myApartment.plate_req')),
        type: Yup.string().oneOf(VEHICLE_TYPES, t('myApartment.type_invalid')).required(t('myApartment.type_req')),
        brandName: Yup.string().trim().required(t('myApartment.brand_req')),
        model: Yup.string().trim().required(t('myApartment.model_req')),
        color: Yup.string().trim().required(t('myApartment.color_req')),
        fuelType: Yup.string().oneOf(FUEL_TYPES, t('myApartment.fuel_invalid')).required(t('myApartment.fuel_req')),
      }),
    [t]
  );

  const vehicleTypeOptions = useMemo(
    () =>
      VEHICLE_TYPES.map((type) => ({
        value: type,
        label: t(`myApartment.vehicle_type_${type.toLowerCase()}`),
      })),
    [t]
  );

  const fuelTypeOptions = useMemo(
    () =>
      FUEL_TYPES.map((fuel) => ({
        value: fuel,
        label: t(`myApartment.fuel_type_${fuel.toLowerCase()}`),
      })),
    [t]
  );

  const formik = useFormik({
    initialValues: {
      plateNumber: vehicle?.plateNumber ?? "",
      type: vehicle?.type ?? "" as VehicleType,
      brandName: vehicle?.brandName ?? "",
      model: vehicle?.model ?? "",
      color: vehicle?.color ?? "",
      fuelType: vehicle?.fuelType ?? "" as FuelType,
    },
    validationSchema: schema,
    onSubmit: async (values, { resetForm }) => {
      const success = await onSubmit(values);
      if (success) resetForm();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="row g-3">

        {/* Plate Number */}
        <div className="col-12 col-md-4">
          <label className="form-label fw-medium text-secondary small mb-1">
            {t('myApartment.plate_number')} <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="plateNumber"
            className={`form-control shadow-none ${formik.touched.plateNumber && formik.errors.plateNumber ? "is-invalid" : "border-light-subtle"}`}
            placeholder={t('myApartment.plate_placeholder')}
            value={formik.values.plateNumber}
            onChange={(e) => formik.setFieldValue("plateNumber", e.target.value.toUpperCase())}
            onBlur={formik.handleBlur}
            style={{ fontSize: "0.875rem", height: "40px" }}
          />
          {formik.touched.plateNumber && formik.errors.plateNumber && (
            <div className="invalid-feedback">{formik.errors.plateNumber}</div>
          )}
        </div>

        {/* Type */}
        <div className="col-12 col-md-4">
          <Select
            label={t('myApartment.vehicle_type')}
            name="type"
            required
            options={vehicleTypeOptions}
            placeholder={t('myApartment.select_type')}
            value={formik.values.type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.type}
            touched={formik.touched.type}
            className="shadow-none"
            direction="down"
          />
        </div>

        {/* Fuel Type */}
        <div className="col-12 col-md-4">
          <Select
            label={t('myApartment.fuel_type')}
            name="fuelType"
            required
            options={fuelTypeOptions}
            placeholder={t('myApartment.select_fuel_type')}
            value={formik.values.fuelType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.fuelType}
            touched={formik.touched.fuelType}
            className="shadow-none"
            direction="down"
          />
        </div>

        {/* Brand Name */}
        <div className="col-12 col-md-4">
          <label className="form-label fw-medium text-secondary small mb-1">
            {t('myApartment.brand_name')} <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="brandName"
            className={`form-control shadow-none ${formik.touched.brandName && formik.errors.brandName ? "is-invalid" : "border-light-subtle"}`}
            placeholder={t('myApartment.brand_placeholder')}
            value={formik.values.brandName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{ fontSize: "0.875rem", height: "40px" }}
          />
          {formik.touched.brandName && formik.errors.brandName && (
            <div className="invalid-feedback">{formik.errors.brandName}</div>
          )}
        </div>

        {/* Model */}
        <div className="col-12 col-md-4">
          <label className="form-label fw-medium text-secondary small mb-1">
            {t('myApartment.model')} <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="model"
            className={`form-control shadow-none ${formik.touched.model && formik.errors.model ? "is-invalid" : "border-light-subtle"}`}
            placeholder={t('myApartment.model_placeholder')}
            value={formik.values.model}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{ fontSize: "0.875rem", height: "40px" }}
          />
          {formik.touched.model && formik.errors.model && (
            <div className="invalid-feedback">{formik.errors.model}</div>
          )}
        </div>

        {/* Color */}
        <div className="col-12 col-md-4">
          <label className="form-label fw-medium text-secondary small mb-1">
            {t('myApartment.color')} <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="color"
            className={`form-control shadow-none ${formik.touched.color && formik.errors.color ? "is-invalid" : "border-light-subtle"}`}
            placeholder={t('myApartment.color_placeholder')}
            value={formik.values.color}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{ fontSize: "0.875rem", height: "40px" }}
          />
          {formik.touched.color && formik.errors.color && (
            <div className="invalid-feedback">{formik.errors.color}</div>
          )}
        </div>

        {/* Actions */}
        <div className="col-12">
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={loading}
              style={{ fontSize: "0.875rem", height: "40px", borderRadius: "8px" }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-dark d-flex align-items-center justify-content-center gap-1"
              disabled={loading}
              style={{ fontSize: "0.875rem", height: "40px", borderRadius: "8px", backgroundColor: "#1a1f36", borderColor: "#1a1f36" }}
            >
              {loading
                ? <span className="spinner-border spinner-border-sm" />
                : <><i className={`bi ${isEdit ? "bi-check-lg" : "bi-plus-lg"}`} /> {isEdit ? t('common.save') : t('myApartment.add_vehicle_btn')}</>
              }
            </button>
          </div>
        </div>

      </div>
    </form>
  );
};

export default VehicleForm;