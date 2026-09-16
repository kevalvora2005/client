import { useTranslation } from 'react-i18next';
import { useBookingStats } from '../hooks/useBookingStats';
import StatCard from '../components/StatCard';

const STATUS_CARDS: { key: 'confirmed' | 'pending' | 'rejected' | 'cancelled'; bg: string; color: string; icon: string }[] = [
  { key: 'confirmed', bg: '#dbeafe', color: '#1e40af', icon: 'bi-check-circle' },
  { key: 'pending', bg: '#fef3c7', color: '#92400e', icon: 'bi-hourglass-split' },
  { key: 'rejected', bg: '#fee2e2', color: '#991b1b', icon: 'bi-x-circle' },
  { key: 'cancelled', bg: '#f3f4f6', color: '#6b7280', icon: 'bi-slash-circle' },
];

const AmenityStatsPage = () => {
  const { t, i18n } = useTranslation();
  const { stats, loading } = useBookingStats();

  const values = stats
    ? STATUS_CARDS.map((c) => ({
        ...c,
        label: t(`status.${c.key}`),
        value: stats[c.key],
      }))
    : [];
  const total = values.reduce((sum, v) => sum + v.value, 0);
  const max = Math.max(total, 1);

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="mb-4">
        <h4 className="fw-bold mb-2 fs-4" style={{ color: '#1a1f36' }}>{t('amenities.booking_stats_title')}</h4>
        <p className="text-muted mb-0 small">{t('amenities.booking_stats_desc')}</p>
      </div>

      {loading || !stats ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {values.map((v) => (
              <div key={v.key} className="col-12 col-sm-6 col-lg-3">
                <StatCard label={v.label} value={v.value} bg={v.bg} color={v.color} icon={v.icon} />
              </div>
            ))}
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body">
              <h6 className="fw-bold mb-3" style={{ color: '#1a1f36' }}>{t('amenities.distribution')}</h6>
              {values.map((v) => (
                <div key={v.key} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="fw-medium" style={{ color: '#1a1f36' }}>{v.label}</span>
                    <span className="text-secondary">
                      {new Intl.NumberFormat(i18n.language).format(v.value)} ({total ? Math.round((v.value / total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="progress" style={{ height: '10px', borderRadius: '8px', backgroundColor: '#f3f4f6' }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${(v.value / max) * 100}%`, backgroundColor: v.color }}
                      role="progressbar"
                    />
                  </div>
                </div>
              ))}
              <p className="text-secondary small mb-0 mt-2">
                {t('amenities.total_bookings_count', { total: new Intl.NumberFormat(i18n.language).format(total) })}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AmenityStatsPage;
