import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  maxWidth: string;
  children: React.ReactNode;
}

const DocModal = ({ open, onClose, title, maxWidth, children }: Props) => {
  const { t } = useTranslation();

  if (!open) return null;
  return (
    <div className="modal d-block bg-dark bg-opacity-50" style={{ backdropFilter: "blur(4px)", zIndex: 1055 }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 rounded-3 shadow-lg bg-white overflow-hidden position-relative">
          <button
            type="button"
            className="btn position-absolute d-flex align-items-center justify-content-center p-0"
            style={{ top: 16, right: 16, width: 28, height: 28, border: "1px solid #e9ecef", background: "#fff", borderRadius: "6px", zIndex: 1 }}
            onClick={onClose}
            aria-label={t("common.close")}
          >
            <X size={15} />
          </button>
          <div className="modal-header border-bottom border-light-subtle px-3 px-sm-4 pt-4 pb-3">
            <h5 className="modal-title fw-bold text-dark fs-6 mb-0">{title}</h5>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export { DocModal };
