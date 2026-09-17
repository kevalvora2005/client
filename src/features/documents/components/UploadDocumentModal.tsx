import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, FileText, FileSignature, FileImage } from "lucide-react";
import { DocModal } from "./DocModal";
import type { DocumentRequestItem } from "../types/documentRequest.types";
import { getDocTypeLabel } from "../utils/getDocTypeLabel";

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return FileText;
  if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) return FileImage;
  if (["doc", "docx"].includes(ext || "")) return FileSignature;
  return FileText;
};

interface Props {
  target: DocumentRequestItem | null;
  onClose: () => void;
  onSubmit: (requestId: number, file: File) => Promise<boolean>;
}

const UploadDocumentModal = ({ target, onClose, onSubmit }: Props) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target || !selectedFile) return;
    setUploading(true);
    const ok = await onSubmit(target.id, selectedFile);
    setUploading(false);
    if (ok) {
      setSelectedFile(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <DocModal open={!!target} onClose={handleClose} title={t("documents.upload_modal_title")} maxWidth="500px">
      <form onSubmit={handleSubmit}>
        <div className="modal-body p-3 p-sm-4 d-flex flex-column gap-3">
          <div className="bg-light rounded-3 p-3 border">
            <p className="small text-muted mb-1">{t("documents.fulfilling_request_for")}</p>
            <p className="fw-bold text-dark mb-0">{getDocTypeLabel(target?.documentType, t)}</p>
            {target?.requester && (
              <p className="small text-secondary mb-0 mt-1">
                {t("documents.requested_by_user", { name: target.requester.user.name })}
              </p>
            )}
          </div>
          <div>
            <label className="form-label fw-medium text-secondary small mb-1">
              {t("documents.select_document")} <span className="text-danger">*</span>
            </label>
            <div
              className="border rounded-3 p-4 text-center"
              style={{ borderStyle: "dashed", background: "#fafafa", cursor: "pointer", transition: "background 0.15s" }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fafafa")}
            >
              {selectedFile ? (
                <div className="d-flex align-items-center justify-content-center gap-2">
                  {(() => { const Icon = getFileIcon(selectedFile.name); return <Icon size={20} className="text-secondary" />; })()}
                  <span className="small fw-medium text-dark">{selectedFile.name}</span>
                  <span className="small text-muted">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <div>
                  <Upload size={24} className="text-muted mb-1" />
                  <p className="small text-muted mb-0">{t("documents.click_to_browse")}</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" className="d-none" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </div>
          </div>
        </div>
        <div className="modal-footer border-top border-light-subtle px-3 px-sm-4 py-3 gap-2 d-grid d-sm-flex">
          <button type="button" className="btn btn-outline-secondary rounded-2 px-3 small" onClick={handleClose} disabled={uploading}>
            {t("common.cancel")}
          </button>
          <button type="submit" className="btn btn-success rounded-2 px-3 fw-semibold small d-inline-flex align-items-center gap-1.5"
            disabled={uploading || !selectedFile}>
            {uploading ? <span className="spinner-border spinner-border-sm" /> : <Upload size={16} />} {t("documents.upload_and_fulfill")}
          </button>
        </div>
      </form>
    </DocModal>
  );
};

export default UploadDocumentModal;
