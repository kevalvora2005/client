import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, Users, Camera, Edit2, Eye, Lock } from 'lucide-react';
import type { Amenity } from '../types/amenity.types';
import { highlightMatch } from '../../../utils/highlight';
import { formatCurrency } from '../../../utils/formatCurrency';

interface AmenityCardProps {
  amenity: Amenity;
  isAdmin: boolean;
  onEdit: (amenity: Amenity) => void;
  search?: string;
}

const AmenityCard = ({ amenity, isAdmin, onEdit, search }: AmenityCardProps) => {
  const { t, i18n } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const images: string[] = Array.isArray(amenity.images) ? amenity.images : [];
  const coverImage = !imageError && images.length > 0 ? images[0] : null;
  const isShared = amenity.bookingType === 'SHARED_CAPACITY' || amenity.isSharedCapacity;
  const isFree = isShared || !amenity.price || amenity.price === 0;

  return (
    <div className="card border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '12px' }}>
      {/* ── Image Banner ── */}
      <div className="position-relative w-100" style={{ height: '165px', backgroundColor: '#f1f5f9' }}>
        {coverImage ? (
          <img
            src={coverImage}
            alt={amenity.name}
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mb-1"
              style={{ width: '48px', height: '48px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}
            >
              <Sparkles size={24} className="text-secondary opacity-75" />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('amenities.no_photo')}</span>
          </div>
        )}

        {/* Facility Type Badge (Top Left) */}
        <span
          className="badge position-absolute fw-semibold d-flex align-items-center gap-1"
          style={{
            top: 10,
            left: 10,
            backgroundColor: isShared ? 'rgba(16, 185, 129, 0.92)' : 'rgba(30, 41, 59, 0.85)',
            color: '#fff',
            fontSize: '0.72rem',
            backdropFilter: 'blur(4px)',
            padding: '4px 8px',
            borderRadius: '6px',
          }}
        >
          {isShared ? (
            <>
              <Users size={11} /> {t('amenities.shared_facility')}
            </>
          ) : (
            <>
              <Lock size={11} /> {t('amenities.exclusive_facility')}
            </>
          )}
        </span>

        {/* Price Badge (Top Right) */}
        <span
          className="badge position-absolute fw-bold"
          style={{
            top: 10,
            right: 10,
            backgroundColor: isFree ? 'rgba(15, 23, 42, 0.88)' : 'rgba(79, 70, 229, 0.95)',
            color: '#fff',
            fontSize: '0.78rem',
            backdropFilter: 'blur(4px)',
            padding: '5px 10px',
            borderRadius: '6px',
          }}
        >
          {isFree ? t('amenities.free') : formatCurrency(amenity.price)}
        </span>

        {/* Photo count indicator (Bottom Right) */}
        {!imageError && images.length > 1 && (
          <span
            className="badge position-absolute bg-dark bg-opacity-75 text-white d-flex align-items-center gap-1"
            style={{ bottom: 8, right: 10, fontSize: '0.7rem', backdropFilter: 'blur(4px)' }}
          >
            <Camera size={12} /> {t('amenities.photos_count', { count: images.length })}
          </span>
        )}
      </div>

      <div className="card-body d-flex flex-column p-3">
        <h6 className="fw-bold mb-1" style={{ color: '#1a1f36', fontSize: '1rem' }}>
          {highlightMatch(amenity.name, search)}
        </h6>

        {amenity.description ? (
          <p className="text-muted small mb-3 text-truncate" style={{ maxHeight: '40px' }} title={amenity.description}>
            {amenity.description}
          </p>
        ) : (
          <p className="text-muted small mb-3 fst-italic">{t('amenities.no_description')}</p>
        )}

        <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mb-3 mt-auto">
          <div className="d-flex align-items-center gap-1">
            <Clock size={14} className="text-muted" />
            <span>{amenity.operatingStart} – {amenity.operatingEnd}</span>
          </div>
          {amenity.capacity != null && (
            <div className="d-flex align-items-center gap-1">
              <Users size={14} className="text-muted" />
              <span>
                {isShared
                  ? t('amenities.max_capacity', { capacity: new Intl.NumberFormat(i18n.language).format(amenity.capacity) })
                  : `${t('amenities.capacity_colon')} ${new Intl.NumberFormat(i18n.language).format(amenity.capacity)}`}
              </span>
            </div>
          )}
        </div>

        <div className="d-flex gap-2">
          <Link
            to={`/amenities/${amenity.id}`}
            className="btn btn-sm btn-dark flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1"
            style={{ borderRadius: '8px', height: '36px', backgroundColor: '#1a1f36', borderColor: '#1a1f36' }}
          >
            <Eye size={14} /> {t('amenities.view_details')}
          </Link>
          {isAdmin && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
              style={{ borderRadius: '8px', width: '36px', height: '36px' }}
              onClick={() => onEdit(amenity)}
              aria-label={t('common.edit')}
              title={t('amenities.edit_amenity')}
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmenityCard;
