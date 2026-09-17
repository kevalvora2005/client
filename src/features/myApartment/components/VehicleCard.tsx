import { useTranslation } from "react-i18next";
import type { Vehicle } from "../types/vehicle.types";

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  readOnly?: boolean;
}

const typeIcons: Record<string, string> = {
  Car: "bi-car-front",
  Bike: "bi-bicycle",
  Scooter: "bi-scooter",
  Other: "bi-truck",
};

const fuelColors: Record<string, { bg: string; color: string }> = {
  Petrol: { bg: "#fff7ed", color: "#c2410c" },
  Diesel: { bg: "#f1f5f9", color: "#475569" },
  Electric: { bg: "#f0fdf4", color: "#15803d" },
  CNG: { bg: "#eff6ff", color: "#1d4ed8" },
  Hybrid: { bg: "#fdf4ff", color: "#7e22ce" },
};

const VehicleCard = ({ vehicle, onEdit, onDelete, readOnly = false }: VehicleCardProps) => {
  const { t } = useTranslation();
  const fuelStyle = fuelColors[vehicle.fuelType] ?? { bg: "#f3f4f6", color: "#374151" };

  return (
    <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border border-light-subtle bg-white gap-3 flex-wrap">
      {/* ── Left — icon + info ── */}
      <div className="d-flex align-items-center gap-3 min-w-0">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 42, height: 42, background: "#eef2ff", color: "#4338ca" }}
        >
          <i className={`bi ${typeIcons[vehicle.type] ?? "bi-car-front"}`} style={{ fontSize: "1.1rem" }} />
        </div>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <p className="fw-semibold mb-0 text-dark" style={{ fontSize: "0.9rem" }}>
              {vehicle.brandName} {vehicle.model}
            </p>
            <span
              className="badge rounded-pill fw-medium px-2 py-1"
              style={{ fontSize: "0.72rem", background: fuelStyle.bg, color: fuelStyle.color }}
            >
              {t(`myApartment.fuel_type_${vehicle.fuelType.toLowerCase()}`)}
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge rounded-pill fw-medium px-2 py-1"
              style={{ fontSize: "0.72rem", background: "#eef2ff", color: "#4338ca" }}
            >
              {vehicle.plateNumber}
            </span>
            <span className="text-muted" style={{ fontSize: "0.8rem" }}>
              {vehicle.color} · {t(`myApartment.vehicle_type_${vehicle.type.toLowerCase()}`)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Right — actions ── */}
      {!readOnly && (
        <div className="d-flex align-items-center gap-2 flex-shrink-0">

          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            style={{ fontSize: "0.8rem", borderRadius: "8px" }}
            onClick={() => onEdit(vehicle)}
          >
            <i className="bi bi-pencil" /> {t('common.edit')}
          </button>
          <button
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
            style={{ fontSize: "0.8rem", borderRadius: "8px" }}
            onClick={() => onDelete(vehicle)}
          >
            <i className="bi bi-trash3" /> {t('myApartment.remove')}
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleCard;