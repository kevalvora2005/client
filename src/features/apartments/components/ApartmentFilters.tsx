import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Select from "../../../components/Select/Select";
import { ApartmentType, type ApartmentFilters } from "../types/apartment.types";

interface ApartmentFiltersProps {
  filters: ApartmentFilters;
  onFilterChange: (filters: Partial<ApartmentFilters>) => void;
}

const apartmentTypeLabels: Record<ApartmentType, string> = {
  [ApartmentType.ONE_BHK]: "1 BHK",
  [ApartmentType.TWO_BHK]: "2 BHK",
  [ApartmentType.THREE_BHK]: "3 BHK",
  [ApartmentType.FOUR_BHK]: "4 BHK",
};

const ApartmentFiltersComponent = ({ filters, onFilterChange }: ApartmentFiltersProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState(filters.search ?? "");

  // debounce — 300ms
  useEffect(() => {
    if (search === (filters.search ?? "")) return;

    const timer = setTimeout(() => {
      onFilterChange({ search: search.trim() || undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [search, filters.search, onFilterChange]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ type: e.target.value || undefined });
  };

  const handleOccupiedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      isOccupied: e.target.value === '' ? undefined : e.target.value === 'true',
    });
  };

  const handleReset = () => {
    setSearch("");
    onFilterChange({ search: undefined, type: undefined, isOccupied: undefined });
  };

  const hasActiveFilters =
    !!filters.search || !!filters.type || filters.isOccupied !== undefined;

  return (
    <div className="d-flex flex-md-row flex-column align-items-stretch align-items-md-center gap-2 w-100">

      {/* Flat No. search */}
      <div className="flex-grow-1" style={{ maxWidth: "550px" }}>
        <div
          className="d-flex align-items-center bg-white border rounded-2 px-3 text-secondary search-wrapper"
          style={{ height: "46px", transition: "border-color 0.15s, box-shadow 0.15s" }}
        >
          <i className="bi bi-search me-2 fs-6 text-muted" style={{ flexShrink: 0 }} />
          <input
            type="text"
            className="w-100 border-0 p-0 bg-transparent text-dark"
            placeholder={t("apartments.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "0.875rem", outline: "none" }}
          />
        </div>
      </div>

      {/* Type */}
      <div style={{ minWidth: "140px" }}>
        <Select
          options={Object.entries(apartmentTypeLabels).map(([value, label]) => ({ value, label }))}
          placeholder={t("apartments.all_types")}
          value={filters.type ?? ""}
          onChange={handleTypeChange}
          style={{ height: "46px" }}
        />
      </div>

      {/* Occupied / Vacant */}
      <div style={{ minWidth: "140px" }}>
        <Select
          options={[
            { value: 'true', label: t("apartments.status_occupied") },
            { value: 'false', label: t("apartments.status_vacant") },
          ]}
          placeholder={t("apartments.all_statuses")}
          value={filters.isOccupied === undefined ? '' : String(filters.isOccupied)}
          onChange={handleOccupiedChange}
          style={{ height: '46px' }}
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <div className="col-auto">
          <button
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center px-3"
            onClick={handleReset}
            style={{ height: "46px", fontSize: "0.85rem" }}
          >
            <i className="bi bi-x-circle me-2"></i>
            {t("apartments.clear_filters")}
          </button>
        </div>
      )}

    </div>
  );
};

export default ApartmentFiltersComponent;