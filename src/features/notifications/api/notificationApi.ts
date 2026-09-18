import api from '../../../config/api';
import type { PaginatedResult } from '../../../types/pagination.types';

export interface NotificationItem {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  messageKey?: string;
  data: {
    key?: string;
    params?: Record<string, unknown>;
    [key: string]: unknown;
  };
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (pageNumber = 1, pageSize = 10): Promise<PaginatedResult<NotificationItem>> => {
    const response = await api.get('/notifications', { params: { pageNumber, pageSize } });
    return response.data.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.data.count;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch('/notifications/read', { id });
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  deleteAll: async (): Promise<void> => {
    await api.delete('/notifications');
  },
};
