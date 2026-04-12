import apiClient from './client';
import { Project, ApiResponse } from '../types';

export const projectsApi = {
  getAll: async (params?: { status?: string; search?: string }): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get<ApiResponse<Project[]>>('/projects', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: Partial<Project>): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Project>): Promise<ApiResponse<Project>> => {
    const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{}>> => {
    const response = await apiClient.delete<ApiResponse<{}>>(`/projects/${id}`);
    return response.data;
  },

  addTeamMember: async (id: string, email: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post<ApiResponse<Project>>(`/projects/${id}/members`, { email });
    return response.data;
  },

  removeTeamMember: async (id: string, userId: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.delete<ApiResponse<Project>>(`/projects/${id}/members/${userId}`);
    return response.data;
  },
};

