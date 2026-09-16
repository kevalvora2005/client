import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  FileText,
  MessageSquareWarning,
  MessageSquareText,
  AlertCircle,
  Megaphone,
  ReceiptText,
  Clock,
  X,
  CheckCheck,
  UserPlus,
  XCircle,
  UserMinus,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import useSocket from '../../../hooks/useSocket';
import { SOCKET_EVENTS } from '../../../services/socket';
import useAuth from '../../../hooks/useAuth';
import { notificationApi, type NotificationItem } from '../../../features/notifications/api/notificationApi';
import VisitorApprovalDialog from '../../../features/visitors/components/VisitorApprovalDialog';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';

const ICON_MAP: Record<string, typeof FileText> = {
  visitor_approval_needed: ShieldAlert,
  visitor_approval_timed_out: Clock,
  visitor_checked_in: CheckCheck,
  visitor_approved: CheckCheck,
  visitor_rejected: XCircle,
  complaint_status_changed: MessageSquareWarning,
  complaint_created: AlertCircle,
  complaint_comment_added: MessageSquareText,
  notice_created: Megaphone,
  maintenance_due_soon: ReceiptText,
  maintenance_due_today: ReceiptText,
  maintenance_overdue: Clock,
  maintenance_overdue_reminder: Clock,
  maintenance_payment_succeeded: ReceiptText,
  tenant_request_submitted: UserPlus,
  tenant_request_approved: CheckCheck,
  tenant_request_rejected: XCircle,
  tenancy_revoked: UserMinus,
  document_request_created: FileText,
  document_request_status_changed: FileText,
  document_request_approved: CheckCheck,
  document_request_uploaded: FileText,
  document_request_rejected: XCircle,
  document_request_cancelled: XCircle,
  booking_requested: Sparkles,
  booking_confirmed: CheckCheck,
  booking_rejected: XCircle,
  booking_cancelled: XCircle,
  booking_reminder: Clock,
  booking_payment_succeeded: ReceiptText,
};

const CLASS_MAP: Record<string, string> = {
  visitor_approval_needed: 'bg-primary-subtle text-primary',
  visitor_approval_timed_out: 'bg-danger-subtle text-danger',
  visitor_checked_in: 'bg-success-subtle text-success',
  visitor_approved: 'bg-success-subtle text-success-emphasis',
  visitor_rejected: 'bg-danger-subtle text-danger-emphasis',
  complaint_status_changed: 'bg-warning-subtle text-warning-emphasis',
  complaint_created: 'bg-warning-subtle text-warning-emphasis',
  complaint_comment_added: 'bg-info-subtle text-info-emphasis',
  notice_created: 'bg-primary-subtle text-primary-emphasis',
  maintenance_due_soon: 'bg-info-subtle text-info-emphasis',
  maintenance_due_today: 'bg-warning-subtle text-warning-emphasis',
  maintenance_overdue: 'bg-danger-subtle text-danger-emphasis',
  maintenance_overdue_reminder: 'bg-danger-subtle text-danger-emphasis',
  maintenance_payment_succeeded: 'bg-success-subtle text-success-emphasis',
  tenant_request_submitted: 'bg-primary-subtle text-primary-emphasis',
  tenant_request_approved: 'bg-success-subtle text-success-emphasis',
  tenant_request_rejected: 'bg-danger-subtle text-danger-emphasis',
  tenancy_revoked: 'bg-warning-subtle text-warning-emphasis',
  document_request_created: 'bg-primary-subtle text-primary-emphasis',
  document_request_status_changed: 'bg-info-subtle text-info-emphasis',
  document_request_approved: 'bg-success-subtle text-success-emphasis',
  document_request_uploaded: 'bg-success-subtle text-success-emphasis',
  document_request_rejected: 'bg-danger-subtle text-danger-emphasis',
  document_request_cancelled: 'bg-warning-subtle text-warning-emphasis',
  booking_requested: 'bg-primary-subtle text-primary-emphasis',
  booking_confirmed: 'bg-success-subtle text-success-emphasis',
  booking_rejected: 'bg-danger-subtle text-danger-emphasis',
  booking_cancelled: 'bg-warning-subtle text-warning-emphasis',
  booking_reminder: 'bg-info-subtle text-info-emphasis',
  booking_payment_succeeded: 'bg-success-subtle text-success-emphasis',
};

