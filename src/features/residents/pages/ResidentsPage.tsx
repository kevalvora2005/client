import { UserPlus, Upload } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useResidentsPage } from "../hooks/useResidentsPage";
import ResidentStatsCards from "../components/ResidentStatsCards";
import ResidentFiltersComponent from "../components/ResidentFilters";
import ResidentTable from "../components/ResidentTable";
import Pagination from "../../../components/Pagination/Pagination";
import ResidentFormModal from "../components/ResidentFormModal";
import type { CreateResidentPayload, UpdateResidentPayload } from "../types/resident.types";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { residentApi } from "../api/residentApi";
import { showSuccess, showError } from "../../../utils/toast";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import ImportResultsModal, { type FailedImportItem } from "../../../components/ImportResultsModal/ImportResultsModal";
import { ImportModal } from "../../../components/ImportModal/ImportModal";

const ResidentsPage = () => {
  const { t } = useTranslation();
  const {
    residents, pagination, stats, filters, loading,
    updateFilters, changePage,
    showAddModal, showEditModal, showDeactivateModal,
    setShowAddModal, selectedResident,
    deactivateLoading, importLoading,
    handleView, handleEdit, handleDeactivate,
    handleCreate, handleUpdate, handleDeactivateConfirm,
    handleCloseEdit, handleCloseDeactivate, importResidents,
  } = useResidentsPage();

  const [promoting, setPromoting] = useState(false);
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [showResultsModal, setShowResultsModal] = useState(false);
  const [importResults, setImportResults] = useState<{
    successCount: number;
    failedCount: number;
    failedItems: FailedImportItem[];
  } | null>(null);

  const handlePromoteOccupants = async () => {
    setPromoting(true);
    try {
      const result = await residentApi.promoteOccupants();
      showSuccess(
        result.promoted > 0
          ? t('residents.promotion_ran_promoted', { count: result.promoted })
          : t('residents.promotion_ran_none')
      );
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('residents.promotion_failed')));
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <h4 className="fw-bold mb-2 fs-4 fs-sm-3" style={{ color: '#1a1f36' }}>
            {t('residents.title')}
          </h4>
          <p className="text-muted mb-0 small">
            {t('residents.subtitle')}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline-primary fw-medium d-inline-flex align-items-center justify-content-center gap-2 px-3 py-2"
            onClick={() => setShowPromoteConfirm(true)}
            disabled={promoting}
            style={{ fontSize: "0.875rem", borderRadius: "8px" }}
            title={t('residents.run_occupant_promotion')}
          >
            {promoting ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <i className="bi bi-arrow-repeat" />
            )}
            {t('residents.run_occupant_promotion')}
          </button>

          <button
            type="button"
            className="btn btn-outline-dark fw-medium d-inline-flex align-items-center gap-2 px-3 py-2 small shadow-sm"
            onClick={() => setShowImportModal(true)}
            disabled={importLoading}
            style={{ fontSize: "0.875rem", borderRadius: "8px" }}
          >
            {importLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
              <Upload size={16} strokeWidth={2} />
            )}
            {importLoading ? t('apartments.importing') : t('apartments.import_excel')}
          </button>

          <button
            type="button"
            className="btn btn-dark fw-medium d-inline-flex align-items-center gap-2 px-3 py-2 small shadow-sm"
            onClick={() => setShowAddModal(true)}
            style={{ fontSize: "0.875rem", borderRadius: "8px", backgroundColor: "#1a1f36", borderColor: "#1a1f36" }}
          >
            <UserPlus size={16} strokeWidth={2} />
            {t('residents.add_resident')}
          </button>
        </div>
      </div>

      {/* ── Stats Cards Grid ── */}
      <ResidentStatsCards stats={stats} loading={loading && stats.totalCount === 0} />

      {/* ── Table Container Card ── */}
      <div className="card bg-white border border-light-subtle rounded-3 shadow-sm mt-4">
        {/* Filters Wrapper Block */}
        <div className="card-header bg-white border-bottom border-light-subtle p-3">
          <ResidentFiltersComponent filters={filters} onFilterChange={updateFilters} />
        </div>

        {/* Dynamic List Table Area */}
        <div className="table-responsive">
          <ResidentTable
            residents={residents}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
          />
        </div>

        {/* Dynamic List Footer Section */}
        <div className="card-footer bg-white border-top border-light-subtle p-3 d-flex justify-content-end">
          <Pagination
            pagination={pagination}
            onPageChange={changePage}
            onPageSizeChange={(size) => updateFilters({ pageSize: size })}
          />
        </div>
      </div>

      {/* Form Action Triggers */}
      <ResidentFormModal
        key={selectedResident?.id ?? "add"}
        show={showAddModal || showEditModal}
        mode={showEditModal ? "edit" : "add"}
        resident={selectedResident}
        loading={showEditModal ? false : false}
        onClose={showEditModal ? handleCloseEdit : () => setShowAddModal(false)}
        onSubmit={(payload, id) =>
          showEditModal
            ? handleUpdate(id!, payload as UpdateResidentPayload)
            : handleCreate(payload as CreateResidentPayload)
        }
      />

      {/* Status Warning Triggers */}
      <ConfirmDialog
        show={showDeactivateModal}
        title={t('residents.deactivate_confirm_title')}
        message={
          selectedResident
            ? t('residents.deactivate_confirm_msg', { name: selectedResident.user.name })
            : t('residents.deactivate_confirm_generic')
        }
        confirmLabel={t('residents.deactivate_btn')}
        cancelLabel={t('common.cancel')}
        variant="warning"
        loading={deactivateLoading}
        onConfirm={async () => {
          if (!selectedResident) return;
          const success = await handleDeactivateConfirm(selectedResident.id);
          if (success) handleCloseDeactivate();
        }}
        onCancel={handleCloseDeactivate}
      />

      <ImportResultsModal
        show={showResultsModal}
        onClose={() => {
          setShowResultsModal(false);
          setImportResults(null);
        }}
        successCount={importResults?.successCount ?? 0}
        failedCount={importResults?.failedCount ?? 0}
        failedItems={importResults?.failedItems ?? []}
        title={t('import.results_title_residents')}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title={t('import.title_residents')}
        templateUrl="/templates/residents_template.xlsx"
        templateName="residents_template.xlsx"
        loading={importLoading}
        onUpload={async (file) => {
          const result = await importResidents(file);
          if (result) {
            if (result.failedCount > 0) {
              setImportResults(result);
              setShowResultsModal(true);
            } else {
              showSuccess(t('residents.import_success', { count: result.successCount }));
            }
          }
        }}
      />

      {/* ── Promote Occupants Confirm ── */}
      <ConfirmDialog
        show={showPromoteConfirm}
        title={t('residents.run_promotion_confirm_title')}
        message={t('residents.run_promotion_confirm_msg')}
        confirmLabel={t('residents.run_promotion_confirm_btn')}
        cancelLabel={t('common.cancel')}
        variant="warning"
        loading={promoting}
        onConfirm={async () => {
          setShowPromoteConfirm(false);
          await handlePromoteOccupants();
        }}
        onCancel={() => setShowPromoteConfirm(false)}
      />

    </div>
  );
};

export default ResidentsPage;