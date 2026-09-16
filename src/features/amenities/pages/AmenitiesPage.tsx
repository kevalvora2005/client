import { useState, useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../../hooks/useAuth';
import { useScrollLock } from '../../../hooks/useScrollLock';
import { useAmenities } from '../hooks/useAmenities';
import { useAmenityMutations } from '../hooks/useAmenityMutations';
import AmenityCard from '../components/AmenityCard';
import AmenityFormModal from '../components/AmenityFormModal';
import Select from '../../../components/Select/Select';
import type { Amenity, CreateAmenityPayload, UpdateAmenityPayload } from '../types/amenity.types';

const AmenitiesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { amenities, loading, refetch } = useAmenities();
  const { create, update, loading: mutationLoading } = useAmenityMutations(refetch);

  const facilityTypeOptions = useMemo(() => [
    { value: '', label: t('amenities.all_facility_types') },
    { value: 'EXCLUSIVE', label: t('amenities.exclusive') },
    { value: 'SHARED_CAPACITY', label: t('amenities.shared') },
  ], [t]);

  const [formOpen, setFormOpen] = useState(false);
  const [editAmenity, setEditAmenity] = useState<Amenity | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [facilityType, setFacilityType] = useState('');

  // 500ms debounce matching ResidentFilters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useScrollLock(formOpen);

  const openAdd = () => { setEditAmenity(null); setFormOpen(true); };
  const openEdit = (a: Amenity) => { setEditAmenity(a); setFormOpen(true); };
  const closeForm = () => setFormOpen(false);

  const handleSubmit = async (payload: CreateAmenityPayload | UpdateAmenityPayload | FormData): Promise<boolean> => {
    const success = editAmenity
      ? await update(editAmenity.id, payload as UpdateAmenityPayload | FormData)
      : await create(payload as CreateAmenityPayload | FormData);
    if (success) closeForm();
    return success;
  };

  const filteredAmenities = useMemo(() => {
    return amenities.filter((a) => {
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const matchName = a.name.toLowerCase().includes(query);
        if (!matchName) return false;
      }
      if (facilityType === 'EXCLUSIVE') {
        const isShared = a.bookingType === 'SHARED_CAPACITY' || a.isSharedCapacity;
        if (isShared) return false;
      } else if (facilityType === 'SHARED_CAPACITY') {
        const isShared = a.bookingType === 'SHARED_CAPACITY' || a.isSharedCapacity;
        if (!isShared) return false;
      }
      return true;
    });
  }, [amenities, debouncedSearch, facilityType]);

  const hasActiveFilters = Boolean(search || facilityType);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setFacilityType('');
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <h4 className="fw-bold mb-2 fs-4" style={{ color: '#1a1f36' }}>{t('amenities.title')}</h4>
          <p className="text-muted mb-0 small">
            {isAdmin ? t('amenities.admin_subtitle') : t('amenities.resident_subtitle')}
          </p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-dark fw-medium d-inline-flex align-items-center gap-2 px-3 py-2"
            onClick={openAdd}
            style={{ fontSize: '0.875rem', borderRadius: '8px', backgroundColor: '#1a1f36', borderColor: '#1a1f36' }}
          >
            <i className="bi bi-plus-lg" /> {t('amenities.add_amenity')}
          </button>
        )}
      </div>

      <div className="d-flex flex-md-row flex-column align-items-stretch align-items-md-center gap-2 w-100 mb-4">
        <div className="flex-grow-1" style={{ maxWidth: '550px' }}>
          <div
            className="d-flex align-items-center bg-white border rounded-2 px-3 text-secondary search-wrapper"
            style={{ height: '46px', transition: 'border-color 0.15s, box-shadow 0.15s' }}
          >
            <i className="bi bi-search me-2 fs-6 text-muted" style={{ flexShrink: 0 }} />
            <input
              type="text"
              className="w-100 border-0 p-0 shadow-none bg-transparent text-dark"
              placeholder={t('amenities.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: '0.875rem', outline: 'none' }}
            />
            {search && (
              <button
                type="button"
                className="btn btn-link p-0 text-muted ms-1"
                onClick={() => {
                  setSearch('');
                  setDebouncedSearch('');
                }}
              >
                <i className="bi bi-x fs-5" />
              </button>
            )}
          </div>
        </div>

        <div style={{ minWidth: '170px' }}>
          <Select
            options={facilityTypeOptions}
            placeholder={t('amenities.all_facility_types')}
            value={facilityType}
            onChange={(e) => setFacilityType(e.target.value)}
            className="fw-medium text-secondary"
            style={{ height: '46px' }}
          />
        </div>

        {hasActiveFilters && (
          <div className="col-auto">
            <button
              type="button"
              className="btn btn-outline-secondary border-light-subtle d-flex align-items-center justify-content-center px-3 w-100"
              onClick={handleResetFilters}
              style={{ height: '46px', fontSize: '0.875rem' }}
            >
              <i className="bi bi-x-circle me-2" />
              {t('common.clear')}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : filteredAmenities.length === 0 ? (
        <div className="text-center text-muted py-5 card border-0 shadow-sm rounded-3 p-5">
          <div className="d-flex justify-content-center">
            <Sparkles size={48} className="text-secondary mb-3 opacity-50" />
          </div>
          <h6 className="fw-semibold text-dark mb-1">{t('amenities.no_amenities_found')}</h6>
          <p className="small text-muted mb-3">
            {hasActiveFilters
              ? t('amenities.no_amenities_matching')
              : t('amenities.no_amenities_registered')}
          </p>
          {hasActiveFilters && (
            <div>
              <button
                type="button"
                className="btn btn-sm btn-dark px-3 py-1.5 fw-medium"
                onClick={handleResetFilters}
                style={{ borderRadius: '8px', fontSize: '0.82rem' }}
              >
                {t('amenities.reset_filters')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="row g-3">
          {filteredAmenities.map((a) => (
            <div key={a.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <AmenityCard amenity={a} isAdmin={isAdmin} onEdit={openEdit} search={debouncedSearch} />
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <AmenityFormModal amenity={editAmenity} loading={mutationLoading} onSubmit={handleSubmit} onCancel={closeForm} />
      )}
    </div>
  );
};

export default AmenitiesPage;
