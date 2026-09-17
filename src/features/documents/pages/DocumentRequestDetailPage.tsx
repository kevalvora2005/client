import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, X, Gavel, FileText, User, Building, Calendar, Clock } from 'lucide-react';
import useDocumentRequestDetail from '../hooks/useDocumentRequestDetail';
import useAuth from '../../../hooks/useAuth';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import type { DocumentRequestVote, CommitteeMember } from '../types/documentRequest.types';
import { formatDate } from '../../../utils/formatDate';
import { getDocTypeLabel } from '../utils/getDocTypeLabel';

type VoteChoice = 'Approve' | 'Reject';

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const map: Record<string, { label: string; bg: string; color: string }> = {
    PENDING: { label: t('documents.status_pending'), bg: '#fef3c7', color: '#92400e' },
    APPROVED: { label: t('documents.status_approved'), bg: '#dcfce7', color: '#166534' },
    REJECTED: { label: t('documents.status_declined'), bg: '#fee2e2', color: '#991b1b' },
    UPLOADED: { label: t('documents.status_uploaded'), bg: '#dbeafe', color: '#1e40af' },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span className="badge-pill" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

const VoterRow = ({
  name,
  email,
  tag,
  draft,
  pending,
  actionLoading,
  onVote,
}: {
  name: string;
  email: string;
  tag?: string | null;
  draft: string | null | undefined;
  pending: boolean;
  actionLoading: boolean;
  onVote: (choice: VoteChoice) => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border border-light-subtle flex-wrap gap-2">
      <div className="min-w-0" style={{ flex: '1 1 auto' }}>
        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{name}</span>
          {tag && (
            <span className="badge" style={{ backgroundColor: '#e8eaf6', color: '#3949ab', fontSize: '0.68rem', fontWeight: 600 }}>
              {tag}
            </span>
          )}
        </div>
        <div className="text-muted mt-0" style={{ fontSize: '0.78rem' }}>{email}</div>
      </div>
      {pending ? (
        <div className="d-flex rounded-3 overflow-hidden flex-shrink-0" style={{ border: '1px solid #e5e7eb' }}>
          <button
            disabled={actionLoading}
            onClick={() => onVote('Approve' as VoteChoice)}
            className="d-flex align-items-center gap-1 px-3 fw-semibold border-0"
            style={{
              fontSize: '0.82rem',
              paddingTop: '6px',
              paddingBottom: '6px',
              backgroundColor: draft === 'Approve' ? '#166534' : '#fff',
              color: draft === 'Approve' ? '#fff' : '#6b7280',
              transition: 'all 0.15s ease',
            }}
          >
            <Check size={14} /> {t('documents.approve')}
          </button>
          <div style={{ width: '1px', background: '#e5e7eb' }} />
          <button
            disabled={actionLoading}
            onClick={() => onVote('Reject' as VoteChoice)}
            className="d-flex align-items-center gap-1 px-3 fw-semibold border-0"
            style={{
              fontSize: '0.82rem',
              paddingTop: '6px',
              paddingBottom: '6px',
              backgroundColor: draft === 'Reject' ? '#991b1b' : '#fff',
              color: draft === 'Reject' ? '#fff' : '#6b7280',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={14} /> {t('documents.reject')}
          </button>
        </div>
      ) : draft ? (
        <span
          className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill fw-semibold flex-shrink-0"
          style={{
            fontSize: '0.78rem',
            backgroundColor: draft === 'Approve' ? '#dcfce7' : '#fee2e2',
            color: draft === 'Approve' ? '#166534' : '#991b1b',
          }}
        >
          {draft === 'Approve' ? <Check size={13} /> : <X size={13} />}
          {draft === 'Approve' ? t('documents.approve') : t('documents.reject')}
        </span>
      ) : (
        <span
          className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill fw-semibold flex-shrink-0"
          style={{
            fontSize: '0.78rem',
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
          }}
        >
          {t('documents.not_voted')}
        </span>
      )}
    </div>
  );
};

const DocumentRequestDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const requestId = Number(id);
  const { data, loading, actionLoading, draftVotes, draftAdminVote, setMemberVote, setAdminVote, finalize, isAdmin } = useDocumentRequestDetail(requestId);
  const { user } = useAuth();
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);

  if (loading || !data) {
    return (
      <div className="page">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--subtitle" />
        <div className="info-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="info-card">
              <div className="skeleton skeleton--label" />
              <div className="skeleton skeleton--value" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const request = data;
  const { votes, committeeMembers } = data;
  const isPending = request.status === 'PENDING';

  const voteForMember = (memberId: number) =>
    votes.find((v: DocumentRequestVote) => v.committeeMemberId === memberId);
  const adminVoteFromDb = votes.find((v: DocumentRequestVote) => !v.committeeMemberId);

  const handleFinalize = () => {
    setShowFinalizeConfirm(true);
  };

  const confirmFinalize = async () => {
    setShowFinalizeConfirm(false);
    try {
      await finalize();
    } catch {
      void 0;
    }
  };

  const infoCards = [
    { icon: User, label: t('documents.card_requester'), value: request.requester?.user?.name ?? t('documents.resident_fallback', { id: request.requesterId }), accent: 'info-card--green' },
    { icon: Building, label: t('documents.card_apartment'), value: request.apartment ? `${request.apartment.block}-${request.apartment.floorNumber}${request.apartment.unitNumber}` : t('documents.apartment_fallback', { id: request.apartmentId }), accent: 'info-card--purple' },
    { icon: Calendar, label: t('documents.card_submitted'), value: formatDate(request.createdAt), accent: 'info-card--amber' },
  ];

  return (
    <div className="page">

      <button className="back-btn" onClick={() => navigate('/documents')}>
        <ArrowLeft size={16} strokeWidth={2} />
        {t('documents.back_to_documents')}
      </button>

      {!isPending && request.status !== 'UPLOADED' && (
        <div
          className="d-flex align-items-center gap-2 px-3 px-sm-4 py-3 rounded-3"
          style={{
            backgroundColor: request.status === 'APPROVED' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${request.status === 'APPROVED' ? '#a7f3d0' : '#fecaca'}`,
            color: request.status === 'APPROVED' ? '#065f46' : '#991b1b',
            fontSize: '0.9rem',
          }}
        >
          {request.status === 'APPROVED' ? <Check size={18} /> : <X size={18} />}
          <div>
            <span>{request.status === 'APPROVED' ? t('documents.banner_approved') : t('documents.banner_rejected')}</span>
            {request.status === 'REJECTED' && request.rejectionReason && (
              <div className="fw-medium mt-1" style={{ fontSize: '0.85rem' }}>
                {t('documents.decline_reason_prefix', { reason: request.rejectionReason })}
              </div>
            )}
          </div>
        </div>
      )}

      {request.status === 'UPLOADED' && (
        <div
          className="d-flex align-items-center gap-2 px-3 px-sm-4 py-3 rounded-3"
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '0.9rem',
          }}
        >
          <Check size={18} />
          {t('documents.banner_uploaded')}
        </div>
      )}

      <div className="detail-header">
        <div className="detail-header__left">
          <div>
            <div className="detail-header__name-row">
              <h4 className="detail-header__name">{getDocTypeLabel(request.documentType, t)}</h4>
              <StatusBadge status={request.status} />
            </div>
            <div className="detail-header__meta">
              {request.customDocumentName && <span><FileText size={13} strokeWidth={1.75} /> {request.customDocumentName}</span>}
              {request.note && <span><Clock size={13} strokeWidth={1.75} /> {request.note}</span>}
              {request.status === 'REJECTED' && request.rejectionReason && (
                <span className="text-danger"><X size={13} strokeWidth={1.75} /> {t('documents.reason_prefix', { reason: request.rejectionReason })}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="info-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {infoCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`info-card ${card.accent}`}>
              <div className="info-card__icon-box">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <div>
                <p className="info-card__label">{card.label}</p>
                <p className="info-card__value">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-card">
        <div className="section-card__header d-flex align-items-center gap-2">
          <Gavel size={18} />
          <h6 className="section-card__title mb-0">{t('documents.committee_votes_title')}</h6>
        </div>
        <div className="p-3 p-sm-4">
          {committeeMembers.length === 0 && !(isAdmin && isPending) ? (
            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{t('documents.no_committee_members_available')}</p>
          ) : (
            <>
              {isPending && (
                <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-light-subtle">
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.82rem', color: '#166534' }}>
                      <Check size={14} /> <span className="fw-semibold">{Object.values(draftVotes).filter(v => v === 'Approve').length + (draftAdminVote === 'Approve' ? 1 : 0)}</span> {t('documents.approved_count')}
                    </span>
                    <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.82rem', color: '#991b1b' }}>
                      <X size={14} /> <span className="fw-semibold">{Object.values(draftVotes).filter(v => v === 'Reject').length + (draftAdminVote === 'Reject' ? 1 : 0)}</span> {t('documents.rejected_count')}
                    </span>
                    <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.82rem' }}>
                      <span className="fw-semibold">{committeeMembers.length + (isAdmin ? 1 : 0) - Object.keys(draftVotes).length - (draftAdminVote ? 1 : 0)}</span> {t('documents.not_voted_count')}
                    </span>
                  </div>
                  <div style={{ width: '120px', height: '6px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
                    {(() => {
                      const approved = Object.values(draftVotes).filter(v => v === 'Approve').length + (draftAdminVote === 'Approve' ? 1 : 0);
                      const rejected = Object.values(draftVotes).filter(v => v === 'Reject').length + (draftAdminVote === 'Reject' ? 1 : 0);
                      const total = committeeMembers.length + (isAdmin ? 1 : 0);
                      const approvedW = total ? (approved / total * 100) : 0;
                      const rejectedW = total ? (rejected / total * 100) : 0;
                      return (
                        <>
                          <div style={{ width: `${approvedW}%`, height: '100%', background: '#22c55e', float: 'left' }} />
                          <div style={{ width: `${rejectedW}%`, height: '100%', background: '#ef4444', float: 'left' }} />
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="d-flex flex-column gap-2">
                {committeeMembers.map((m: CommitteeMember) => {
                  const existing = voteForMember(m.id);
                  const draft = draftVotes[m.id] ?? existing?.vote;
                  return (
                    <VoterRow
                      key={m.id}
                      name={m.fullName ?? t('documents.member_fallback', { id: m.id })}
                      email={m.email}
                      draft={draft}
                      pending={isPending}
                      actionLoading={actionLoading}
                      onVote={(choice) => setMemberVote(m.id, choice)}
                    />
                  );
                })}

                {((isAdmin && isPending) || draftAdminVote || adminVoteFromDb?.vote) && (
                  <VoterRow
                    name={user?.name ?? t('documents.admin_tag')}
                    email={user?.email ?? ''}
                    tag={t('documents.admin_tag')}
                    draft={draftAdminVote ?? adminVoteFromDb?.vote}
                    pending={isPending}
                    actionLoading={actionLoading}
                    onVote={(choice) => setAdminVote(choice)}
                  />
                )}

              </div>

              {isPending && (
                <div className="d-flex justify-content-end mt-3">
                  <button
                    disabled={actionLoading || Object.keys(draftVotes).length === 0}
                    onClick={handleFinalize}
                    className="btn fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{ backgroundColor: '#111827', color: '#fff', height: '38px', borderRadius: '8px', paddingInline: '20px', fontSize: '0.85rem' }}
                  >
                    {actionLoading ? <span className="spinner-border spinner-border-sm" /> : <Gavel size={16} />}
                    {actionLoading ? t('documents.saving') : t('documents.save_votes')}
                  </button>
                </div>
              )}

            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        show={showFinalizeConfirm}
        title={t('documents.finalize_dialog_title')}
        message={t('documents.finalize_dialog_message')}
        confirmLabel={t('documents.finalize_dialog_confirm')}
        cancelLabel={t('common.cancel')}
        variant="info"
        loading={actionLoading}
        onConfirm={confirmFinalize}
        onCancel={() => setShowFinalizeConfirm(false)}
      />
    </div>
  );
};

export default DocumentRequestDetailPage;