const NAV_MAP: Record<string, string> = {
  visitor_approval_needed: '/check-in',
  visitor_approval_timed_out: '/visitor-logs',
  visitor_checked_in: '/check-out',
  visitor_approved: '/my-visitors',
  visitor_rejected: '/my-visitors',
  complaint_status_changed: '/complaints',
  complaint_created: '/complaints',
  complaint_comment_added: '/complaints',
  notice_created: '/notices',
  maintenance_due_soon: '/maintenance',
  maintenance_due_today: '/maintenance',
  maintenance_overdue: '/maintenance',
  maintenance_overdue_reminder: '/maintenance',
  maintenance_payment_succeeded: '/maintenance',
  tenant_request_submitted: '/tenant-requests',
  tenant_request_approved: '/tenant',
  tenant_request_rejected: '/tenant',
  tenancy_revoked: '/tenant',
  document_request_created: '/documents',
  document_request_status_changed: '/documents',
  document_request_approved: '/documents',
  document_request_uploaded: '/documents',
  document_request_rejected: '/documents',
  document_request_cancelled: '/documents',
  booking_requested: '/bookings',
  booking_confirmed: '/bookings/me',
  booking_rejected: '/bookings/me',
  booking_cancelled: '/bookings/me',
  booking_reminder: '/bookings/me',
  booking_payment_succeeded: '/bookings/me',
};

