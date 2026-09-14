import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useMyResident from '../../residents/hooks/useMyResident';
import useVisitors from '../hooks/useVisitors';
import { useVisitorMutations } from '../hooks/useVisitorMutations';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import VisitorTable from '../components/VisitorTable';
import VisitorStatsRow from '../components/VisitorStatsRow';
import PreRegisterVisitorModal from '../components/PreRegisterVisitorModal';
import Select from '../../../components/Select/Select';
import Pagination from '../../../components/Pagination/Pagination';
import { useScrollLock } from '../../../hooks/useScrollLock';
import type { VisitorStatus } from '../types/visitor.types';
import { Plus } from 'lucide-react';

const VisitorLogPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? 'resident';
  const { isCurrentOccupant, loading: residentLoading } = useMyResident(role === 'resident');

  useEffect(() => {
    if (!residentLoading && role === 'resident' && !isCurrentOccupant) {
      navigate('/my-apartment', { replace: true });
    }
  }, [residentLoading, role, isCurrentOccupant, navigate]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  useScrollLock(addModalOpen);

  const {
    visitors,
    loading,
    statusFilter,
    searchQuery,
    pageNumber,
    totalPages,
    totalCount,
    setPageNumber,
    setStatusFilter,
    setSearchQuery,
    refetch,
  } = useVisitors({ userRole: role, pageSize: 10 });

  const { metrics, loading: metricsLoading, refetch: refetchMetrics } = useDashboardMetrics(
    role === 'admin' || role === 'security'
  );

  const handleRefresh = () => {
    refetch();
    if (role === 'admin' || role === 'security') {
      refetchMetrics();
    }
  };

  const { respond, cancel, checkIn, checkOut } = useVisitorMutations(handleRefresh);

  const handleSearchClear = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  return (
    <div className="container-fluid p-3 p-md-4">

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <h4 className="fw-bold mb-2 fs-4 fs-sm-3" style={{ color: '#1a1f36' }}>
            {role === 'admin' ? 'Visitor Logs' : role === 'security' ? 'Gate Visitor Logs' : 'My Visitors'}
          </h4>
          <p className="text-muted mb-0 small">
            {role === 'admin'
              ? 'View, search, and monitor all visitor activities across the society.'
              : role === 'security'
                ? 'Track active visitor entries, exits, and verify pre-registrations.'
                : 'Approve visitor entry requests and pre-register expected guests.'}
          </p>
        </div>

        {role === 'resident' && isCurrentOccupant && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-primary fw-medium d-inline-flex align-items-center gap-2 px-3 py-2 small shadow-sm"
              onClick={() => setAddModalOpen(true)}
              style={{ fontSize: '0.875rem', borderRadius: '8px' }}
            >
              <Plus size={18} /> Pre-register Visitor
            </button>
          </div>
        )}
      </div>

      {/* ── Stats Dashboard (Admin & Security) ── */}
      {(role === 'admin' || role === 'security') && (
        <div className="mb-4">
          <VisitorStatsRow metrics={metrics} loading={metricsLoading} />
        </div>
      )}


      {/* ── Table Container Card (Matching Resident Page Layout) ── */}
      <div className="card bg-white border border-light-subtle rounded-3 shadow-sm mt-4">
        {/* Filters Header Block */}
        <div className="card-header bg-white border-bottom border-light-subtle p-3">
          <div className="d-flex flex-md-row flex-column align-items-stretch align-items-md-center gap-2 w-100">
            {/* Search Input Box */}
            <div className="flex-grow-1" style={{ maxWidth: '550px' }}>
              <div
                className="d-flex align-items-center bg-white border rounded-2 px-3 text-secondary search-wrapper"
                style={{ height: '46px', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              >
                <i className="bi bi-search me-2 fs-6 text-muted" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  className="w-100 border-0 p-0 shadow-none bg-transparent text-dark"
                  placeholder="Search by visitor name or phone..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  style={{ fontSize: '0.875rem', outline: 'none' }}
                />
                {searchInput && (
                  <button
                    type="button"
                    className="btn btn-link p-0 text-secondary border-0 ms-2"
                    onClick={handleSearchClear}
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="bi bi-x-circle-fill text-muted" style={{ fontSize: '0.9rem' }} />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter Select Component */}
            <div style={{ minWidth: '160px' }}>
              <Select
                options={
                  role === 'resident'
                    ? [
                        { value: 'ALL', label: 'All Statuses' },
                        { value: 'Pending', label: 'Pending' },
                        { value: 'Approved', label: 'Approved' },
                        { value: 'Rejected', label: 'Rejected' },
                        { value: 'CheckedIn', label: 'Checked In' },
                        { value: 'CheckedOut', label: 'Checked Out' },
                        { value: 'Cancelled', label: 'Cancelled' },
                      ]
                    : [
                        { value: 'ALL', label: 'All Statuses' },
                        { value: 'CheckedOut', label: 'Checked Out' },
                        { value: 'Cancelled', label: 'Cancelled' },
                        { value: 'Rejected', label: 'Rejected' },
                      ]
                }
                placeholder="All Statuses"
                value={statusFilter}
                onChange={(e) => setStatusFilter((e.target.value || 'ALL') as VisitorStatus | 'ALL')}
                className="fw-medium text-secondary"
                style={{ height: '46px' }}
              />
            </div>

            {/* Clear Filters Button */}
            {(searchInput || statusFilter !== 'ALL') && (
              <div className="col-auto">
                <button
                  className="btn btn-outline-secondary border-light-subtle d-flex align-items-center justify-content-center px-3 w-100"
                  onClick={() => {
                    handleSearchClear();
                    setStatusFilter('ALL');
                  }}
                  style={{ height: '46px', fontSize: '0.875rem', borderRadius: '8px' }}
                >
                  <i className="bi bi-x-circle me-2" />
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic List Table Area */}
        <div className="table-responsive">
          <VisitorTable
            visitors={visitors}
            loading={loading}
            search={searchQuery}
            isResident={role === 'resident'}
            userRole={role}
            onApprove={async (id) => respond(id, 'Approve')}
            onReject={async (id) => respond(id, 'Reject')}
            onCancel={async (id) => cancel(id)}
            onCheckIn={async (id) => checkIn(id)}
            onCheckOut={async (id) => checkOut(id)}
          />
        </div>

        {/* Card Footer Section for Pagination */}
        {totalPages > 0 && (
          <div className="card-footer bg-white border-top border-light-subtle p-3 d-flex justify-content-end">
            <Pagination
              pagination={{
                pageNumber,
                pageSize: 10,
                totalCount,
                totalPages,
                hasPreviousPage: pageNumber > 1,
                hasNextPage: pageNumber < totalPages,
              }}
              onPageChange={setPageNumber}
            />
          </div>
        )}
      </div>

      {/* ── Pre-register Modal (For Residents) ── */}
      <PreRegisterVisitorModal
        show={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          setAddModalOpen(false);
          handleRefresh();
        }}
      />

    </div>
  );
};

export default VisitorLogPage;