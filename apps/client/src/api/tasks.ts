import apiClient from './client';
import { Task, ApiResponse } from '../types';

export const tasksApi = {
  getAll: async (params?: {
    projectId?: string;
    status?: string;
    assignee?: string;
    priority?: string;
    search?: string;
  }): Promise<ApiResponse<Task[]>> => {
    const response = await apiClient.get<ApiResponse<Task[]>>('/tasks', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: Partial<Task>): Promise<ApiResponse<Task>> => {
    const response = await apiClient.post<ApiResponse<Task>>('/tasks', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Task>): Promise<ApiResponse<Task>> => {
    const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{}>> => {
    const response = await apiClient.delete<ApiResponse<{}>>(`/tasks/${id}`);
    return response.data;
  },
};

