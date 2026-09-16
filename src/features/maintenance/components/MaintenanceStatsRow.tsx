import { useTranslation } from 'react-i18next';
import type { AdminDashboardMetrics } from '../types/maintenance.types';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

interface MaintenanceStatsRowProps {
  metrics: AdminDashboardMetrics | null;
  loading?: boolean;
}

const MaintenanceStatsRow = ({ metrics, loading = false }: MaintenanceStatsRowProps) => {
  const { t, i18n } = useTranslation();

  const statItems = [
    {
      label: t('maintenance.total_collected'),
      value: formatCurrency(metrics?.totalCollected ?? 0),
      subtext: t('maintenance.total_collected_subtext'),
      icon: CheckCircle2,
      bgClass: 'bg-success-subtle text-success',
      subtextColor: '#198754',
    },
    {
      label: t('maintenance.total_pending'),
      value: formatCurrency(metrics?.totalPending ?? 0),
      subtext: t('maintenance.total_pending_subtext'),
      icon: Clock,
      bgClass: 'bg-warning-subtle text-warning-emphasis',
      subtextColor: '#b45309',
    },
    {
      label: t('maintenance.overdue_invoices'),
      value: new Intl.NumberFormat(i18n.language || 'en').format(metrics?.overdueCount ?? 0),
      subtext: t('maintenance.overdue_invoices_subtext'),
      icon: AlertTriangle,
      bgClass: 'bg-danger-subtle text-danger',
      subtextColor: '#dc2626',
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
                      }}
                    >
                      <Icon size={16} />
                    </div>
                  </div>

                  <div>
                    <h2 className="fw-bold m-0 lh-1 mb-1 text-truncate" style={{ color: '#1a1f36', fontSize: '1.75rem' }} title={String(item.value)}>
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

export default MaintenanceStatsRow;