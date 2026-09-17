import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Select from '../../../components/Select/Select';
import type { SelectOption } from '../../../components/Select/Select';
import type { ComplaintPriority, ComplaintStatus, ComplaintListParams } from '../types/complaint.types';

interface ComplaintFiltersProps {
  filters: ComplaintListParams;
  onFilterChange: (updated: Partial<ComplaintListParams>) => void;
}

const ComplaintFilters = ({ filters, onFilterChange }: ComplaintFiltersProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState(filters.search ?? '');

  const statusOptions: SelectOption[] = useMemo(
    () => [
      { value: 'Open', label: t('status.open') },
      { value: 'In Progress', label: t('status.in_progress') },
      { value: 'Resolved', label: t('status.resolved') },
    ],
    [t]
  );

  const priorityOptions: SelectOption[] = useMemo(
    () => [
      { value: 'Low', label: t('priority.low') },
      { value: 'Medium', label: t('priority.medium') },
      { value: 'High', label: t('priority.high') },
    ],
    [t]
  );

  useEffect(() => {
    if (search === (filters.search ?? '')) return;
    const timer = setTimeout(() => {
      onFilterChange({ search: search || undefined, pageNumber: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters.search, onFilterChange]);

  const handleReset = () => {
    setSearch('');
    onFilterChange({ search: undefined, status: undefined, priority: undefined });
  };

  const hasActiveFilters = !!filters.search || !!filters.status || !!filters.priority;

  return (
    <div className="d-flex flex-md-row flex-column align-items-stretch align-items-md-center gap-2 w-100">

      {/* Search */}
      <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
        <input
          type="text"
          className="form-control shadow-none border-light-subtle"
          placeholder={t('complaints.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', borderRadius: '8px', fontSize: '0.875rem', height: '38px' }}
        />
      </div>

      {/* Status */}
      <div style={{ minWidth: '130px' }}>
        <Select
          name="status"
          options={statusOptions}
          placeholder={t('complaints.all_statuses')}
          value={filters.status ?? ''}
          onChange={(e) =>
            onFilterChange({
              status: (e.target.value as ComplaintStatus) || undefined,
              pageNumber: 1,
            })
          }
          className="shadow-none"
          style={{ height: '38px' }}
        />
      </div>

      {/* Priority */}
      <div style={{ minWidth: '130px' }}>
        <Select
          name="priority"
          options={priorityOptions}
          placeholder={t('complaints.all_priorities')}
          value={filters.priority ?? ''}
          onChange={(e) =>
            onFilterChange({
              priority: (e.target.value as ComplaintPriority) || undefined,
              pageNumber: 1,
            })
          }
          className="shadow-none"
          style={{ height: '38px' }}
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-1 px-3 fw-medium"
          onClick={handleReset}
          style={{ height: '38px', fontSize: '0.85rem', borderRadius: '8px' }}
        >
          <i className="bi bi-x-circle" />
          {t('complaints.clear_filters')}
        </button>
      )}

    </div>
  );
};

export default ComplaintFilters;