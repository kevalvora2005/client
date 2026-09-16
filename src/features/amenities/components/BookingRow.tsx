import { useTranslation } from 'react-i18next';
import type { Booking } from '../types/amenity.types';
import BookingStatusBadge from './BookingStatusBadge';
import { formatDateOnly } from '../../../utils/formatDate';

interface BookingRowProps {
  booking: Booking;
  amenityName?: string;
  isAdmin: boolean;
  onView: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onSettle?: (booking: Booking) => void;
}

const BookingRow = ({
  booking,
  amenityName,
  isAdmin,
  onView,
  onCancel,
  onSettle,
}: BookingRowProps) => {
  const { t } = useTranslation();
  const canApprove = isAdmin && booking.status === 'Pending';
  const canCancel = !isAdmin && booking.status !== 'Cancelled' && booking.status !== 'Rejected';
  const canSettle = !isAdmin && booking.status === 'Confirmed' && !booking.paidAt;

  return (
    <tr>
      <td className="align-middle">
        <button type="button" className="btn btn-link p-0 text-decoration-none fw-medium" style={{ color: '#1a1f36' }} onClick={() => onView(booking)}>
          #{booking.id}
        </button>
      </td>
      <td className="align-middle">{amenityName ?? `Amenity #${booking.amenityId}`}</td>
      <td className="align-middle">{formatDateOnly(booking.bookingDate)}</td>
      <td className="align-middle">{booking.startTime} – {booking.endTime}</td>
      <td className="align-middle"><BookingStatusBadge status={booking.status} /></td>
      <td className="align-middle">
        {booking.paidAt
          ? <span className="badge text-bg-success" style={{ fontSize: '0.72rem' }}>{t('status.paid')}</span>
          : <span className="badge text-bg-light border" style={{ fontSize: '0.72rem', color: '#6b7280' }}>{t('status.unpaid')}</span>}
      </td>
      <td className="align-middle">
        <div className="d-flex flex-wrap gap-2 justify-content-end">
          {canApprove ? (
            <button
              type="button"
              className="btn btn-sm btn-dark d-inline-flex align-items-center gap-1"
              style={{ borderRadius: '8px' }}
              onClick={() => onView(booking)}
            >
              <i className="bi bi-shield-check" /> {t('amenities.vote_and_review')}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              style={{ borderRadius: '8px' }}
              onClick={() => onView(booking)}
            >
              {t('common.details')}
            </button>
          )}
          {canSettle && (
            <button type="button" className="btn btn-sm btn-dark" style={{ borderRadius: '8px' }} onClick={() => onSettle?.(booking)}>{t('amenities.record_payment')}</button>
          )}
          {canCancel && (
            <button type="button" className="btn btn-sm btn-outline-danger" style={{ borderRadius: '8px' }} onClick={() => onCancel?.(booking)}>{t('common.cancel')}</button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default BookingRow;
