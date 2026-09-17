import { useTranslation } from 'react-i18next';
import { STATUS_CONFIG } from '../constants/complaintStyles';
import type { ComplaintStatus } from '../types/complaint.types';

const STATUS_KEY_MAP: Record<ComplaintStatus, string> = {
  'Open': 'status.open',
  'In Progress': 'status.in_progress',
  'Resolved': 'status.resolved',
};

const ComplaintStatusBadge = ({ status }: { status: ComplaintStatus }) => {
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
      {t(STATUS_KEY_MAP[status])}
    </span>
  );
};

export default ComplaintStatusBadge;