const NotificationBell = () => {
  const { t, i18n } = useTranslation();
  const socket = useSocket();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isSecurity = user?.role === 'security';
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [actionStates, setActionStates] = useState<Record<number, 'Approved' | 'Rejected'>>(() => {
    try {
      const saved = localStorage.getItem('visitor_action_states');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Visitor approval dialog state
  const [approvalDialogVisitorId, setApprovalDialogVisitorId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    (async () => {
      try {
        const [data, count] = await Promise.all([
          notificationApi.getNotifications(1, 20),
          notificationApi.getUnreadCount(),
        ]);
        if (!cancelled) {
          setNotifications(data.items);
          setHasNextPage(data.hasNextPage);
          setPageNumber(1);
          setUnreadCount(count);
        }
      } catch {
        // silent
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (n: unknown) => {
      const item = n as NotificationItem;
      setNotifications((prev) => [item, ...prev]);
      setUnreadCount((c) => c + 1);
    };

    const handleVisitorUpdated = (data: { visitorId: number; status: string }) => {
      if (!data?.visitorId || !data?.status) return;
      const nextDecision = data.status === 'Approved' ? 'Approved' : data.status === 'Rejected' ? 'Rejected' : null;
      if (!nextDecision) return;

      setActionStates((prev) => {
        const next = { ...prev };
        setNotifications((current) => {
          current.forEach((n) => {
            if ((n.type === 'visitor_approval_needed' || n.type === 'visitor_approved' || n.type === 'visitor_rejected') && Number(n.data?.visitorId) === data.visitorId) {
              next[n.id] = nextDecision;
            }
          });
          return current;
        });
        try {
          localStorage.setItem('visitor_action_states', JSON.stringify(next));
        } catch { /* ignore */ }
        return next;
      });
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
    socket.on(SOCKET_EVENTS.VISITOR_UPDATED, handleVisitorUpdated);
    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
      socket.off(SOCKET_EVENTS.VISITOR_UPDATED, handleVisitorUpdated);
    };
  }, [socket]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDropdownOpen = useCallback(async () => {
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((item) => (item.isRead ? item : { ...item, isRead: true }))
    );

    try {
      await notificationApi.markAllAsRead();
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    const el = dropdownRef.current;
    if (!el) return;

    const onShow = () => {
      handleDropdownOpen();
    };

    el.addEventListener('show.bs.dropdown', onShow);
    return () => {
      el.removeEventListener('show.bs.dropdown', onShow);
    };
  }, [handleDropdownOpen]);

  const handleDismiss = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationApi.delete(id);
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  const closeDropdown = () => {
    const toggleBtn = dropdownRef.current?.querySelector('[data-bs-toggle="dropdown"]') as HTMLElement;
    if (toggleBtn) {
      toggleBtn.blur();
      const bs = (window as unknown as { bootstrap?: { Dropdown: { getInstance: (el: HTMLElement) => { hide: () => void } | null } } }).bootstrap;
      if (bs?.Dropdown) {
        const instance = bs.Dropdown.getInstance(toggleBtn);
        if (instance) instance.hide();
      }
    }
  };

  const getNotificationPath = (n: NotificationItem): string => {
    switch (n.type) {
      // ── Bookings ──
      case 'booking_requested':
      case 'booking_confirmed':
      case 'booking_rejected':
      case 'booking_cancelled':
      case 'booking_reminder':
      case 'booking_payment_succeeded': {
        if (isAdmin) {
          const bookingId = n.data?.bookingId;
          return bookingId ? `/bookings/${bookingId}` : '/bookings';
        }
        return '/bookings/me';
      }

      // ── Complaints ──
      case 'complaint_created':
      case 'complaint_status_changed':
      case 'complaint_comment_added': {
        const complaintId = n.data?.complaintId;
        return complaintId ? `/complaints?expandedId=${complaintId}` : '/complaints';
      }

      // ── Notices ──
      case 'notice_created':
        return '/notices';

      // ── Maintenance ──
      case 'maintenance_due_soon':
      case 'maintenance_due_today':
      case 'maintenance_overdue':
      case 'maintenance_overdue_reminder':
      case 'maintenance_payment_succeeded':
        return '/maintenance';

      // ── Tenant Requests ──
      case 'tenant_request_submitted': {
        const trId = n.data?.tenantRequestId || n.data?.id;
        if (isAdmin) {
          return trId ? `/tenant-requests/${trId}` : '/tenant-requests';
        }
        return '/tenant';
      }
      case 'tenant_request_approved':
      case 'tenant_request_rejected':
      case 'tenancy_revoked':
        return '/tenant';

      // ── Document Requests ──
      case 'document_request_created':
      case 'document_request_status_changed':
      case 'document_request_approved':
      case 'document_request_uploaded':
      case 'document_request_rejected':
      case 'document_request_cancelled': {
        const docReqId = n.data?.documentRequestId || n.data?.id;
        if (docReqId) {
          return `/documents/${docReqId}`;
        }
        if (n.type === 'document_request_created') {
          return '/documents?tab=received-requests';
        }
        return '/documents';
      }

      // ── Visitors ──
      case 'visitor_approval_needed':
        return isSecurity ? '/check-in' : '/my-visitors';
      case 'visitor_approval_timed_out':
        return isSecurity ? '/visitor-logs' : '/my-visitors';
      case 'visitor_checked_in':
        return isSecurity ? '/check-out' : '/my-visitors';
      case 'visitor_approved':
      case 'visitor_rejected':
        return isSecurity ? '/visitor-logs' : '/my-visitors';

      default:
        return NAV_MAP[n.type] || '/';
    }
  };

  const handleNavigate = async (n: NotificationItem) => {
    if (!n.isRead) {
      setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, isRead: true } : item));
      try {
        await notificationApi.markAsRead(n.id);
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // silent
      }
    }

    closeDropdown();

    // Visitor approval dialog for residents
    if (n.type === 'visitor_approval_needed' && n.data?.visitorId) {
      const visitorId = Number(n.data.visitorId);
      if (!isNaN(visitorId) && visitorId > 0 && !isSecurity) {
        setApprovalDialogVisitorId(visitorId);
        return;
      }
    }

    const path = getNotificationPath(n);
    if (path) {
      navigate(path);
    }
  };

  const handleApprovalDialogClose = useCallback(() => {
    setApprovalDialogVisitorId(null);
  }, []);

  const handleApprovalDecision = useCallback(async (decision: 'Approve' | 'Reject') => {
    const nextDecision = decision === 'Approve' ? 'Approved' : 'Rejected';

    // Update action states for badge display
    setActionStates((prev) => {
      const next = { ...prev };
      // Find the notification ID for this visitor
      const matchingNotification = notifications.find(
        (n) => n.type === 'visitor_approval_needed' && Number(n.data?.visitorId) === approvalDialogVisitorId
      );
      if (matchingNotification) {
        next[matchingNotification.id] = nextDecision;
        try {
          localStorage.setItem('visitor_action_states', JSON.stringify(next));
        } catch { /* ignore */ }
      }
      return next;
    });

    // Refresh the notifications list
    try {
      const [data, count] = await Promise.all([
        notificationApi.getNotifications(1, 20),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(data.items);
      setHasNextPage(data.hasNextPage);
      setPageNumber(1);
      setUnreadCount(count);
    } catch {
      // silent
    }
  }, [notifications, approvalDialogVisitorId]);

  const handleClear = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications([]);
    setUnreadCount(0);
    setHasNextPage(false);
    setPageNumber(1);
    try {
      await notificationApi.deleteAll();
    } catch {
      // silent
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = pageNumber + 1;
      const data = await notificationApi.getNotifications(nextPage, 20);
      setNotifications((prev) => [...prev, ...data.items]);
      setPageNumber(nextPage);
      setHasNextPage(data.hasNextPage);
    } catch {
      // silent
    }
    setLoadingMore(false);
  };

  const iconFor = (type: string) => ICON_MAP[type] ?? FileText;
  const classesFor = (type: string) => CLASS_MAP[type] ?? 'bg-body-secondary text-body-secondary';

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="btn btn-light border border-light-subtle rounded-circle position-relative d-flex align-items-center justify-content-center shadow-sm text-secondary"
        style={{ width: '40px', height: '40px' }}
        type="button"
        data-bs-toggle="dropdown"
        data-bs-display="static"
        aria-expanded="false"
        onClick={handleDropdownOpen}
      >
        <Bell size={20} strokeWidth={2} className={unreadCount > 0 ? 'text-primary' : 'text-secondary'} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-2 border-white shadow-sm"
            style={{ minWidth: '18px', height: '18px', fontSize: '0.62rem', fontWeight: 700, padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
            <span className="visually-hidden">{t('notifications.unread')}</span>
          </span>
        )}
      </button>

      <div
        className="dropdown-menu dropdown-menu-end shadow-lg border border-light-subtle p-0 mt-2 rounded-4 overflow-hidden"
        style={{ width: '400px', maxWidth: 'calc(100vw - 32px)' }}
      >
        {/* ── Header ── */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 bg-light border-bottom border-light-subtle">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>{t('notifications.title')}</span>
            {unreadCount > 0 && (
              <span className="badge rounded-pill bg-primary"
                style={{ fontSize: '0.68rem', padding: '3px 6px' }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              className="btn btn-sm btn-link text-decoration-none fw-semibold text-primary d-flex align-items-center gap-1 p-1 rounded"
              onClick={handleClear}
              style={{ fontSize: '0.78rem' }}
            >
              <CheckCheck size={14} strokeWidth={2.2} />
              {t('notifications.clear_all')}
            </button>
          )}
        </div>

        {/* ── Body ── */}
        {notifications.length === 0 ? (
          <div className="text-center py-5 bg-white">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-circle bg-light"
              style={{ width: '56px', height: '56px' }}
            >
              <Bell size={24} className="text-secondary" />
            </div>
            <p className="fw-semibold mb-1 text-dark" style={{ fontSize: '0.9rem' }}>{t('notifications.empty_title')}</p>
            <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>{t('notifications.empty_desc')}</p>
          </div>
        ) : (
          <div className="list-group list-group-flush" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {notifications.map((n) => {
              const Icon = iconFor(n.type);
              const isApprovalNotification = n.type === 'visitor_approval_needed' || n.type === 'visitor_approved' || n.type === 'visitor_rejected';
              const decision =
                n.type === 'visitor_approved'
                  ? 'Approved'
                  : n.type === 'visitor_rejected'
                  ? 'Rejected'
                  : actionStates[n.id] || (n.data?.status === 'Approved' ? 'Approved' : n.data?.status === 'Rejected' ? 'Rejected' : null);

              return (
                <div
                  key={n.id}
                  className={`list-group-item list-group-item-action d-flex align-items-start justify-content-between border-0 border-bottom border-light-subtle px-3.5 py-3 ${!n.isRead ? 'bg-primary bg-opacity-10' : ''}`}
                >
                  <div
                    className="d-flex align-items-start gap-3 flex-grow-1 min-w-0"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleNavigate(n)}
                  >
                    <div
                      className={`rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ${classesFor(n.type)}`}
                      style={{ width: '40px', height: '40px' }}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </div>

                    <div className="flex-grow-1 min-w-0">
                      <p className="mb-0 fw-semibold text-dark text-truncate" style={{ fontSize: '0.85rem' }}>
                        {n.title}
                      </p>
                      <p className="mb-0 text-secondary" style={{ fontSize: '0.78rem', lineHeight: '1.4', marginTop: '2px', wordBreak: 'break-word' }}>
                        {n.body}
                      </p>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                        {formatRelativeTime(n.createdAt, i18n.language)}
                      </p>

                      {isApprovalNotification && decision && (
                        <div className="mt-2">
                          {decision === 'Approved' ? (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
                              ✓ {t('notifications.entry_approved')}
                            </span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
                              ✕ {t('notifications.entry_rejected')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 ps-2 flex-shrink-0">
                    {!n.isRead && (
                      <span className="bg-primary rounded-circle" style={{ width: '8px', height: '8px', display: 'inline-block', boxShadow: '0 0 6px rgba(13, 110, 253, 0.5)' }} />
                    )}
                    <button
                      className="btn btn-light btn-sm border-0 rounded-circle d-flex align-items-center justify-content-center p-0"
                      onClick={(e) => handleDismiss(n.id, e)}
                      aria-label={t('notifications.dismiss')}
                      title={t('notifications.dismiss')}
                      style={{ width: '24px', height: '24px', color: '#9ca3af' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {hasNextPage && (
              <div className="p-2 text-center bg-light border-top border-light-subtle">
                <button
                  className="btn btn-sm btn-link text-decoration-none fw-semibold text-secondary"
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{ fontSize: '0.8rem' }}
                >
                  {loadingMore ? t('common.loading') : t('notifications.load_more')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {approvalDialogVisitorId !== null && (
        <VisitorApprovalDialog
          visitorId={approvalDialogVisitorId}
          onClose={handleApprovalDialogClose}
          onDecision={handleApprovalDecision}
        />
      )}
    </div>
  );
};

export default NotificationBell;
