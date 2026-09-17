import { useTranslation } from "react-i18next";
import { useScrollLock } from "../../../hooks/useScrollLock";
import FamilyMemberForm from "./FamilyMemberForm";
import type { FamilyMember, CreateFamilyMemberPayload, UpdateFamilyMemberPayload } from "../types/familyMember.types";

interface FamilyMemberFormModalProps {
  show: boolean;
  mode: "add" | "edit";
  member?: FamilyMember | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateFamilyMemberPayload | UpdateFamilyMemberPayload) => Promise<boolean>;
}

const FamilyMemberFormModal = ({ show, mode, member, loading, onClose, onSubmit }: FamilyMemberFormModalProps) => {
  const { t } = useTranslation();
  const isEdit = mode === "edit";
  useScrollLock(show);

  if (!show) return null;

  return (
    <div
      className="modal d-block bg-dark bg-opacity-50"
      style={{ backdropFilter: "blur(4px)" }}
    >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="modal-content border-0 rounded-3 shadow-lg bg-white">

          {/* ── Header ── */}
          <div className="modal-header border-bottom border-light-subtle px-3 px-sm-4 pt-4 pb-3 align-items-start position-relative">
            <div>
              <h5 className="modal-title fw-bold fs-6" style={{ color: "#1a1f36" }}>
                {isEdit ? t('myApartment.edit_family_title', { name: member?.name }) : t('myApartment.add_family_title')}
              </h5>
              <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                {isEdit ? t('myApartment.edit_family_desc') : t('myApartment.add_family_desc')}
              </p>
            </div>
            <button
              type="button"
              className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
              style={{ top: 22, right: 22, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem', borderRadius: '6px' }}
              onClick={onClose}
              disabled={loading}
              aria-label={t('common.close')}
            >
              <i className="bi bi-x" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="modal-body p-3 p-sm-4">
            <FamilyMemberForm
              member={isEdit ? member : null}
              loading={loading}
              onSubmit={onSubmit}
              onCancel={onClose}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default FamilyMemberFormModal;
