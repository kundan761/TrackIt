import apiClient from './client';
import { Event, ApiResponse } from '../types';

export const eventsApi = {
  getAll: async (params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<Event[]>> => {
    const response = await apiClient.get<ApiResponse<Event[]>>('/events', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Event>> => {
    const response = await apiClient.get<ApiResponse<Event>>(`/events/${id}`);
    return response.data;
  },

  create: async (data: Partial<Event>): Promise<ApiResponse<Event>> => {
    const response = await apiClient.post<ApiResponse<Event>>('/events', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Event>): Promise<ApiResponse<Event>> => {
    const response = await apiClient.put<ApiResponse<Event>>(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{}>> => {
    const response = await apiClient.delete<ApiResponse<{}>>(`/events/${id}`);
    return response.data;
  },
};

