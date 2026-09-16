import { useTranslation } from "react-i18next";
import type { TableColumn } from "../../../components/AppTable/AppTable";
import AppTable from "../../../components/AppTable/AppTable";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import type { Apartment } from "../types/apartment.types";
import { apartmentTypeLabels, formatArea, formatFloor } from "./apartmentTableHelpers";
import { useApartmentStore } from '../hooks/useApartmentStore';
import { highlightMatch } from "../../../utils/highlight";

interface ApartmentTableProps {
  apartments: Apartment[];
  loading: boolean;
  onView: (apartment: Apartment) => void;
}

const COL_WIDTH = '157px';

// ── Main component ───────────────────────────────────────────
const ApartmentTable = ({ apartments, loading, onView }: ApartmentTableProps) => {
  const { t } = useTranslation();
  const { filters } = useApartmentStore();
  const searchVal = filters.search ?? '';

  const columns: TableColumn<Apartment>[] = [
    {
      key: "block",
      label: t("apartments.col_block"),
      width: COL_WIDTH,
      align: 'center',
      render: (a) => (
        <span className="fw-bold d-block py-2 text-dark" style={{ fontSize: "0.95rem" }}>
          {t("apartments.block_prefix", { block: a.block })} {searchVal && a.block.toLowerCase().includes(searchVal.toLowerCase()) ? highlightMatch(a.block, searchVal) : null}
        </span>
      ),
    },
    {
      key: "floor",
      label: t("apartments.col_floor"),
      width: COL_WIDTH,
      align: 'center',
      render: (a) => (
        <span className="text-dark d-block py-2" style={{ fontSize: "0.95rem" }}>
          {formatFloor(a.floorNumber)}
        </span>
      ),
    },
    {
      key: "flateNumber",
      label: t("apartments.col_flat_no"),
      width: COL_WIDTH,
      align: 'center',
      render: (a) => (
        <span className="fw-bold d-block py-2 text-dark" style={{ fontSize: "0.95rem" }}>
          {highlightMatch(`${a.block}-${a.floorNumber}${a.unitNumber}`, searchVal)}
        </span>
      ),
    },
    {
      key: "type",
      label: t("apartments.col_unit_type"),
      width: COL_WIDTH,
      align: 'center',
      render: (a) => (
        <span className="text-dark d-block py-2" style={{ fontSize: "0.95rem" }}>
          {apartmentTypeLabels[a.type] ?? a.type}
        </span>
      ),
    },
    {
      key: "area",
      label: t("apartments.col_area"),
      width: COL_WIDTH,
      align: 'center',
      render: (a) => (
        <span className="text-dark d-block py-2" style={{ fontSize: "0.95rem" }}>
          {formatArea(a.areaSqft)}
        </span>
      ),
    },
    {
      key: "status",
      label: t("common.status"),
      width: COL_WIDTH,
      align: 'center',
      render: (a) => (
        <StatusBadge variant={a.isOccupied ? 'success' : 'secondary'} label={a.isOccupied ? t("apartments.status_occupied") : t("apartments.status_vacant")} />
      ),
    },
    {
      key: "actions",
      label: t("apartments.col_view"),
      width: COL_WIDTH,
      align: 'center',
      render: (a) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
          onClick={() => onView(a)}
          style={{ borderRadius: '6px', fontSize: '0.78rem' }}
          title={t("apartments.view_details")}
        >
          <i className="bi bi-eye" />
        </button>
      ),
    }
  ];

  return (
    <AppTable
      columns={columns}
      data={apartments}
      loading={loading}
      rowKey={(a) => a.id}
      emptyTitle={t("apartments.no_apartments_found")}
      emptySubtitle={t("apartments.no_apartments_desc")}
      emptyIcon="bi-building"
    />
  );
};

export default ApartmentTable;