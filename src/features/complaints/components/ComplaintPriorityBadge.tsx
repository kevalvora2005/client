import { useTranslation } from 'react-i18next';
import { PRIORITY_CONFIG } from '../constants/complaintStyles';
import type { ComplaintPriority } from '../types/complaint.types';

const ComplaintPriorityBadge = ({ priority }: { priority: ComplaintPriority }) => {
  const { t } = useTranslation();
  const cfg = PRIORITY_CONFIG[priority];

  return (
    <span
      className="fw-medium"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontSize: '0.75rem',
        padding: '3px 10px',
        borderRadius: '6px',
      }}
    >
      {t(`priority.${priority.toLowerCase()}`)}
    </span>
  );
};

export default ComplaintPriorityBadge;