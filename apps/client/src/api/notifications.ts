import apiClient from './client';
import { ApiResponse } from '../types';

export interface Notification {
  _id: string;
  userId: string;
  type: 'task_assignment' | 'task_update' | 'comment' | 'mention' | 'project_update' | 'deadline_reminder' | 'team_invitation';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
}

export const notificationsApi = {
  getAll: async (unreadOnly?: boolean): Promise<any> => {
    const response = await apiClient.get('/notifications', {
      params: unreadOnly ? { unreadOnly: 'true' } : {},
    });
    return response.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.put<ApiResponse<{ message: string }>>('/notifications/read-all');
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/notifications/${id}`);
    return response.data;
  },

  deleteAll: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>('/notifications');
    return response.data;
  },
};

