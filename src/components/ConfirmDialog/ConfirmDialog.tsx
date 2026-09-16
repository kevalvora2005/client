import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useScrollLock } from "../../hooks/useScrollLock";

type ConfirmVariant = "danger" | "warning" | "info" | "success" | "dark";

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_CONFIG = {
  danger: {
    icon: "bi-trash3",
    iconBg: "#fef2f2",
    iconColor: "#dc2626",
    btnClass: "btn-danger",
  },
  warning: {
    icon: "bi-exclamation-triangle",
    iconBg: "#fffbeb",
    iconColor: "#d97706",
    btnClass: "btn-warning",
  },
  info: {
    icon: "bi-info-circle",
    iconBg: "#eff6ff",
    iconColor: "#2563eb",
    btnClass: "btn-primary",
  },
  success: {
    icon: "bi-check-circle-fill",
    iconBg: "#dcfce7",
    iconColor: "#15803d",
    btnClass: "btn-success",
  },
  dark: {
    icon: "bi-shield-check",
    iconBg: "#f1f5f9",
    iconColor: "#1e293b",
    btnClass: "btn-dark",
  },
};

const ConfirmDialog = ({
  show,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();
  const config = VARIANT_CONFIG[variant];

  useScrollLock(show);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  if (!show) return null;

  const resolvedTitle = t(title);
  const resolvedMessage = t(message);
  const effectiveConfirm = confirmLabel ? t(confirmLabel) : t('common.confirm');
  const effectiveCancel = cancelLabel ? t(cancelLabel) : t('common.cancel');

  return createPortal(
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-1"
      style={{ background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', zIndex: 1070 }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3 p-4 position-relative d-flex flex-column align-items-center text-center"
        style={{ width: '100%', maxWidth: '380px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
          style={{ top: 22, right: 22, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem' }}
          onClick={onCancel}
          aria-label={t('common.close')}
        >
          <i className="bi bi-x" />
        </button>

        {/* Icon */}
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mb-3 flex-shrink-0"
          style={{ width: 52, height: 52, fontSize: '1.4rem', background: config.iconBg }}
        >
          <i className={`bi ${config.icon}`} style={{ color: config.iconColor }} />
        </div>

        {/* Text */}
        <h6 className="fw-bold mb-1" style={{ color: '#1a1f36' }}>{resolvedTitle}</h6>
        <p className="text-muted mb-4" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{resolvedMessage}</p>

        {/* Actions */}
        <div className="d-flex gap-2 w-100">
          <button className="btn btn-outline-secondary flex-fill" onClick={onCancel} disabled={loading}>
            {effectiveCancel}
          </button>
          <button className={`btn ${config.btnClass} flex-fill text-white`} onClick={onConfirm} disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
              effectiveConfirm
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;