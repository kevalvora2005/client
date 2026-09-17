import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tenantRequestApi } from '../api/tenantRequestApi';
import type {
  TenantRequestDetail as TenantRequestDetailData,
  VoteChoice,
  BulkVoteEntry,
} from '../types/tenantRequest.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError, showSuccess } from '../../../utils/toast';
import useAuth from '../../../hooks/useAuth';

const useTenantRequestDetail = (id: number) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState<TenantRequestDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Local draft of votes collected on the frontend before finalize.
  // Keyed by committee member id; admin vote stored separately.
  const [draftVotes, setDraftVotes] = useState<Record<number, VoteChoice>>({});
  const [draftAdminVote, setDraftAdminVote] = useState<VoteChoice | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await tenantRequestApi.getTenantRequest(id);
      setData(result);

      // Pre-fill the draft from any votes already persisted on the server
      const draft: Record<number, VoteChoice> = {};
      let adminVote: VoteChoice | null = null;
      for (const v of result.votes) {
        if (v.committeeMemberId != null) {
          draft[v.committeeMemberId] = v.vote;
        } else {
          adminVote = v.vote;
        }
      }
      setDraftVotes(draft);
      setDraftAdminVote(adminVote);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('tenantRequests.toast_fetch_failed')));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    let cancelled = false;
    const runLoad = async () => {
      setLoading(true);
      try {
        const result = await tenantRequestApi.getTenantRequest(id);
        if (!cancelled) {
          setData(result);
          const draft: Record<number, VoteChoice> = {};
          let adminVote: VoteChoice | null = null;
          for (const v of result.votes) {
            if (v.committeeMemberId != null) {
              draft[v.committeeMemberId] = v.vote;
            } else {
              adminVote = v.vote;
            }
          }
          setDraftVotes(draft);
          setDraftAdminVote(adminVote);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          showError(getErrorMessage(err, t('tenantRequests.toast_fetch_failed')));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    runLoad();
    return () => { cancelled = true; };
  }, [id, t]);

  const setMemberVote = useCallback((committeeMemberId: number, vote: VoteChoice) => {
    setDraftVotes((prev) => ({ ...prev, [committeeMemberId]: vote }));
  }, []);

  const setAdminVote = useCallback((vote: VoteChoice) => {
    setDraftAdminVote(vote);
  }, []);

  const saveVotes = useCallback(async (): Promise<void> => {
    if (!data) return;

    const votes: BulkVoteEntry[] = data.committeeMembers
      .filter((m) => draftVotes[m.id] != null)
      .map((m) => ({ committeeMemberId: m.id, vote: draftVotes[m.id] }));

    await tenantRequestApi.saveVotes(id, {
      votes,
      adminVote: draftAdminVote ?? undefined,
    });
  }, [id, data, draftVotes, draftAdminVote]);

  const finalize = useCallback(async () => {
    setActionLoading(true);
    try {
      // Persist all collected votes first, then finalize (lock) the request.
      await saveVotes();
      const result = await tenantRequestApi.finalizeRequest(id);
      showSuccess(result.approved ? t('tenantRequests.toast_request_approved') : t('tenantRequests.toast_request_rejected'));
      await load();
      return result;
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('tenantRequests.toast_finalize_failed')));
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [id, saveVotes, load, t]);

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

export default useTenantRequestDetail;
