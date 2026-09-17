import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { useFamilyMembers } from "../hooks/useFamilyMembers";
import useMyResident from "../../residents/hooks/useMyResident";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import type { FamilyMember, CreateFamilyMemberPayload, UpdateFamilyMemberPayload } from "../types/familyMember.types";
import FamilyMemberCard from "../components/FamilyMemberCard";
import FamilyMemberFormModal from "../components/FamilyMemberFormModal";

interface FamilyMembersSectionProps {
  residentId: number;
  readOnly?: boolean;
  tenantResidentId?: number | null;
  onTenantChange?: (tenantId: number | null) => void;
}

const FamilyMembersSection = ({ residentId, readOnly = false, tenantResidentId = null, onTenantChange }: FamilyMembersSectionProps) => {
  const { t } = useTranslation();
  const { isOwner, isCurrentOccupant } = useMyResident(!readOnly);
  const [viewingTenantId, setViewingTenantId] = useState<number | null>(tenantResidentId);
  const targetResidentId = viewingTenantId ?? residentId;
  const isViewingOwn = viewingTenantId === null;
  
  const { familyMembers, loading, addFamilyMember, editFamilyMember, removeFamilyMember } = useFamilyMembers(targetResidentId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);
  const [mutationLoading, setMutationLoading] = useState(false);

  const handleAdd = async (payload: CreateFamilyMemberPayload | UpdateFamilyMemberPayload): Promise<boolean> => {
    setMutationLoading(true);
    const success = await addFamilyMember(payload as CreateFamilyMemberPayload);
    setMutationLoading(false);
    if (success) { setModalOpen(false); setEditingMember(null); }
    return success;
  };

  const handleEdit = async (payload: CreateFamilyMemberPayload | UpdateFamilyMemberPayload): Promise<boolean> => {
    if (!editingMember) return false;
    setMutationLoading(true);
    const success = await editFamilyMember(editingMember.id, payload as UpdateFamilyMemberPayload);
    setMutationLoading(false);
    if (success) { setModalOpen(false); setEditingMember(null); }
    return success;
  };

  const handleDelete = async (): Promise<void> => {
    if (!deletingMember) return;
    setMutationLoading(true);
    await removeFamilyMember(deletingMember.id);
    setMutationLoading(false);
    setDeletingMember(null);
  };

  const openAddModal = () => {
    setEditingMember(null);
    setModalOpen(true);
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMember(null);
  };

  const handleTenantChange = (tenantId: number | null) => {
    setViewingTenantId(tenantId);
    onTenantChange?.(tenantId);
  };

  // Only show tenant selector if owner and there are tenants to view
  const showTenantSelector = isOwner && !readOnly && tenantResidentId;

  return (
    <>
      <div className="card bg-white border border-light-subtle rounded-3 shadow-sm mt-3">
        <div className="card-header bg-white border-bottom border-light-subtle px-3 px-sm-4 py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3">
            <h6 className="fw-bold mb-0 text-nowrap d-flex align-items-center gap-2" style={{ color: '#1a1f36' }}>
              <Users size={18} className="text-dark" /> {t('myApartment.family_members')}
            </h6>
            {showTenantSelector && (
              <select
                className="form-select form-select-sm"
                style={{ minWidth: '160px', fontSize: '0.85rem' }}
                value={viewingTenantId ?? ''}
                onChange={(e) => handleTenantChange(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">{t('myApartment.your_family_members')}</option>
                {tenantResidentId && (
                  <option value={tenantResidentId}>{t('myApartment.tenant_family_members')}</option>
                )}
              </select>
            )}
          </div>
          {!readOnly && isViewingOwn && isCurrentOccupant && (
            <button
              className="btn btn-dark btn-sm d-flex align-items-center gap-1"
              onClick={openAddModal}
              style={{ fontSize: "0.875rem", borderRadius: "8px", backgroundColor: "#1a1f36", borderColor: "#1a1f36" }}
            >
              <i className="bi bi-plus-lg" /> {t('myApartment.add_member_btn')}
            </button>
          )}
        </div>

        <div className="card-body px-3 px-sm-4 py-3">

          {/* ── List ── */}
          {loading ? (
            <div className="d-flex flex-column gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
              ))}
            </div>
          ) : familyMembers.length === 0 ? (
            <div className="text-center py-5">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '64px', height: '64px', backgroundColor: '#f3f4f6' }}
              >
                <Users size={28} style={{ color: '#9ca3af' }} />
              </div>
              <p className="fw-semibold mb-1" style={{ fontSize: '0.95rem', color: '#4b5563' }}>{t('myApartment.no_family_found')}</p>
              <p className="text-secondary small mb-0" style={{ fontSize: '0.8rem' }}>
                {isViewingOwn ? t('myApartment.no_family_added') : t('myApartment.no_tenant_family_added')}
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {familyMembers.map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  onEdit={openEditModal}
                  onDelete={(m) => setDeletingMember(m)}
                  readOnly={readOnly || !isViewingOwn}
                />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <FamilyMemberFormModal
        show={modalOpen}
        mode={editingMember ? "edit" : "add"}
        member={editingMember}
        loading={mutationLoading}
        onClose={closeModal}
        onSubmit={editingMember ? handleEdit : handleAdd}
      />

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        show={!!deletingMember}
        title={t('myApartment.remove_family_title')}
        message={deletingMember ? t('myApartment.remove_family_msg', { name: deletingMember.name }) : ""}
        confirmLabel={t('myApartment.yes_remove')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={mutationLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingMember(null)}
      />
    </>
  );
};

export default FamilyMembersSection;
