import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { visitorApi } from '../api/visitorApi';
import type { Visitor } from '../types/visitor.types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';
import useSocket from '../../../hooks/useSocket';
import { SOCKET_EVENTS } from '../../../services/socket';

export const useVisitorSearch = () => {
  const { t } = useTranslation();
  const socket = useSocket();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const data = await visitorApi.searchByNameOrPhone(searchQuery.trim());
      setResults(data);
    } catch (err: unknown) {
      showError(getErrorMessage(err, t('visitors.search_failed')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await visitorApi.searchByNameOrPhone(query.trim());
        if (!cancelled) setResults(data);
      } catch (err: unknown) {
        if (!cancelled) showError(getErrorMessage(err, t('visitors.search_failed')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, t]);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => {
      visitorApi.searchByNameOrPhone(query.trim()).then((data) => setResults(data)).catch(() => {});
    };
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleRefresh);
    socket.on(SOCKET_EVENTS.VISITOR_UPDATED, handleRefresh);
    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleRefresh);
      socket.off(SOCKET_EVENTS.VISITOR_UPDATED, handleRefresh);
    };
  }, [socket, query]);

  return { query, setQuery, results, loading, search };
};