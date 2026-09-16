import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScrollLock } from '../../../hooks/useScrollLock';
import { useMyBookings } from '../hooks/useBookings';
import { useAmenities } from '../hooks/useAmenities';
import { useBookingMutations } from '../hooks/useBookingMutations';
import BookingTable from '../components/BookingTable';
import ReasonModal from '../components/ReasonModal';
import BookingPaymentModal from '../components/BookingPaymentModal';
import Pagination from '../../../components/Pagination/Pagination';
import type { Booking } from '../types/amenity.types';

const MyBookingsPage = () => {
  const { t } = useTranslation();
  const [scope, setScope] = useState<'upcoming' | 'past'>('upcoming');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { bookings, pagination, loading, refetch } = useMyBookings(scope, page, pageSize);
  const { amenities } = useAmenities();
  const bookingMutations = useBookingMutations(refetch);

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [settleTarget, setSettleTarget] = useState<Booking | null>(null);

  useScrollLock(!!cancelTarget || !!settleTarget);

  const handleScopeChange = (key: 'upcoming' | 'past') => {
    setScope(key);
    setPage(1);
  };

  const amenityMap = Object.fromEntries(amenities.map((a) => [a.id, a.name]));
  const amenityPriceMap = Object.fromEntries(amenities.map((a) => [a.id, a.bookingType === 'SHARED_CAPACITY' ? 0 : (a.price ?? 0)]));

  const handleCancel = async (reason: string): Promise<boolean> => {
    if (!cancelTarget) return false;
    const ok = await bookingMutations.cancel(cancelTarget.id, reason);
    if (ok) setCancelTarget(null);
    return ok;
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <h4 className="fw-bold mb-2 fs-4" style={{ color: '#1a1f36' }}>{t('amenities.my_bookings')}</h4>
          <p className="text-muted mb-0 small">{t('amenities.my_bookings_desc')}</p>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {(['upcoming', 'past'] as const).map((key) => {
          const active = scope === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleScopeChange(key)}
              className="btn btn-sm fw-semibold px-3 py-2"
              style={{
                borderRadius: '8px',
                fontSize: '0.85rem',
                backgroundColor: active ? '#1a1f36' : '#fff',
                color: active ? '#fff' : '#4b5563',
                border: `1px solid ${active ? '#1a1f36' : '#e5e7eb'}`,
              }}
            >
              {key === 'upcoming' ? t('amenities.upcoming') : t('amenities.past')}
            </button>
          );
        })}
      </div>

      <div className="card bg-white border border-light-subtle rounded-3 shadow-sm mt-3">
        <BookingTable
          bookings={bookings}
          loading={loading}
          amenityMap={amenityMap}
          amenityPriceMap={amenityPriceMap}
          isAdmin={false}
          onCancel={setCancelTarget}
          onSettle={setSettleTarget}
        />

        {!loading && bookings.length > 0 && (
          <div className="d-flex justify-content-end p-3">
            <Pagination
              pagination={pagination}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      {cancelTarget && (
        <ReasonModal
          title={t('amenities.cancel_booking')}
          submitLabel={t('amenities.cancel_booking')}
          icon="bi-slash-circle"
          loading={bookingMutations.loading}
          onSubmit={handleCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      {settleTarget && (
        <BookingPaymentModal
          bookingId={settleTarget.id}
          amenityName={amenityMap[settleTarget.amenityId] ?? `Amenity #${settleTarget.amenityId}`}
          amount={amenities.find((a) => a.id === settleTarget.amenityId)?.price ?? 0}
          onClose={() => setSettleTarget(null)}
          onPaymentSuccess={() => {
            setSettleTarget(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default MyBookingsPage;
