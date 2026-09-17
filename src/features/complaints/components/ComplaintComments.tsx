import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { complaintApi } from '../api/complaintApi';
import type { Comment, ComplaintStatus } from '../types/complaint.types';
import useAuth from '../../../hooks/useAuth';
import useSocket from '../../../hooks/useSocket';
import { SOCKET_EVENTS } from '../../../services/socket';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';
import { formatDate } from '../../../utils/formatDate';

interface ComplaintCommentsProps {
  complaintId: number;
  status: ComplaintStatus;
  residentName: string;
  isAdmin: boolean;
}

const AVATAR_COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#2563eb'];

function getAvatarColor(userId: number): string {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

const ComplaintComments = ({ complaintId, status, residentName, isAdmin }: ComplaintCommentsProps) => {
  const { t } = useTranslation();
  const socket = useSocket();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  const isResolved = status === 'Resolved';
  const currentUserId = user?.id;

  const otherPerson = useMemo(() => {
    if (isAdmin) {
      return { name: residentName, initials: getInitials(residentName), color: getAvatarColor(0) };
    }
    return { name: t('roles.admin'), initials: 'AD', color: getAvatarColor(1) };
  }, [isAdmin, residentName, t]);

  useEffect(() => {
    if (loaded) return;

    complaintApi.getComments(complaintId)
      .then((data) => {
        setComments(data);
        setLoaded(true);
      })
      .catch((err: unknown) => {
        showError(getErrorMessage(err, t('complaints.load_messages_failed')));
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintId, t]);

  // Real-time Socket.io listener for new chat messages
  useEffect(() => {
    if (!socket) return;

    const handleRealtimeMessage = (data: unknown) => {
      const payload = data as { type?: string; data?: { complaintId?: number } };
      const targetId = Number(payload?.data?.complaintId);
      if (payload?.type === 'complaint_comment_added' || targetId === complaintId) {
        complaintApi.getComments(complaintId)
          .then((newComments) => {
            setComments(newComments);
          })
          .catch(() => {});
      }
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleRealtimeMessage);
    socket.on('complaint:comment', handleRealtimeMessage);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleRealtimeMessage);
      socket.off('complaint:comment', handleRealtimeMessage);
    };
  }, [socket, complaintId]);

  useEffect(() => {
    if (!loading && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [comments, loading]);

  const handleAdd = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await complaintApi.addComment(complaintId, newComment.trim());
      setNewComment('');
      const data = await complaintApi.getComments(complaintId);
      setComments(data);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('complaints.send_message_failed')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex flex-column" style={{ height: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* ── Header ── */}
      <div
        className="d-flex align-items-center gap-3 px-3 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8f9fb' }}
      >
        <div
          className="d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold text-white"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: otherPerson.color,
            fontSize: '0.8rem',
          }}
        >
          {otherPerson.initials}
        </div>
        <div>
          <p className="fw-semibold mb-0" style={{ fontSize: '0.9rem', color: '#1a1f36' }}>
            {otherPerson.name}
          </p>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={messagesRef}
        className="flex-grow-1 d-flex flex-column"
        style={{
          overflowY: 'auto',
          padding: '16px 16px 8px',
          gap: '14px',
          backgroundColor: '#f0f2f5',
        }}
      >
        {loading ? (
          <>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="d-flex gap-3">
                <div className="skeleton flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                <div className="flex-grow-1 d-flex flex-column gap-2">
                  <div className="skeleton" style={{ width: '120px', height: '10px', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ width: '200px', height: '28px', borderRadius: '12px' }} />
                </div>
              </div>
            ))}
          </>
        ) : comments.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 h-100 py-5 text-center my-auto">
            <i className="bi bi-chat-dots text-secondary mb-2" style={{ fontSize: '2.4rem', opacity: 0.35 }} />
            <p className="text-secondary fw-medium mb-0" style={{ fontSize: '0.875rem' }}>
              {t('complaints.no_messages')}
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isMine = comment.userId === currentUserId;

            if (isMine) {
              return (
                <div key={comment.id} className="d-flex justify-content-end" style={{ paddingLeft: '48px' }}>
                  <div style={{ maxWidth: '80%', width: 'fit-content' }}>
                    <div
                      className="px-3 py-2"
                      style={{
                        backgroundColor: '#d9fdd3',
                        borderRadius: '8px 8px 2px 8px',
                        fontSize: '0.85rem',
                        color: '#1a1f36',
                        lineHeight: '1.5',
                        wordBreak: 'break-word',
                        boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
                      }}
                    >
                      {comment.content}
                    </div>
                    <div className="d-flex justify-content-end mt-1" style={{ paddingRight: '4px' }}>
                      <span
                        className="text-secondary"
                        style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}
                        title={formatDate(comment.createdAt)}
                      >
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={comment.id} style={{ paddingRight: '48px' }}>
                <div style={{ maxWidth: '80%', width: 'fit-content' }}>
                  <div
                    className="px-3 py-2"
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '8px 8px 8px 2px',
                      fontSize: '0.85rem',
                      color: '#1a1f36',
                      lineHeight: '1.5',
                      wordBreak: 'break-word',
                      boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
                    }}
                  >
                    {comment.content}
                  </div>
                  <div className="mt-1" style={{ paddingLeft: '4px' }}>
                    <span
                      className="text-secondary"
                      style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}
                      title={formatDate(comment.createdAt)}
                    >
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Input ── */}
      {isResolved ? (
        <div className="px-3 py-2 flex-shrink-0 text-center" style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
          <p className="text-secondary fst-italic mb-0" style={{ fontSize: '0.8rem' }}>
            {t('complaints.chat_disabled_resolved')}
          </p>
        </div>
      ) : (
        <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#f8f9fb' }}>
          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control shadow-none"
              placeholder={t('complaints.placeholder_type_message')}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              style={{
                borderRadius: '24px',
                fontSize: '0.85rem',
                height: '42px',
                paddingLeft: '16px',
                borderColor: newComment.length > 1000 ? '#dc3545' : '#e5e7eb'
              }}
            />
            <button
              className="btn btn-primary d-flex align-items-center justify-content-center flex-shrink-0"
              onClick={handleAdd}
              disabled={submitting || !newComment.trim()}
              style={{
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                padding: 0,
              }}
            >
              {submitting ? (
                <span className="spinner-border spinner-border-sm" style={{ width: '16px', height: '16px' }} />
              ) : (
                <i className="bi bi-send-fill" style={{ fontSize: '1rem' }} />
              )}
            </button>
          </div>
          {newComment.length > 1000 && (
            <div className="text-danger mt-1" style={{ fontSize: '0.78rem' }}>{t('complaints.max_1000_chars')}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplaintComments;
