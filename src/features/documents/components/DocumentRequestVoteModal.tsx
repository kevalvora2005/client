import { useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { X, ThumbsUp, ThumbsDown, CheckCircle, Clock, Send, Loader2, FileText, User, Building } from "lucide-react";
import type { DocumentRequestDetail } from "../types/documentRequest.types";
import { getDocTypeLabel } from "../utils/getDocTypeLabel";

interface Props {
  open: boolean;
  requestId: number | null;
  detail: DocumentRequestDetail | null;
  loadingDetail: boolean;
  recording: boolean;
  finalizing: boolean;
  loadDetail: (id: number) => void;
  recordVotes: (requestId: number, votes: { committeeMemberId: number; vote: "Approve" | "Reject" }[]) => Promise<boolean>;
  finalize: (requestId: number) => Promise<boolean>;
  onClose: () => void;
}

type VoteMap = Record<number, "Approve" | "Reject">;

type VoteAction =
  | { type: "TOGGLE"; memberId: number; vote: "Approve" | "Reject" }
  | { type: "RESET" };

function voteMapReducer(state: VoteMap, action: VoteAction): VoteMap {
  switch (action.type) {
    case "TOGGLE":
      if (state[action.memberId] === action.vote) {
        const next = { ...state };
        delete next[action.memberId];
        return next;
      }
      return { ...state, [action.memberId]: action.vote };
    case "RESET":
      return {};
    default:
      return state;
  }
}

const DocumentRequestVoteModal = ({
  open, requestId, detail, loadingDetail, recording, finalizing,
  loadDetail, recordVotes, finalize, onClose,
}: Props) => {
  const { t } = useTranslation();
  const [voteMap, dispatch] = useReducer(voteMapReducer, {});

  useEffect(() => {
    if (open && requestId) {
      dispatch({ type: "RESET" });
      loadDetail(requestId);
    }
  }, [open, requestId, loadDetail]);

  const existingVotes: VoteMap = {};
  if (detail?.votes) {
    detail.votes.forEach((v) => {
      if (v.committeeMemberId) {
        existingVotes[v.committeeMemberId] = v.vote;
      }
    });
  }

  const effectiveVotes = { ...existingVotes, ...voteMap };

  const getVotedCount = () => Object.keys(effectiveVotes).length;

  const handleVoteChange = (memberId: number, vote: "Approve" | "Reject") => {
    dispatch({ type: "TOGGLE", memberId, vote });
  };

  const handleRecord = async () => {
    if (!requestId) return;
    const entries = Object.entries(effectiveVotes).map(([id, vote]) => ({
      committeeMemberId: Number(id),
      vote,
    }));
    if (entries.length === 0) return;
    await recordVotes(requestId, entries);
  };

  const handleFinalize = async () => {
    if (!requestId) return;
    await finalize(requestId);
    onClose();
  };

  if (!open) return null;

  const totalMembers = detail?.committeeMembers?.length ?? 0;
  const approveCount = Object.values(effectiveVotes).filter((v) => v === "Approve").length;
  const rejectCount = Object.values(effectiveVotes).filter((v) => v === "Reject").length;
  const requestStatus = detail?.status;

  const getStatusLabel = (s?: string) => {
    if (s === "APPROVED") return t("documents.status_approved");
    if (s === "REJECTED") return t("documents.status_declined");
    if (s === "UPLOADED") return t("documents.status_uploaded");
    return t("documents.status_pending");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card" style={{ maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="d-flex align-items-center justify-content-between p-3 pb-2 border-bottom">
            <div>
              <h5 className="fw-bold mb-0 text-dark">{t("documents.modal_title_voting")}</h5>
              <p className="small text-muted mb-0 mt-1">
                {detail?.documentType ? getDocTypeLabel(detail.documentType, t) : t("documents.doc_request_default")}
                {detail?.customDocumentName && <span className="fw-medium text-dark ms-1">— {detail.customDocumentName}</span>}
              </p>
            </div>
            <button className="btn btn-sm btn-outline-secondary rounded-2 p-1" onClick={onClose} aria-label={t("common.close")}>
              <X size={18} />
            </button>
          </div>

          <div style={{ overflow: "auto", flex: 1 }}>
            {loadingDetail ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-dark" role="status" />
              </div>
            ) : detail ? (
              <div className="p-3">
                <div className="section-card p-3 mb-3">
                  <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                    <span className="d-inline-flex align-items-center gap-1 small text-muted">
                      <FileText size={14} /> {getDocTypeLabel(detail.documentType, t)}
                    </span>
                    {detail.apartment && (
                      <span className="d-inline-flex align-items-center gap-1 small text-muted">
                        <Building size={14} /> {detail.apartment.block}-{detail.apartment.floorNumber}{detail.apartment.unitNumber}
                      </span>
                    )}
                    {detail.requester && (
                      <span className="d-inline-flex align-items-center gap-1 small text-muted">
                        <User size={14} /> {detail.requester.user.name}
                      </span>
                    )}
                  </div>
                  {detail.note && <p className="small text-muted mb-0" style={{ fontSize: "0.8rem" }}>{detail.note}</p>}
                  <div className="mt-2">
                    <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-1" style={{ fontSize: "0.7rem" }}>
                      <Clock size={11} className="me-1" /> {getStatusLabel(requestStatus)}
                    </span>
                  </div>
                </div>

                <h6 className="fw-bold text-dark mb-2">{t("documents.committee_members_heading", { count: totalMembers })}</h6>

                {totalMembers === 0 ? (
                  <div className="section-card p-3 text-center">
                    <p className="small text-muted mb-0">{t("documents.no_committee_members")}</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2 mb-3">
                    {detail.committeeMembers.map((member) => {
                      const currentVote = effectiveVotes[member.id];
                      const memberName = member.fullName || t("documents.member_fallback", { id: member.id });

                      return (
                        <div key={member.id} className="section-card p-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="d-flex align-items-center justify-content-center rounded-2 bg-light" style={{ width: 34, height: 34 }}>
                              <User size={16} className="text-secondary" />
                            </div>
                            <div>
                              <span className="fw-medium text-dark small">{memberName}</span>
                            </div>
                          </div>
                          <div className="d-flex gap-1">
                            <button
                              className={`btn btn-sm d-inline-flex align-items-center gap-1 rounded-2 fw-medium px-3 ${currentVote === "Approve" ? "btn-success" : "btn-outline-success"}`}
                              style={{ fontSize: "0.78rem" }}
                              onClick={() => handleVoteChange(member.id, "Approve")}
                            >
                              <ThumbsUp size={13} /> {t("documents.approve")}
                            </button>
                            <button
                              className={`btn btn-sm d-inline-flex align-items-center gap-1 rounded-2 fw-medium px-3 ${currentVote === "Reject" ? "btn-danger" : "btn-outline-danger"}`}
                              style={{ fontSize: "0.78rem" }}
                              onClick={() => handleVoteChange(member.id, "Reject")}
                            >
                              <ThumbsDown size={13} /> {t("documents.reject")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {getVotedCount() > 0 && (
                  <div className="section-card p-3 mb-3 bg-light">
                    <div className="d-flex align-items-center gap-4">
                      <div className="text-center">
                        <div className="fw-bold text-success" style={{ fontSize: "1.4rem" }}>{approveCount}</div>
                        <small className="text-muted">{t("documents.approve")}</small>
                      </div>
                      <div className="text-center">
                        <div className="fw-bold text-danger" style={{ fontSize: "1.4rem" }}>{rejectCount}</div>
                        <small className="text-muted">{t("documents.reject")}</small>
                      </div>
                      <div className="text-center">
                        <div className="fw-bold text-dark" style={{ fontSize: "1.4rem" }}>{totalMembers}</div>
                        <small className="text-muted">{t("documents.total")}</small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex justify-content-center align-items-center py-5">
                <p className="text-muted">{t("documents.failed_load_detail")}</p>
              </div>
            )}
          </div>

          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 p-3 pt-2 border-top">
            {requestStatus === "APPROVED" ? (
              <span className="small text-success fw-semibold d-inline-flex align-items-center gap-1">
                <CheckCircle size={14} /> {t("documents.approved_ready_upload")}
              </span>
            ) : requestStatus === "REJECTED" ? (
              <span className="small text-danger fw-semibold d-inline-flex align-items-center gap-1">
                <ThumbsDown size={14} /> {t("documents.rejected_by_vote")}
              </span>
            ) : (
              <span className="small text-muted d-inline-flex align-items-center gap-1">
                <Clock size={14} /> {t("documents.voted_progress", { count: getVotedCount(), total: totalMembers })}
              </span>
            )}

            <div className="d-flex gap-2 w-100 w-sm-auto justify-content-end">
              {requestStatus === "PENDING" && (
                <button
                  className="btn btn-sm btn-dark d-inline-flex align-items-center gap-1 fw-semibold px-3 rounded-2"
                  onClick={handleRecord}
                  disabled={recording || getVotedCount() === 0}
                  style={{ minWidth: 130 }}
                >
                  {recording ? <Loader2 size={14} className="spinner" /> : <Send size={14} />}
                  {recording ? t("documents.saving") : t("documents.record_votes")}
                </button>
              )}
              <button
                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 fw-semibold px-3 rounded-2"
                onClick={handleFinalize}
                disabled={finalizing || (requestStatus !== "PENDING")}
                style={{ minWidth: 130 }}
              >
                {finalizing ? <Loader2 size={14} className="spinner" /> : <CheckCircle size={14} />}
                {finalizing ? t("documents.finalizing") : t("documents.finalize")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentRequestVoteModal;
