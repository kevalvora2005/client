import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApartments } from '../hooks/useApartments';
import { useApartmentMutations } from '../hooks/useApartmentMutations';
import type { Apartment, CreateApartmentPayload, UpdateApartmentPayload } from '../types/apartment.types';
import ApartmentStatsCards from '../components/ApartmentStatsCards';
import ApartmentFiltersComponent from '../components/ApartmentFilters';
import ApartmentFormModal from '../components/ApartmentFormModal';
import Pagination from '../../../components/Pagination/Pagination';
import { showSuccess } from '../../../utils/toast';
import ApartmentTable from '../components/ApartmentTable';
import ImportResultsModal, { type FailedImportItem } from '../../../components/ImportResultsModal/ImportResultsModal';
import { ImportModal } from '../../../components/ImportModal/ImportModal';

const ApartmentsPage = () => {
  const { t } = useTranslation();
  const { apartments, pagination, stats, filters, loading, updateFilters, changePage, refetch } = useApartments();
  const { createApartment, createLoading, importApartments, importLoading } = useApartmentMutations(refetch);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedApartment] = useState<Apartment | null>(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [importResults, setImportResults] = useState<{
    successCount: number;
    failedCount: number;
    failedItems: FailedImportItem[];
  } | null>(null);

  const handleView = (apartment: Apartment) => {
    navigate(`/apartments/${apartment.id}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFormSubmit = async (
    payload: CreateApartmentPayload | UpdateApartmentPayload,
  ): Promise<boolean> => {
    const success = await createApartment(payload as CreateApartmentPayload);
    if (success) showSuccess(t('apartments.create_success'));
    return success;
  };

  return (
    <div className="container-fluid p-3 p-md-4">

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <h4 className="fw-bold mb-2 fs-4 fs-sm-3" style={{ color: '#1a1f36' }}>
            {t('apartments.title')}
          </h4>
          <p className="text-muted mb-0 small">
            {t('apartments.subtitle')}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {stats.totalCount === 0 && (
            <button
              type="button"
              className="btn btn-dark fw-medium d-inline-flex align-items-center gap-2 px-3 py-2 small shadow-sm"
              onClick={() => setShowImportModal(true)}
              disabled={importLoading}
              title={t('apartments.import_excel')}
              style={{ fontSize: "0.875rem", borderRadius: "8px", backgroundColor: "#1a1f36", borderColor: "#1a1f36" }}
            >
              {importLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              ) : (
                <Upload size={16} strokeWidth={2} />
              )}
              {importLoading ? t('apartments.importing') : t('apartments.import_excel')}
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <ApartmentStatsCards stats={stats} loading={loading && stats.totalCount === 0} />

      {/* ── Table card ── */}
      <div className="card bg-white border border-light-subtle rounded-3 shadow-sm mt-4">
        <div className="card-header bg-white border-bottom border-light-subtle p-3">
          <ApartmentFiltersComponent filters={filters} onFilterChange={updateFilters} />
        </div>

        <div className="table-responsive">
          <ApartmentTable apartments={apartments} loading={loading} onView={handleView} />
        </div>

        <div className="card-footer bg-white border-top border-light-subtle p-3 d-flex justify-content-end">
          <Pagination
            pagination={pagination}
            onPageChange={changePage}
            onPageSizeChange={(size) => updateFilters({ pageSize: size })}
          />
        </div>
      </div>

      <ApartmentFormModal
        key={selectedApartment?.id ?? "add"}
        show={showModal}
        mode="add"
        apartment={selectedApartment}
        loading={createLoading}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
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
        title={t('import.results_title_apartments')}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title={t('import.title_apartments')}
        templateUrl="/templates/apartments_template.xlsx"
        templateName="apartments_template.xlsx"
        loading={importLoading}
        onUpload={async (file) => {
          const result = await importApartments(file);
          if (result) {
            setImportResults({
              successCount: result.successCount,
              failedCount: result.failedCount,
              failedItems: result.failedItems.map((item) => ({
                row: item.row,
                identifier: item.identifier || `Row ${item.row}`,
                reason: item.reason || t('common.error'),
              })),
            });
            setShowResultsModal(true);
            showSuccess(t('apartments.import_success', { count: result.successCount }));
          }
        }}
      />

    </div>
  );
}

export default ApartmentsPage;