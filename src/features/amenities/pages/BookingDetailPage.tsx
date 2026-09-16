import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, X, Gavel, IndianRupee, QrCode, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import { useScrollLock } from '../../../hooks/useScrollLock';
import { useBookingDetail } from '../hooks/useBookingDetail';
import { useBookingMutations } from '../hooks/useBookingMutations';
import { useAmenities } from '../hooks/useAmenities';
import { bookingApi } from '../api/bookingApi';
import { formatDateOnly } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';
import BookingStatusBadge from '../components/BookingStatusBadge';
import ReasonModal from '../components/ReasonModal';
import BookingPaymentModal from '../components/BookingPaymentModal';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import type { VoteChoice, CommitteeMember, BookingVote } from '../types/amenity.types';

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
            type="button"
            disabled={actionLoading}
            onClick={() => onVote('Approve')}
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
            <Check size={14} /> {t('amenities.approve')}
          </button>
          <div style={{ width: '1px', background: '#e5e7eb' }} />
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => onVote('Reject')}
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
            <X size={14} /> {t('amenities.reject')}
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
          {draft === 'Approve' ? t('status.approved') : t('status.rejected')}
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
          {t('amenities.not_voted')}
        </span>
      )}
    </div>
  );
};

const BookingDetailPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const bookingId = Number(id);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const {
    booking,
    loading,
    actionLoading,
    draftVotes,
    draftAdminVote,
    setMemberVote,
    setAdminVote,
    finalize,
    recordVotes,
    refetch,
  } = useBookingDetail(bookingId);
  const bookingMutations = useBookingMutations(refetch);
  const { amenities } = useAmenities();
  const navigate = useNavigate();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useScrollLock(cancelOpen || payModalOpen || showFinalizeConfirm);

  if (loading) {
    return <div className="container-fluid p-4 text-center"><div className="spinner-border text-primary" /></div>;
  }
  if (!booking) {
    return <div className="container-fluid p-4 text-center text-muted">{t('amenities.booking_not_found')}</div>;
  }

  const amenity = booking.amenity || amenities.find((a) => a.id === booking.amenityId);
  const amenityName = amenity?.name ?? `Amenity #${booking.amenityId}`;
  const amenityPrice = amenity?.price ?? 0;
  const isFree = !amenityPrice || amenityPrice === 0 || amenity?.bookingType === 'SHARED_CAPACITY' || amenity?.isSharedCapacity;

  const isPending = booking.status === 'Pending';
  const isConfirmed = booking.status === 'Confirmed';
  const isPaid = !!booking.paidAt;

  const loggedInResidentId = user?.residentId || user?.resident?.id;
  const isBookingOwner =
    !isAdmin &&
    Boolean(
      (loggedInResidentId && booking.residentId === loggedInResidentId) ||
      (user?.id && booking.resident?.userId === user.id)
    );

  const isPastBooking = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const nowTimeStr = `${hours}:${minutes}`;

    if (booking.bookingDate < todayStr) return true;
    if (booking.bookingDate === todayStr && booking.startTime <= nowTimeStr) return true;
    return false;
  })();

  const canCancel = isBookingOwner && booking.status !== 'Cancelled' && booking.status !== 'Rejected' && !isPastBooking;
  const canPay = isBookingOwner && isConfirmed && !isPaid && !isFree && !isPastBooking;

  const votes = booking.votes || [];
  const committeeMembers = booking.committeeMembers || [];

  const voteForMember = (memberId: number) =>
    votes.find((v: BookingVote) => v.committeeMemberId === memberId);
  const adminVoteFromDb = votes.find((v: BookingVote) => !v.committeeMemberId);

  const handleCancel = async (reason: string): Promise<boolean> => {
    const ok = await bookingMutations.cancel(booking.id, reason);
    if (ok) setCancelOpen(false);
    return ok;
  };

  const confirmFinalize = async () => {
    setShowFinalizeConfirm(false);
    await finalize();
  };

  const handleDownloadReceipt = async () => {
    setDownloadingReceipt(true);
    try {
      const blob = await bookingApi.downloadReceipt(booking.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking-receipt-${booking.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download booking receipt:', err);
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const approvedCount =
    Object.values(draftVotes).filter((v) => v === 'Approve').length +
    (draftAdminVote === 'Approve' ? 1 : 0);
  const rejectedCount =
    Object.values(draftVotes).filter((v) => v === 'Reject').length +
    (draftAdminVote === 'Reject' ? 1 : 0);
  const totalPossibleVoters = committeeMembers.length + (isAdmin ? 1 : 0);
  const votedCount = Object.keys(draftVotes).length + (draftAdminVote ? 1 : 0);

  const residentUser = booking.resident?.user;
  let aptDisplay = '—';
  const apt = booking.apartment || booking.resident?.apartment;
  if (apt) {
    if (apt.unitFormatted) {
      aptDisplay = apt.unitFormatted;
    } else {
      const block = apt.block || '';
      const floor = apt.floorNumber !== undefined && apt.floorNumber !== null ? String(apt.floorNumber) : '';
      const unit = String(apt.unitNumber || '');
      const fullUnit = unit.startsWith(floor) ? unit : `${floor}${unit}`;
      aptDisplay = `${block}-${fullUnit}`;
    }
  } else if (booking.apartmentId) {
    aptDisplay = t('amenities.apt_hash', { id: booking.apartmentId });
  }

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t('amenities.amenity_label'), value: <span className="fw-semibold">{amenityName}</span> },
    {
      label: t('amenities.booking_fee'),
      value: isFree ? (
        <span className="badge bg-success-subtle text-success border border-success-subtle">{t('amenities.free')}</span>
      ) : (
        <span className="fw-bold text-dark">{formatCurrency(amenityPrice)}</span>
      ),
    },
    {
      label: t('amenities.resident_label'),
      value: residentUser?.name
        ? `${residentUser.name} (${residentUser.phone || residentUser.email})`
        : booking.resident?.name
        ? booking.resident.name
        : t('amenities.resident_hash', { id: booking.residentId }),
    },
    {
      label: t('amenities.apartment_label'),
      value: aptDisplay,
    },
    ...((amenity?.bookingType === 'SHARED_CAPACITY' || amenity?.isSharedCapacity)
      ? [
          {
            label: t('amenities.attendees'),
            value: (
              <span className="fw-medium text-dark">
                {booking.memberCount && booking.memberCount > 1
                  ? t('amenities.persons_count', { count: booking.memberCount })
                  : t('amenities.person_1')}
              </span>
            ),
          },
        ]
      : []),
    { label: t('amenities.booking_date'), value: formatDateOnly(booking.bookingDate) || '—' },
    { label: t('amenities.time_label'), value: `${booking.startTime} – ${booking.endTime}` },
    { label: t('amenities.purpose_label'), value: booking.purpose ?? '—' },
    {
      label: t('amenities.payment_status'),
      value: isPaid ? (
        <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1">
          <CheckCircle2 size={13} /> {t('amenities.paid_ref', { ref: booking.paymentRef })}
        </span>
      ) : isFree ? (
        <span className="text-muted small">{t('amenities.not_applicable_free')}</span>
      ) : isConfirmed ? (
        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle d-inline-flex align-items-center gap-1">
          <AlertCircle size={13} /> {t('amenities.unpaid_awaiting')}
        </span>
      ) : (
        <span className="text-muted small">{t('amenities.payable_upon_approval')}</span>
      ),
    },
  ];

  if (booking.rejectionReason) rows.push({ label: t('amenities.rejection_reason'), value: booking.rejectionReason });
  if (booking.cancellationReason) rows.push({ label: t('amenities.cancellation_reason'), value: booking.cancellationReason });

  return (
    <div className="container-fluid p-3 p-md-4">
      <button className="btn btn-link text-decoration-none ps-0 mb-2 text-secondary" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-1" /> {t('common.back')}
      </button>

      {/* ── Status Banners ── */}
      {isConfirmed && !isPaid && !isFree && (
        isBookingOwner ? (
          <div
            className="d-flex align-items-center justify-content-between flex-wrap gap-3 px-3 px-sm-4 py-3 rounded-3 mb-4 shadow-sm"
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <CheckCircle2 size={20} className="text-primary flex-shrink-0" />
              <div>
                <div className="fw-bold" style={{ fontSize: '0.95rem' }}>
                  {t('amenities.booking_approved_banner')}
                </div>
                <div className="small" style={{ color: '#1e3a8a' }}>
                  {t('amenities.booking_approved_resident_desc', { amount: formatCurrency(amenityPrice) })}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm fw-semibold"
              style={{ borderRadius: '8px', fontSize: '0.88rem', backgroundColor: '#1a1f36', borderColor: '#1a1f36' }}
              onClick={() => setPayModalOpen(true)}
            >
              <QrCode size={16} /> {t('amenities.pay_amount_upi', { amount: formatCurrency(amenityPrice) })}
            </button>
          </div>
        ) : (
          <div
            className="d-flex align-items-center gap-2 px-3 px-sm-4 py-3 rounded-3 mb-4"
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              fontSize: '0.9rem',
            }}
          >
            <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
            <div>
              <span className="fw-semibold">
                {t('amenities.booking_approved_awaiting_payment')}
              </span>
              <div className="small text-muted mt-0.5">
                {t('amenities.booking_approved_admin_desc', { amount: formatCurrency(amenityPrice) })}
              </div>
            </div>
          </div>
        )
      )}

      {isConfirmed && isPaid && (
        <div
          className="d-flex align-items-center justify-content-between flex-wrap gap-3 px-3 px-sm-4 py-3 rounded-3 mb-4 shadow-xs"
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '0.9rem',
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2 size={18} className="text-success flex-shrink-0" />
            <div>
              <span className="fw-semibold">
                {t('amenities.booking_confirmed_paid_banner')}
              </span>
              <div className="small text-muted mt-0.5">
                {t('amenities.upi_ref_colon', { ref: booking.paymentRef })}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold shadow-xs"
            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            onClick={handleDownloadReceipt}
            disabled={downloadingReceipt}
          >
            <Download size={14} /> {downloadingReceipt ? t('amenities.generating_receipt') : t('amenities.download_receipt')}
          </button>
        </div>
      )}

      {!isPending && !isConfirmed && (
        <div
          className="d-flex align-items-center gap-2 px-3 px-sm-4 py-3 rounded-3 mb-4"
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '0.9rem',
          }}
        >
          <X size={18} className="flex-shrink-0 text-danger" />
          <div>
            <span className="fw-semibold">
              {t('amenities.booking_status_banner', { status: t(`status.${booking.status.toLowerCase()}`) })}
            </span>
            {booking.status === 'Rejected' && booking.rejectionReason && (
              <div className="mt-1" style={{ fontSize: '0.85rem', color: '#b91c1c' }}>
                <strong>{t('amenities.rejection_reason')}:</strong> {booking.rejectionReason}
              </div>
            )}
            {booking.status === 'Cancelled' && booking.cancellationReason && (
              <div className="mt-1" style={{ fontSize: '0.85rem', color: '#b91c1c' }}>
                <strong>{t('amenities.cancellation_reason')}:</strong> {booking.cancellationReason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <h4 className="fw-bold mb-1 fs-4" style={{ color: '#1a1f36' }}>{t('amenities.booking_hash', { id: booking.id })}</h4>
          <div className="mt-1 d-flex align-items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            {isPaid && (
              <span className="badge bg-success-subtle text-success border border-success-subtle">
                {t('status.paid')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* ── Details Card ── */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body">
              <h6 className="fw-bold mb-3" style={{ color: '#1a1f36' }}>{t('amenities.booking_details')}</h6>
              <table className="table table-sm mb-0">
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx}>
                      <th className="text-secondary fw-medium small py-2" style={{ width: '38%' }}>{r.label}</th>
                      <td className="small py-2" style={{ color: '#1a1f36' }}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Resident Actions */}
              {(canPay || canCancel) && (
                <div className="mt-4 pt-3 border-top d-flex gap-2">
                  {canPay && (
                    <button
                      className="btn btn-dark btn-sm flex-fill d-inline-flex align-items-center justify-content-center gap-1"
                      style={{ borderRadius: '8px', height: '38px' }}
                      onClick={() => setPayModalOpen(true)}
                    >
                      <IndianRupee size={15} /> {t('amenities.pay_amount_upi', { amount: formatCurrency(amenityPrice) })}
                    </button>
                  )}
                  {canCancel && (
                    <button
                      className="btn btn-outline-danger btn-sm flex-fill"
                      style={{ borderRadius: '8px', height: '38px' }}
                      onClick={() => setCancelOpen(true)}
                    >
                      <i className="bi bi-slash-circle me-1" /> {t('amenities.cancel_booking')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Committee Voting Card ── */}
        {!isFree && (
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <Gavel size={18} className="text-dark" />
                  <h6 className="fw-bold mb-0" style={{ color: '#1a1f36' }}>{t('amenities.committee_voting')}</h6>
                </div>
                <span className="badge bg-light text-secondary border">
                  {t('amenities.voted_count', { voted: new Intl.NumberFormat(i18n.language).format(votedCount), total: new Intl.NumberFormat(i18n.language).format(totalPossibleVoters) })}
                </span>
              </div>

              {/* ── Vote progress bar ── */}
              {isPending && (
                <div className="mb-3 pb-3 border-bottom border-light-subtle">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-3">
                      <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.82rem', color: '#166534' }}>
                        <Check size={14} /> <span className="fw-semibold">{t('amenities.approved_count', { count: new Intl.NumberFormat(i18n.language).format(approvedCount) })}</span>
                      </span>
                      <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.82rem', color: '#991b1b' }}>
                        <X size={14} /> <span className="fw-semibold">{t('amenities.rejected_count', { count: new Intl.NumberFormat(i18n.language).format(rejectedCount) })}</span>
                      </span>
                      <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.82rem' }}>
                        <span className="fw-semibold">{t('amenities.pending_count', { count: new Intl.NumberFormat(i18n.language).format(totalPossibleVoters - votedCount) })}</span>
                      </span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
                    {(() => {
                      const approvedW = totalPossibleVoters ? (approvedCount / totalPossibleVoters) * 100 : 0;
                      const rejectedW = totalPossibleVoters ? (rejectedCount / totalPossibleVoters) * 100 : 0;
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

              {/* ── Committee member rows ── */}
              {committeeMembers.length === 0 && !(isAdmin && isPending) ? (
                <p className="text-muted small mb-0">{t('amenities.no_committee_members')}</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {committeeMembers.map((m: CommitteeMember) => {
                    const existing = voteForMember(m.id);
                    const draft = draftVotes[m.id] ?? existing?.vote;
                    return (
                      <VoterRow
                        key={m.id}
                        name={m.fullName || t('amenities.member_hash', { id: m.id })}
                        email={m.email}
                        draft={draft}
                        pending={isPending && isAdmin}
                        actionLoading={actionLoading}
                        onVote={(choice) => setMemberVote(m.id, choice)}
                      />
                    );
                  })}

                  {/* ── Admin vote ── */}
                  {((isAdmin && isPending) || draftAdminVote || adminVoteFromDb?.vote) && (
                    <VoterRow
                      name={user?.name ?? t('roles.admin')}
                      email={user?.email ?? ''}
                      tag={t('amenities.admin_tiebreaker')}
                      draft={draftAdminVote ?? adminVoteFromDb?.vote}
                      pending={isPending && isAdmin}
                      actionLoading={actionLoading}
                      onVote={(choice) => setAdminVote(choice)}
                    />
                  )}
                </div>
              )}

              {/* ── Admin Vote Actions ── */}
              {isAdmin && isPending && (
                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    style={{ borderRadius: '8px' }}
                    disabled={actionLoading || votedCount === 0}
                    onClick={recordVotes}
                  >
                    {actionLoading ? t('amenities.saving') : t('amenities.save_draft_votes')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-dark btn-sm fw-semibold d-inline-flex align-items-center gap-1 px-3"
                    style={{ borderRadius: '8px' }}
                    disabled={actionLoading || votedCount === 0}
                    onClick={() => setShowFinalizeConfirm(true)}
                  >
                    <Gavel size={15} /> {t('amenities.finalize_decision')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

      </div>

      {cancelOpen && (
        <ReasonModal
          title={t('amenities.cancel_booking')}
          submitLabel={t('amenities.cancel_booking')}
          icon="bi-slash-circle"
          loading={bookingMutations.loading}
          onSubmit={handleCancel}
          onCancel={() => setCancelOpen(false)}
        />
      )}

      {payModalOpen && (
        <BookingPaymentModal
          bookingId={booking.id}
          amenityName={amenityName}
          amount={amenityPrice}
          onClose={() => setPayModalOpen(false)}
          onPaymentSuccess={() => {
            refetch();
          }}
        />
      )}

      <ConfirmDialog
        show={showFinalizeConfirm}
        title={t('amenities.finalize_confirm_title')}
        message={t('amenities.finalize_confirm_message')}
        confirmLabel={t('amenities.finalize_decision')}
        variant="dark"
        loading={actionLoading}
        onConfirm={confirmFinalize}
        onCancel={() => setShowFinalizeConfirm(false)}
      />
    </div>
  );
};

export default BookingDetailPage;
