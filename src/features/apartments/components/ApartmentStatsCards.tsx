import { useTranslation } from 'react-i18next';
import { Building2, CheckCircle, XCircle, LayoutGrid } from 'lucide-react';
import type { ApartmentStats } from '../types/apartment.types';

interface ApartmentStatsCardsProps {
  stats: ApartmentStats;
  loading?: boolean;
}

const ApartmentStatsCards = ({ stats, loading = false }: ApartmentStatsCardsProps) => {
  const { t } = useTranslation();

  const statItems = [
    {
      label: t('apartments.stats_total_units'),
      value: stats.totalCount,
      icon: Building2,
      sub: t('apartments.stats_total_units_desc'),
      bgClass: 'bg-primary-subtle text-primary',
      subtextColor: '#0d6efd',
    },
    {
      label: t('apartments.stats_occupied'),
      value: stats.totalOccupied,
      icon: CheckCircle,
      sub: t('apartments.stats_occupied_desc'),
      bgClass: 'bg-success-subtle text-success',
      subtextColor: '#198754',
    },
    {
      label: t('apartments.stats_vacant'),
      value: stats.totalVacant,
      icon: XCircle,
      sub: t('apartments.stats_vacant_desc'),
      bgClass: 'bg-warning-subtle text-warning-emphasis',
      subtextColor: '#b45309',
    },
    {
      label: t('apartments.stats_occupancy_rate'),
      value: `${stats.occupancyRate}%`,
      icon: LayoutGrid,
      sub: t('apartments.stats_occupancy_rate_desc'),
      bgClass: 'bg-purple text-purple',
      customBg: '#eef2ff',
      customColor: '#4338ca',
      subtextColor: '#4338ca',
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="col-12 col-sm-6 col-xl-3">
            <div className="card bg-white border border-light-subtle rounded-3 p-3 h-100 shadow-sm">
              {loading ? (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="skeleton" style={{ width: '80px', height: '12px' }} />
                    <div className="skeleton" style={{ width: '30px', height: '30px', borderRadius: '6px' }} />
                  </div>
                  <div className="skeleton mb-2" style={{ width: '60%', height: '32px' }} />
                  <div className="skeleton" style={{ width: '45%', height: '12px' }} />
                </>
              ) : (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span
                      className="fw-bold text-muted text-uppercase"
                      style={{ fontSize: '0.68rem', letterSpacing: '0.07em' }}
                    >
                      {stat.label}
                    </span>
                    <div
                      className={`rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 ${stat.bgClass}`}
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: stat.customBg,
                        color: stat.customColor,
                      }}
                    >
                      <Icon size={16} strokeWidth={1.75} />
                    </div>
                  </div>
                  <div>
                    <h2 className="fw-bold m-0 lh-1 mb-1" style={{ color: '#1a1f36', fontSize: '2rem' }}>
                      {stat.value}
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: stat.subtextColor }}>
                      {stat.sub}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApartmentStatsCards;