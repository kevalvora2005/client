import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Select from '../../../components/Select/Select';
import type { SelectOption } from '../../../components/Select/Select';
import type { NoticeCategory, NoticeListParams } from '../types/notice.types';

interface NoticeFiltersProps {
  filters: NoticeListParams;
  onFilterChange: (updated: Partial<NoticeListParams>) => void;
}

const NoticeFilters = ({ filters, onFilterChange }: NoticeFiltersProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState(filters.search ?? '');

  const categoryOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: t('notices.all_categories') },
      { value: 'General', label: t('notices.category_general') },
      { value: 'Maintenance', label: t('notices.category_maintenance') },
      { value: 'Emergency', label: t('notices.category_emergency') },
      { value: 'Event', label: t('notices.category_event') },
    ],
    [t]
  );

  const pinnedOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: t('notices.all_notices') },
      { value: 'true', label: t('notices.pinned_only') },
      { value: 'false', label: t('notices.unpinned_only') },
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
    onFilterChange({ search: undefined, category: undefined, isPinned: undefined });
  };

  const hasActiveFilters = !!filters.search || !!filters.category || filters.isPinned !== undefined;

  return (
    <div className="row g-3">
      {/* Search */}
      <div className="col-12 col-md-6 col-lg-4">
        <div className="position-relative">
          <input
            type="text"
            className="form-control shadow-none border-light-subtle ps-5"
            placeholder={t('notices.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: '8px', fontSize: '0.875rem', height: '38px' }}
          />
          <i
            className="bi bi-search position-absolute text-muted"
            style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Category */}
      <div className="col-12 col-md-6 col-lg-4">
        <Select
          name="category"
          options={categoryOptions}
          placeholder={t('notices.all_categories')}
          value={filters.category ?? ''}
          onChange={(e) =>
            onFilterChange({
              category: (e.target.value as NoticeCategory) || undefined,
              pageNumber: 1,
            })
          }
          className="shadow-none w-100"
          style={{ height: '38px', borderRadius: '8px', fontSize: '0.875rem' }}
        />
      </div>

      {/* Pinned */}
      <div className="col-12 col-md-6 col-lg-4">
        <div className="d-flex gap-2">
          <div className="flex-grow-1">
            <Select
              name="isPinned"
              options={pinnedOptions}
              placeholder={t('notices.all_notices')}
              value={filters.isPinned === undefined ? '' : String(filters.isPinned)}
              onChange={(e) =>
                onFilterChange({
                  isPinned: e.target.value === '' ? undefined : e.target.value === 'true',
                  pageNumber: 1,
                })
              }
              className="shadow-none w-100"
              style={{ height: '38px', borderRadius: '8px', fontSize: '0.875rem' }}
            />
          </div>
          {hasActiveFilters && (
            <button
              className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-1 px-3 fw-medium flex-shrink-0"
              onClick={handleReset}
              style={{ height: '38px', fontSize: '0.85rem', borderRadius: '8px' }}
              title={t('notices.clear_filters')}
            >
              <i className="bi bi-x-circle" />
              {t('common.clear')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeFilters;