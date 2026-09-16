import React from 'react';
import { useTranslation } from 'react-i18next';

export interface FailedImportItem {
  row: number;
  identifier: string;
  reason: string;
}

interface ImportResultsModalProps {
  show: boolean;
  onClose: () => void;
  successCount: number;
  failedCount: number;
  failedItems: FailedImportItem[];
  title: string;
}

const ImportResultsModal: React.FC<ImportResultsModalProps> = ({
  show,
  onClose,
  successCount,
  failedCount,
  failedItems,
  title,
}) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1} style={{ backdropFilter: "blur(4px)", zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 rounded-3 shadow-lg bg-white">
          
          {/* Modal Header */}
          <div className="modal-header d-flex align-items-start justify-content-between border-bottom border-light-subtle px-4 py-4 position-relative">
            <div>
              <h5 className="modal-title fw-bold m-0 text-dark" style={{ fontSize: "1rem", color: "#1a1f36" }}>
                {title}
              </h5>
              <p className="text-muted m-0 small" style={{ fontSize: "0.8rem" }}>
                {t('import.results_subtitle')}
              </p>
            </div>
            <button
              type="button"
              className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
              style={{ top: 22, right: 22, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem', borderRadius: '6px' }}
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <i className="bi bi-x" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            
            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="card bg-success-subtle border-0 rounded-3 p-3">
                  <div className="small fw-semibold text-success-emphasis text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                    {t('import.successfully_imported')}
                  </div>
                  <div className="fs-3 fw-bold text-success mt-1">
                    {successCount}
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="card bg-warning-subtle border-0 rounded-3 p-3">
                  <div className="small fw-semibold text-warning-emphasis text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                    {t('import.skipped_failed')}
                  </div>
                  <div className="fs-3 fw-bold text-warning mt-1">
                    {failedCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Failures List */}
            {failedItems.length > 0 ? (
              <div>
                <h6 className="fw-bold text-secondary mb-3 small text-uppercase" style={{ letterSpacing: '0.05em' }}>
                  {t('import.skipped_rows_details')}
                </h6>
                <div className="table-responsive border rounded-3" style={{ maxHeight: '250px' }}>
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="ps-3" style={{ width: '80px' }}>{t('import.col_row')}</th>
                        <th scope="col">{t('import.col_identifier')}</th>
                        <th scope="col" className="pe-3">{t('import.col_reason')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {failedItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="ps-3 fw-bold text-muted">#{item.row}</td>
                          <td className="fw-semibold text-dark">{item.identifier}</td>
                          <td className="pe-3 text-secondary">
                            <span className="badge bg-danger-subtle text-danger text-wrap text-start fw-normal px-2 py-1.5" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                              {item.reason}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-secondary">
                <i className="bi bi-check-circle-fill text-success fs-1 mb-2 d-block" />
                <p className="mb-0 fw-semibold">{t('import.all_items_successful')}</p>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="modal-footer border-top border-light-subtle px-4 py-3">
            <button
              type="button"
              className="btn btn-dark fw-medium px-4"
              onClick={onClose}
              style={{ height: "38px", fontSize: "0.875rem", borderRadius: "8px" }}
            >
              {t('common.close')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ImportResultsModal;
