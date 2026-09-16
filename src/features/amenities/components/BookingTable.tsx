import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AppTable from '../../../components/AppTable/AppTable';
import type { TableColumn } from '../../../components/AppTable/AppTable';
import BookingStatusBadge from './BookingStatusBadge';
import BookingRowActions from './BookingRowActions';
import type { Booking } from '../types/amenity.types';
import { Calendar, Clock } from 'lucide-react';
import { formatDateOnly } from '../../../utils/formatDate';

interface BookingTableProps {
  bookings: Booking[];
  loading: boolean;
  amenityMap: Record<number, string>;
  isAdmin: boolean;
  onView?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onSettle?: (booking: Booking) => void;
  amenityPriceMap?: Record<number, number>;
}

const BookingTable = ({
  bookings,
  loading,
  amenityMap,
  isAdmin,
  onView,
  onCancel,
  onSettle,
  amenityPriceMap,
}: BookingTableProps) => {
  const { t } = useTranslation();

  const checkIsFree = useCallback((b: Booking): boolean => {
    if (b.amenity) {
      if (b.amenity.bookingType === 'SHARED_CAPACITY') return true;
      if (b.amenity.price !== undefined && b.amenity.price !== null) {
        return b.amenity.price === 0;
      }
    }
    if (amenityPriceMap && amenityPriceMap[b.amenityId] !== undefined) {
      return amenityPriceMap[b.amenityId] === 0;
    }
    return false;
  }, [amenityPriceMap]);

  const columns: TableColumn<Booking>[] = useMemo(
    () => [
      {
        key: 'amenity',
        label: t('nav.amenities'),
        width: isAdmin ? '15%' : '26%',
        render: (b) => {
          const amenityName = amenityMap[b.amenityId] ?? `Amenity #${b.amenityId}`;
          return (
            <div className="py-1 overflow-hidden">
              <div className="d-flex align-items-center flex-wrap">
                <span className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.88rem', letterSpacing: '-0.01em' }}>
                  {amenityName}
                </span>
                {b.memberCount && b.memberCount > 1 ? (
                  <span
                    className="badge rounded-pill bg-light text-secondary border border-light-subtle flex-shrink-0 ms-2"
                    style={{ fontSize: '0.7rem', fontWeight: 500, padding: '3px 8px' }}
                  >
                    👥 {b.memberCount}
                  </span>
                ) : null}
              </div>
              {b.purpose && (
                <p className="m-0 text-muted text-truncate" style={{ fontSize: '0.78rem' }}>
                  {b.purpose}
                </p>
              )}
            </div>
          );
        },
      },
    ...(isAdmin
      ? ([
          {
            key: 'requestedBy',
            label: t('amenities.requested_by'),
            width: '17%',
            render: (b: Booking) => {
              const res = b.resident;
              const name = res?.name ?? `Resident #${b.residentId}`;
              const email = res?.email ?? '';
              return (
                <div className="text-truncate">
                  <p className="fw-semibold m-0 text-dark text-truncate" style={{ fontSize: '0.85rem' }}>
                    {name}
                  </p>
                  {email && (
                    <p className="m-0 text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                      {email}
                    </p>
                  )}
                </div>
              );
            },
          },
          {
            key: 'apartment',
            label: t('maintenance.col_apartment'),
            width: '11%',
            align: 'center' as const,
            render: (b: Booking) => {
              let aptDisplay = '—';
              if (b.apartment) {
                if (b.apartment.unitFormatted) {
                  aptDisplay = b.apartment.unitFormatted;
                } else {
                  const block = b.apartment.block || '';
                  const floor = b.apartment.floorNumber !== undefined && b.apartment.floorNumber !== null ? String(b.apartment.floorNumber) : '';
                  const unit = String(b.apartment.unitNumber || '');
                  const fullUnit = unit.startsWith(floor) ? unit : `${floor}${unit}`;
                  aptDisplay = `${block}-${fullUnit}`;
                }
              } else if (b.apartmentId) {
                aptDisplay = `Apt #${b.apartmentId}`;
              }
              return (
                <span className="badge rounded-pill text-dark border border-secondary-subtle px-2 py-1" style={{ fontSize: '0.75rem', background: '#f8fafc' }}>
                  {aptDisplay}
                </span>
              );
            },
          },
        ] as TableColumn<Booking>[])
      : []),
    {
      key: 'date',
      label: t('amenities.booking_date'),
      width: isAdmin ? '13%' : '16%',
      align: 'center',
      render: (b) => (
        <span className="d-inline-flex align-items-center gap-1 text-secondary" style={{ fontSize: '0.85rem' }}>
          <Calendar size={14} />
          {formatDateOnly(b.bookingDate)}
        </span>
      ),
    },
    {
      key: 'time',
      label: t('amenities.time_slot'),
      width: isAdmin ? '15%' : '18%',
      align: 'center',
      render: (b) => (
        <span className="d-inline-flex align-items-center gap-1 text-secondary" style={{ fontSize: '0.85rem' }}>
          <Clock size={14} />
          {b.startTime} – {b.endTime}
        </span>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      width: isAdmin ? '11%' : '14%',
      align: 'center',
      render: (b) => <BookingStatusBadge status={b.status} />,
    },
    {
      key: 'payment',
      label: t('amenities.payment_status'),
      width: isAdmin ? '11%' : '14%',
      align: 'center',
      render: (b) => {
        const isFree = checkIsFree(b);
        if (b.paidAt) {
          return (
            <span
              className="badge rounded-pill fw-medium px-2 py-1"
              style={{
                fontSize: '0.75rem',
                backgroundColor: '#dcfce7',
                color: '#166534',
              }}
            >
              {t('status.paid')}
            </span>
          );
        }
        if (isFree) {
          return (
            <span
              className="badge rounded-pill fw-medium px-2 py-1"
              style={{
                fontSize: '0.75rem',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
              }}
            >
              {t('amenities.free')}
            </span>
          );
        }
        return (
          <span
            className="badge rounded-pill fw-medium px-2 py-1"
            style={{
              fontSize: '0.75rem',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
            }}
          >
            {t('status.unpaid')}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: t('common.actions'),
      width: isAdmin ? '7%' : '12%',
      align: 'center',
      render: (b) => (
        <div className="d-flex justify-content-center">
          <BookingRowActions
            booking={b}
            isAdmin={isAdmin}
            onView={onView}
            onCancel={onCancel}
            onSettle={onSettle}
            isFree={checkIsFree(b)}
          />
        </div>
      ),
    },
  ], [t, isAdmin, amenityMap, checkIsFree, onView, onCancel, onSettle]);

  return (
    <AppTable
      columns={columns}
      data={bookings}
      loading={loading}
      rowKey={(b) => b.id}
      emptyTitle={t('amenities.no_bookings_title')}
      emptySubtitle={isAdmin ? t('amenities.no_bookings_admin_desc') : t('amenities.no_bookings_resident_desc')}
      emptyIcon="bi-calendar-x"
      tableStyle={{ tableLayout: 'fixed' }}
    />
  );
};

export default BookingTable;
