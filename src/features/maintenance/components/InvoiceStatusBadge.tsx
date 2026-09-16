import { useTranslation } from 'react-i18next';
import { STATUS_CONFIG } from '../constants/invoiceStyles';
import type { InvoiceStatus } from '../types/maintenance.types';

const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[status];

  return (
    <span
      className="d-inline-flex align-items-center gap-1 fw-medium"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontSize: '0.75rem',
        padding: '3px 10px',
        borderRadius: '6px',
      }}
    >
      <i className={`bi ${cfg.icon}`} style={{ fontSize: '0.7rem' }} />
      {t(`maintenance.status_${status.toLowerCase()}`)}
    </span>
  );
};

export default InvoiceStatusBadge;