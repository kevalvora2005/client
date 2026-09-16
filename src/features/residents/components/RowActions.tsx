import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ResidentDetail } from "../types/resident.types";

interface RowActionsProps {
  resident: ResidentDetail;
  onView: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
}

const RowActions = ({ resident, onView, onEdit, onDeactivate }: RowActionsProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".dropdown-menu")
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setMenuStyle(
        spaceBelow < 160
          ? { bottom: window.innerHeight - rect.top, left: rect.right - 148, zIndex: 9999, minWidth: "148px" }
          : { top: rect.bottom, left: rect.right - 148, zIndex: 9999, minWidth: "148px" }
      );
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        onClick={handleToggle}
        className="btn p-0 border-0 text-secondary bg-transparent d-flex align-items-center justify-content-center"
        style={{ width: "28px", height: "28px" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#212529")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6c757d")}
      >
        <i className="bi bi-three-dots-vertical fs-4" />
      </button>

      {isOpen && (
        <ul
          className="dropdown-menu shadow-sm border border-light-subtle rounded-3 p-1 show position-fixed"
          style={menuStyle}
        >
          <li>
            <button
              type="button"
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small"
              onClick={() => { onView(); setIsOpen(false); }}
              style={{ fontSize: "0.85rem" }}
            >
              <i className="bi bi-eye text-muted" /> {t("common.details")}
            </button>
          </li>
          <li>
            <button
              type="button"
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small"
              onClick={() => { onEdit(); setIsOpen(false); }}
              disabled={!resident.isActive || !resident.isOwner}
              title={!resident.isOwner ? t("residents.tenant_cannot_edit") : undefined}
              style={{ fontSize: "0.85rem" }}
            >
              <i className="bi bi-pencil text-muted" /> {t("common.edit")}
            </button>
          </li>
          <li>
            <button
              type="button"
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-danger"
              onClick={() => { onDeactivate(); setIsOpen(false); }}
              disabled={!resident.isActive || !resident.isOwner}
              title={!resident.isOwner ? t("residents.tenant_cannot_deactivate") : undefined}
              style={{ fontSize: "0.85rem" }}
            >
              <i className="bi bi-person-x" /> {t("residents.deactivate")}
            </button>
          </li>
        </ul>
      )}
    </>
  );
};

export default RowActions;