import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Booking } from '../types/amenity.types';
import { bookingApi } from '../api/bookingApi';

interface BookingRowActionsProps {
  booking: Booking;
  isAdmin: boolean;
  onView?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onSettle?: (booking: Booking) => void;
  isFree?: boolean;
}

const BookingRowActions = ({
  booking,
  isAdmin,
  onView,
  onCancel,
  onSettle,
  isFree,
}: BookingRowActionsProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.dropdown-menu')
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setMenuStyle(
        spaceBelow < 180
          ? { bottom: window.innerHeight - rect.top, left: rect.right - 160, zIndex: 9999, minWidth: '160px' }
          : { top: rect.bottom, left: rect.right - 160, zIndex: 9999, minWidth: '160px' }
      );
    }
    setIsOpen((prev) => !prev);
  };

  const handleDownloadReceipt = async () => {
    setDownloading(true);
    try {
      const blob = await bookingApi.downloadReceipt(booking.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking-receipt-${booking.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download booking receipt:', err);
    } finally {
      setDownloading(false);
      setIsOpen(false);
    }
  };

  const isFreeAmenity = isFree ?? Boolean(
    !booking.amenity?.price ||
    booking.amenity?.price === 0 ||
    booking.amenity?.bookingType === 'SHARED_CAPACITY'
  );

  const isPastBooking = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const nowTimeStr = `${hours}:${minutes}`;

    if (booking.bookingDate < todayStr) return true;
    if (booking.bookingDate === todayStr && booking.startTime <= nowTimeStr) return true;
    return false;
  })();

  const showVote = isAdmin && booking.status === 'Pending';
  const showAdminView = isAdmin;
  const showPay = !isAdmin && booking.status === 'Confirmed' && !booking.paidAt && !isFreeAmenity && !isPastBooking && Boolean(onSettle);
  const showCancel = !isAdmin && booking.status !== 'Cancelled' && booking.status !== 'Rejected' && !isPastBooking && Boolean(onCancel);
  const showReceipt = Boolean(booking.paidAt);

  const hasActions = showAdminView || showReceipt || showPay || showCancel;
  if (!hasActions) {
    return <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>;
  }

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        onClick={handleToggle}
        className="btn p-0 border-0 text-secondary bg-transparent d-flex align-items-center justify-content-center mx-auto"
        style={{ width: '28px', height: '28px' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#212529')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6c757d')}
        title={t('common.actions')}
      >
        <i className="bi bi-three-dots-vertical fs-5" />
      </button>

      {isOpen && (
        <ul
          className="dropdown-menu shadow-sm border border-light-subtle rounded-3 p-1 show position-fixed"
          style={menuStyle}
        >
          {showVote ? (
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small fw-semibold text-dark"
                onClick={() => {
                  onView?.(booking);
                  setIsOpen(false);
                }}
                style={{ fontSize: '0.85rem' }}
              >
                <i className="bi bi-shield-check text-primary" /> {t('amenities.vote_and_review')}
              </button>
            </li>
          ) : showAdminView ? (
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small"
                onClick={() => {
                  onView?.(booking);
                  setIsOpen(false);
                }}
                style={{ fontSize: '0.85rem' }}
              >
                <i className="bi bi-eye text-muted" /> {t('amenities.view_details')}
              </button>
            </li>
          ) : null}

          {showReceipt && (
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-dark"
                onClick={handleDownloadReceipt}
                disabled={downloading}
                style={{ fontSize: '0.85rem' }}
              >
                <i className="bi bi-file-earmark-pdf text-danger" /> {downloading ? t('amenities.generating_receipt') : t('amenities.download_receipt')}
              </button>
            </li>
          )}

          {showPay && onSettle && (
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-success fw-semibold"
                onClick={() => {
                  onSettle(booking);
                  setIsOpen(false);
                }}
                style={{ fontSize: '0.85rem' }}
              >
                <i className="bi bi-credit-card text-success" /> {t('amenities.pay_upi')}
              </button>
            </li>
          )}

          {showCancel && onCancel && (
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-danger"
                onClick={() => {
                  onCancel(booking);
                  setIsOpen(false);
                }}
                style={{ fontSize: '0.85rem' }}
              >
                <i className="bi bi-x-circle text-danger" /> {t('amenities.cancel_booking')}
              </button>
            </li>
          )}
        </ul>
      )}
    </>
  );
};

export default BookingRowActions;
