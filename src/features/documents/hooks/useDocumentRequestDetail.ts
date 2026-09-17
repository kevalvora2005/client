import { useCallback, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { documentRequestApi } from '../api/documentRequestApi';
import type { DocumentRequestDetail } from '../types/documentRequest.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError, showSuccess } from '../../../utils/toast';
import useAuth from '../../../hooks/useAuth';

type VoteChoice = 'Approve' | 'Reject';

type DraftAction =
  | { type: 'TOGGLE'; memberId: number; vote: VoteChoice }
  | { type: 'INIT'; votes: Record<number, VoteChoice> }
  | { type: 'RESET' };

function draftReducer(state: Record<number, VoteChoice>, action: DraftAction) {
  switch (action.type) {
    case 'TOGGLE':
      if (state[action.memberId] === action.vote) {
        const next = { ...state };
        delete next[action.memberId];
        return next;
      }
      return { ...state, [action.memberId]: action.vote };
    case 'INIT':
      return action.votes;
    case 'RESET':
      return {};
    default:
      return state;
  }
}

const useDocumentRequestDetail = (id: number) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState<DocumentRequestDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [draftVotes, dispatch] = useReducer(draftReducer, {});
  const [draftAdminVote, setDraftAdminVote] = useState<VoteChoice | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const result = await documentRequestApi.getDetail(id);
        if (!mounted) return;
        setData(result);

        const draft: Record<number, VoteChoice> = {};
        let admin: VoteChoice | null = null;
        for (const v of result.votes) {
          if (v.committeeMemberId != null) {
            draft[v.committeeMemberId] = v.vote;
          } else {
            admin = v.vote;
          }
        }
        dispatch({ type: 'INIT', votes: draft });
        setDraftAdminVote(admin);
      } catch (err: unknown) {
        if (!mounted) return;
        showError(getErrorMessage(err, t('documents.toast_fetch_request_failed')));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, t]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await documentRequestApi.getDetail(id);
      setData(result);

      const draft: Record<number, VoteChoice> = {};
      let admin: VoteChoice | null = null;
      for (const v of result.votes) {
        if (v.committeeMemberId != null) {
          draft[v.committeeMemberId] = v.vote;
        } else {
          admin = v.vote;
        }
      }
      dispatch({ type: 'INIT', votes: draft });
      setDraftAdminVote(admin);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('documents.toast_fetch_request_failed')));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const setMemberVote = useCallback((committeeMemberId: number, vote: VoteChoice) => {
    dispatch({ type: 'TOGGLE', memberId: committeeMemberId, vote });
  }, []);

  const setAdminVote = useCallback((vote: VoteChoice) => {
    setDraftAdminVote((prev) => prev === vote ? null : vote);
  }, []);

  const finalize = useCallback(async () => {
    setActionLoading(true);
    try {
      if (!data) return;

      const votes = data.committeeMembers
        .filter((m) => draftVotes[m.id] != null)
        .map((m) => ({ committeeMemberId: m.id, vote: draftVotes[m.id] as VoteChoice }));

      await documentRequestApi.bulkRecordVotes(id, votes, draftAdminVote ?? undefined);
      const result = await documentRequestApi.finalizeRequest(id);
      showSuccess(result.status === 'APPROVED' ? t('documents.toast_request_approved') : t('documents.toast_request_rejected'));
      await load();
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('documents.toast_finalize_failed')));
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [id, data, draftVotes, draftAdminVote, load, t]);

  return {
    data,
    loading,
    actionLoading,
    draftVotes,
    draftAdminVote,
    setMemberVote,
    setAdminVote,
    finalize,
    refetch: load,
    isAdmin,
  };
};

export default useDocumentRequestDetail;
