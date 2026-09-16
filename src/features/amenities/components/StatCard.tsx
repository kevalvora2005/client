import { useTranslation } from 'react-i18next';

interface StatCardProps {
  label: string;
  value: number;
  bg: string;
  color: string;
  icon: string;
}

const StatCard = ({ label, value, bg, color, icon }: StatCardProps) => {
  const { i18n } = useTranslation();
  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
      <div className="card-body d-flex align-items-center gap-3">
        <div
          className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
          style={{ width: 48, height: 48, backgroundColor: bg, color }}
        >
          <i className={`bi ${icon}`} style={{ fontSize: '1.4rem' }} />
        </div>
        <div>
          <p className="text-secondary mb-0 small">{label}</p>
          <h4 className="fw-bold mb-0" style={{ color: '#1a1f36' }}>
            {new Intl.NumberFormat(i18n.language).format(value)}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
