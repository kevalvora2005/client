import React from 'react';
import { useTranslation } from 'react-i18next';
import { STATUS_CONFIG } from '../constants/visitorStyles';
import type { VisitorStatus } from '../types/visitor.types';

interface VisitorStatusBadgeProps {
  status: VisitorStatus;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_KEY_MAP: Record<VisitorStatus, string> = {
  Pending: 'status.pending',
  Approved: 'status.approved',
  Rejected: 'status.rejected',
  CheckedIn: 'status.checked_in',
  CheckedOut: 'status.checked_out',
  Cancelled: 'status.cancelled',
};

export const VisitorStatusBadge: React.FC<VisitorStatusBadgeProps> = ({ status, size = 'md' }) => {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[status];
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const label = t(STATUS_KEY_MAP[status]);

  return (
    <span
      className="d-inline-flex align-items-center gap-1.5 fw-semibold shadow-xs text-nowrap"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontSize: isSm ? '0.7rem' : isLg ? '0.85rem' : '0.75rem',
        padding: isSm ? '2px 8px' : isLg ? '5px 14px' : '3px 10px',
        borderRadius: '20px',
        border: `1px solid ${cfg.color}30`,
        whiteSpace: 'nowrap',
      }}
    >
      <i className={`bi ${cfg.icon}`} style={{ fontSize: isSm ? '0.65rem' : '0.75rem' }} />
      {label}
    </span>
  );
};

export default VisitorStatusBadge;