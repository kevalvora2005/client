import { useTranslation } from 'react-i18next';
import { BOOKING_STATUS_CONFIG } from '../constants/amenityConstants';
import type { BookingStatus } from '../types/amenity.types';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const BookingStatusBadge = ({ status }: BookingStatusBadgeProps) => {
  const { t } = useTranslation();
  const cfg = BOOKING_STATUS_CONFIG[status];
  return (
    <span
      className="badge d-inline-flex align-items-center gap-1 fw-medium"
      style={{ backgroundColor: cfg?.bg, color: cfg?.color, fontSize: '0.78rem', padding: '0.3rem 0.55rem' }}
    >
      <i className={`bi ${cfg?.icon}`} /> {t(`status.${status.toLowerCase()}`)}
    </span>
  );
};

export default BookingStatusBadge;
