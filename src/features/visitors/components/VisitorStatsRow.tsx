import React from 'react';
import { useTranslation } from 'react-i18next';
import type { VisitorDashboardMetrics } from '../types/visitor.types';
import { Users, LogIn, Clock } from 'lucide-react';

interface VisitorStatsRowProps {
  metrics: VisitorDashboardMetrics | null;
  loading?: boolean;
}

export const VisitorStatsRow: React.FC<VisitorStatsRowProps> = ({ metrics, loading = false }) => {
  const { t } = useTranslation();

  const statItems = [
    {
      label: t('visitors.stat_visitors_today'),
      value: metrics?.visitorsToday ?? 0,
      subtext: t('visitors.stat_visitors_today_subtext'),
      icon: Users,
      bgClass: 'bg-primary-subtle text-primary',
      subtextColor: '#0d6efd',
    },
    {
      label: t('visitors.stat_currently_inside'),
      value: metrics?.currentlyInside ?? 0,
      subtext: t('visitors.stat_currently_inside_subtext'),
      icon: LogIn,
      bgClass: 'bg-success-subtle text-success',
      subtextColor: '#198754',
    },
    {
      label: t('visitors.stat_avg_duration'),
      value: (() => {
        const mins = metrics?.averageVisitDurationMinutes ?? 0;
        if (mins < 60) return `${mins}m`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
      })(),
      subtext: t('visitors.stat_avg_duration_subtext'),
      icon: Clock,
      bgClass: 'bg-info-subtle text-info',
      customBg: '#e0f2fe',
      customColor: '#0369a1',
      subtextColor: '#0369a1',
    },
  ];

  return (
    <div className="row g-3">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="col-12 col-sm-6 col-md-4">
            <div className="card bg-white border border-light-subtle rounded-3 p-3 h-100 shadow-sm">
              {loading || !metrics ? (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="skeleton" style={{ width: '80px', height: '12px', borderRadius: '4px' }} />
                    <div className="skeleton rounded-2" style={{ width: '30px', height: '30px' }} />
                  </div>
                  <div className="skeleton mb-2" style={{ width: '60%', height: '32px', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ width: '45%', height: '12px', borderRadius: '4px' }} />
                </>
              ) : (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span
                      className="fw-bold text-muted text-uppercase"
                      style={{ fontSize: '0.68rem', letterSpacing: '0.07em' }}
                    >
                      {item.label}
                    </span>
                    <div
                      className={`rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 ${item.bgClass}`}
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: item.customBg,
                        color: item.customColor,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                  </div>

                  <div>
                    <h2 className="fw-bold m-0 lh-1 mb-1" style={{ color: '#1a1f36', fontSize: '2rem' }}>
                      {item.value}
                    </h2>
                    <span className="small" style={{ fontSize: '0.8rem', color: item.subtextColor }}>
                      {item.subtext}
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

export default VisitorStatsRow;
