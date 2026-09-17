import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useComplaintsPage } from '../hooks/useComplaintsPage';
import { useComplaintMutations } from '../hooks/useComplaintMutations';
import ComplaintFilters from '../components/ComplaintFilters';
import ComplaintList from '../components/ComplaintList';
import ComplaintForm from '../components/ComplaintForm';
import { useScrollLock } from '../../../hooks/useScrollLock';
import useAuth from '../../../hooks/useAuth';
import useMyResident from '../../residents/hooks/useMyResident';
import type { Complaint, ComplaintStatus } from '../types/complaint.types';

type ComplaintScope = 'self' | 'tenant';

const ComplaintsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { isCurrentOccupant, isOwner } = useMyResident(!isAdmin);

  // Owners can toggle between their own complaints and the complaints their
  // tenants have raised — regardless of whether they currently occupy the unit.
  const showScopeToggle = !isAdmin && isOwner;
  const [scope, setScope] = useState<ComplaintScope>('self');

  // Owners: Self tab always shows their own complaints, Tenant tab shows the
  // apartment's tenant complaints. Non-owner tenants see their own list only
  // when currently occupying.
  const ownOnly = !isAdmin && (showScopeToggle ? scope === 'self' : isCurrentOccupant);

  const {
    complaints,
    loading,
    filters,
    updateFilters,
    changePage,
    pagination,
    refetch,
  } = useComplaintsPage(isAdmin, ownOnly);

  // On the tenant tab, exclude the owner's own complaints.
  const complaintItems = (complaints?.items ?? []).filter((c) =>
    showScopeToggle && scope === 'tenant' ? c.resident?.userId !== user?.id : true
  );

  const {
    createComplaint,
    updateStatus,
    deleteComplaint,
    loading: mutationLoading,
  } = useComplaintMutations(refetch);

  const [addModalOpen, setAddModalOpen] = useState(false);

  useScrollLock(addModalOpen);

  const handleAdd = async (formData: FormData): Promise<boolean> => {
    const success = await createComplaint(formData);
    if (success) setAddModalOpen(false);
    return success;
  };

  const handleUpdateStatus = async (complaint: Complaint, status: ComplaintStatus) => {
    await updateStatus(complaint.id, { status });
  };

  const handleDeleteComplaint = async (complaintId: number) => {
    await deleteComplaint(complaintId);
  };

  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);

  return (
    <div className="container-fluid p-3 p-md-4">

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <h4 className="fw-bold mb-2 fs-4 fs-sm-3" style={{ color: '#1a1f36' }}>
            {t('complaints.title')}
          </h4>
          <p className="text-muted mb-0 small">
            {t('complaints.subtitle')}
          </p>
        </div>
        {!isAdmin && isCurrentOccupant && !(showScopeToggle && scope === 'tenant') && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              className="btn btn-dark fw-medium d-inline-flex align-items-center gap-2 px-3 py-2"
              onClick={openAddModal}
              style={{ fontSize: '0.875rem', borderRadius: '8px', backgroundColor: '#1a1f36', borderColor: '#1a1f36' }}
            >
              <i className="bi bi-plus-lg" /> {t('complaints.raise_complaint')}
            </button>
          </div>
        )}
      </div>

      {/* ── Self / Tenant toggle (owners only) ── */}
      {showScopeToggle && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {([
            { key: 'self', label: t('complaints.scope_self') },
            { key: 'tenant', label: t('complaints.scope_tenant') },
          ] as { key: ComplaintScope; label: string }[]).map(({ key, label }) => {
            const active = scope === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setScope(key)}
                className="btn btn-sm fw-semibold px-3 py-2"
                style={{
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  backgroundColor: active ? '#1a1f36' : '#fff',
                  color: active ? '#fff' : '#4b5563',
                  border: `1px solid ${active ? '#1a1f36' : '#e5e7eb'}`,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="mb-3">
        <ComplaintFilters
          filters={filters}
          onFilterChange={updateFilters}
        />
      </div>

      {/* ── Complaint Table ── */}
      <div className="mb-3">
        <ComplaintList
          complaints={complaintItems}
          loading={loading}
          onUpdateStatus={handleUpdateStatus}
          onDeleteComplaint={handleDeleteComplaint}
          isAdmin={isAdmin}
          currentUserId={user?.id}
          disableChat={showScopeToggle && scope === 'tenant'}
          hideChatColumn={showScopeToggle && scope === 'tenant'}
          showResidentName={showScopeToggle && scope === 'tenant'}
          pagination={pagination}
          onPageChange={changePage}
          onPageSizeChange={(size) => updateFilters({ pageSize: size })}
        />
      </div>

      {/* ── Add Complaint Modal (Resident only) ── */}
      {addModalOpen && (
        <div className="modal d-block bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-3 shadow-lg bg-white">

              <div className="modal-header border-bottom border-light-subtle px-3 px-sm-4 pt-4 pb-3 align-items-start position-relative">
                <div>
                  <h5 className="modal-title fw-bold fs-6" style={{ color: '#1a1f36' }}>
                    {t('complaints.modal_title')}
                  </h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                    {t('complaints.modal_desc')}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn position-absolute d-flex align-items-center justify-content-center p-0 text-secondary"
                  style={{ top: 22, right: 22, width: 28, height: 28, border: '1px solid #e9ecef', background: '#fff', fontSize: '1.1rem', borderRadius: '6px' }}
                  onClick={closeAddModal}
                  disabled={mutationLoading}
                  aria-label={t('common.close')}
                >
                  <i className="bi bi-x" />
                </button>
              </div>

              <div className="modal-body p-3 p-sm-4">
                <ComplaintForm
                  loading={mutationLoading}
                  onSubmit={handleAdd}
                  onCancel={closeAddModal}
                />
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ComplaintsPage;
