import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentlyInside } from '../hooks/useCurrentlyInside';
import { useVisitorMutations } from '../hooks/useVisitorMutations';
import AppTable, { type TableColumn } from '../../../components/AppTable/AppTable';
import Pagination from '../../../components/Pagination/Pagination';
import { getAvatarColor, getInitials } from '../../residents/components/residentTableHelpers';
import { formatDate } from '../../../utils/formatDate';
import type { Visitor } from '../types/visitor.types';

const CheckOutPage = () => {
  const { t } = useTranslation();
  const { visitors, loading, refetch } = useCurrentlyInside();
  const { checkOut, loading: mutationLoading } = useVisitorMutations(refetch);
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const filteredVisitors = visitors.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      v.name.toLowerCase().includes(q) ||
      v.phone.toLowerCase().includes(q) ||
      (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredVisitors.length / pageSize) || 1;
  const paginatedVisitors = filteredVisitors.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  const columns: TableColumn<Visitor>[] = useMemo(
    () => [
      {
        key: 'name',
        label: t('visitors.col_visitor_details'),
        width: '25%',
        align: 'start',
        headerAlign: 'start',
        headerPaddingLeft: '1.25rem',
        render: (v) => {
          const { bg, color } = getAvatarColor(v.name);
          return (
            <div className="d-flex align-items-center gap-3 py-1.5 ps-2">
              {v.photoUrl ? (
                <img
                  src={v.photoUrl}
                  alt={v.name}
                  className="rounded-circle flex-shrink-0 object-fit-cover border border-white shadow-xs"
                  style={{ width: '40px', height: '40px' }}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold shadow-xs border border-white"
                  style={{
                    background: bg,
                    color: color,
                    width: '40px',
                    height: '40px',
                    fontSize: '0.85rem',
                  }}
                >
                  {getInitials(v.name)}
                </div>  
              )}
              <div className="min-w-0">
                <p className="fw-semibold text-dark m-0 text-truncate" style={{ fontSize: '0.9rem', lineHeight: '1.3' }}>
                  {v.name}
                </p>
                <p className="m-0 text-muted small d-flex align-items-center gap-1 mt-0.5" style={{ fontSize: '0.78rem' }}>
                  <i className="bi bi-telephone text-secondary" style={{ fontSize: '0.75rem' }} />
                  {v.phone}
                </p>
                {v.vehicleNumber && (
                  <span className="badge bg-light text-secondary border border-light-subtle mt-1 font-monospace" style={{ fontSize: '0.68rem', fontWeight: 500 }}>
                    <i className="bi bi-car-front me-1" />
                    {v.vehicleNumber}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: 'purpose',
        label: t('visitors.col_purpose'),
        width: '25%',
        align: 'center',
        headerAlign: 'center',
        render: (v) => (
          <p className="m-0 text-secondary small py-1 text-center" style={{ fontSize: '0.84rem', lineHeight: '1.45', wordBreak: 'break-word' }}>
            {v.purpose || '—'}
          </p>
        ),
      },
      {
        key: 'checkedInAt',
        label: t('visitors.col_checked_in'),
        width: '25%',
        align: 'center',
        headerAlign: 'center',
        render: (v) => (
          <span className="text-dark small fw-medium" style={{ fontSize: '0.825rem' }}>
            {v.checkedInAt ? formatDate(v.checkedInAt) : '—'}
          </span>
        ),
      },
      {
        key: 'action',
        label: t('common.actions'),
        width: '25%',
        align: 'center',
        headerAlign: 'center',
        render: (v) => (
          <button
            type="button"
            className="btn btn-dark btn-sm fw-semibold px-3 py-1.5 rounded-2 d-inline-flex align-items-center gap-1.5 shadow-xs"
            onClick={() => checkOut(v.id)}
            disabled={mutationLoading}
            style={{ fontSize: '0.8rem' }}
          >
            <i className="bi bi-box-arrow-right" /> {t('visitors.check_out_btn')}
          </button>
        ),
      },
    ],
    [t, mutationLoading, checkOut]
  );

  return (
    <div className="container-fluid p-3 p-md-4">

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <h4 className="fw-bold mb-2 fs-4 fs-sm-3" style={{ color: '#1a1f36' }}>
            {t('visitors.checkout_page_title')}
          </h4>
          <p className="text-muted mb-0 small">
            {t('visitors.checkout_page_desc')}
          </p>
        </div>
      </div>

      {/* ── Table Card Container ── */}
      <div className="card bg-white border border-light-subtle rounded-3 shadow-sm mt-4">
        {/* Card Header with Filter Controls */}
        <div className="card-header bg-white border-bottom border-light-subtle p-3">
          <div className="d-flex flex-md-row flex-column align-items-stretch align-items-md-center gap-2 w-100">
            <div className="flex-grow-1" style={{ maxWidth: '550px' }}>
              <div
                className="d-flex align-items-center bg-white border rounded-2 px-3 text-secondary search-wrapper"
                style={{ height: '46px', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              >
                <i className="bi bi-search me-2 fs-6 text-muted" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  className="w-100 border-0 p-0 shadow-none bg-transparent text-dark"
                  placeholder={t('visitors.checkout_search_placeholder')}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPageNumber(1);
                  }}
                  style={{ fontSize: '0.875rem', outline: 'none' }}
                />
                {search && (
                  <button
                    type="button"
                    className="btn btn-link p-0 text-secondary border-0 ms-2"
                    onClick={() => {
                      setSearch('');
                      setPageNumber(1);
                    }}
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="bi bi-x-circle-fill text-muted" style={{ fontSize: '0.9rem' }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="table-responsive">
          <AppTable
            columns={columns}
            data={paginatedVisitors}
            loading={loading}
            rowKey={(v) => v.id}
            minWidth="800px"
            emptyTitle={t('visitors.no_visitors_inside_title')}
            emptySubtitle={search ? t('visitors.no_inside_match') : t('visitors.everyone_checked_out')}
            emptyIcon="bi-door-open"
          />
        </div>

        {/* Card Footer with Pagination */}
        {filteredVisitors.length > 0 && (
          <div className="card-footer bg-white border-top border-light-subtle p-3 d-flex justify-content-end">
            <Pagination
              pagination={{
                pageNumber,
                pageSize,
                totalCount: filteredVisitors.length,
                totalPages,
                hasPreviousPage: pageNumber > 1,
                hasNextPage: pageNumber < totalPages,
              }}
              onPageChange={setPageNumber}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default CheckOutPage;