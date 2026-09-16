import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, UploadCloud, FileSpreadsheet } from "lucide-react";
import { useScrollLock } from "../../hooks/useScrollLock";
import { showError } from "../../utils/toast";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  templateUrl: string;
  templateName: string;
  onUpload: (file: File) => Promise<void> | void;
  loading: boolean;
}

export const ImportModal = ({
  isOpen,
  onClose,
  title,
  templateUrl,
  templateName,
  onUpload,
  loading,
}: ImportModalProps) => {
  const { t } = useTranslation();
  useScrollLock(isOpen);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const isBusy = loading || submitting;

  const handleDrag = (e: React.DragEvent) => {
    if (isBusy) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isBusy) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isBusy) return;
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "xls") {
      showError(t('import.invalid_file'));
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const triggerFileInput = () => {
    if (isBusy) return;
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showError(t('import.no_file_selected'));
      return;
    }
    try {
      setSubmitting(true);
      await onUpload(selectedFile);
      setSelectedFile(null);
      onClose();
    } catch {
      // Handled by parent toast/notifications
    } finally {
      setSubmitting(false);
    }
  };

  const clearSelection = () => {
    if (isBusy) return;
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(4px)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "520px" }}>
        <div className="modal-content border-0 rounded-3 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="modal-header border-bottom border-light-subtle px-4 py-3 d-flex align-items-center justify-content-between">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2 m-0 fs-5">
              <FileSpreadsheet className="text-secondary" size={22} />
              {title}
            </h5>
            <button
              type="button"
              className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
              style={{ top: 18, right: 20, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem', borderRadius: '6px' }}
              onClick={onClose}
              disabled={isBusy}
              aria-label={t('common.close')}
            >
              <i className="bi bi-x" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Body */}
            <div className="modal-body p-4">
              {/* Step 1: Download Template */}
              <div className="mb-4">
                <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "0.95rem" }}>
                  {t('import.step1_title')}
                </h6>
                <p className="text-muted small mb-3">
                  {t('import.step1_desc')}
                </p>
                <a
                  href={templateUrl}
                  download={templateName}
                  className="btn d-inline-flex align-items-center gap-2 px-3 py-2 fw-medium btn-sm text-dark"
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    transition: "all 0.15s ease-in-out",
                    pointerEvents: isBusy ? "none" : "auto",
                    opacity: isBusy ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isBusy) {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                      e.currentTarget.style.borderColor = "#94a3b8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isBusy) {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }
                  }}
                >
                  <Download size={16} />
                  {t('import.download_template')}
                </a>
              </div>

              <hr className="my-4 border-light-subtle" />

              {/* Step 2: Upload Excel File */}
              <div>
                <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "0.95rem" }}>
                  {t('import.step2_title')}
                </h6>
                <p className="text-muted small mb-3">
                  {t('import.step2_desc')}
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                  className="d-none"
                  disabled={isBusy}
                />

                <div
                  className={`border border-2 border-dashed rounded-3 p-4 text-center cursor-pointer ${
                    dragActive ? "border-primary bg-primary-subtle" : "border-light-subtle bg-white"
                  }`}
                  onClick={triggerFileInput}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{
                    cursor: isBusy ? "not-allowed" : "pointer",
                    minHeight: "160px",
                    transition: "all 0.15s ease-in-out",
                    opacity: isBusy ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!dragActive && !isBusy) {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                      e.currentTarget.style.borderColor = "#94a3b8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!dragActive && !isBusy) {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }
                  }}
                >
                  <UploadCloud size={40} className={`mb-3 ${dragActive ? "text-primary animate-bounce" : "text-muted"}`} />

                  {selectedFile ? (
                    <div className="w-100 px-3">
                      <p className="fw-bold text-dark m-0 text-truncate" style={{ fontSize: "0.9rem" }}>
                        {selectedFile.name}
                      </p>
                      <p className="text-muted small m-0">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                      {!isBusy && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSelection();
                          }}
                          className="btn btn-link btn-sm text-danger mt-2 p-0 border-0 fw-medium text-decoration-none"
                        >
                          {t('import.remove_file')}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="fw-semibold text-dark m-0" style={{ fontSize: "0.9rem" }}>
                        {t('import.drag_drop')}{' '}
                        <span className="text-primary text-decoration-underline">
                          {t('import.browse')}
                        </span>
                      </p>
                      <p className="text-muted small m-0 mt-1">
                        {t('import.supported_formats')}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer bg-light-subtle border-top border-light-subtle px-4 py-3 d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-light border px-4 py-2 small fw-medium"
                style={{ borderRadius: "8px", fontSize: "0.875rem" }}
                onClick={onClose}
                disabled={isBusy}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={!selectedFile || isBusy}
                className="btn btn-dark px-4 py-2 small fw-semibold d-inline-flex align-items-center gap-2"
                style={{ borderRadius: "8px", fontSize: "0.875rem", backgroundColor: "#1a1f36", borderColor: "#1a1f36" }}
              >
                {isBusy && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />}
                {isBusy ? t('import.importing') : t('import.import_data')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
