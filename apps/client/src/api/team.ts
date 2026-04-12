import apiClient from './client';
import { ApiResponse } from '../types';

export interface TeamInvitation {
  _id: string;
  email: string;
  invitedBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  token: string;
  expiresAt: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  createdAt: string;
  updatedAt: string;
}

export interface InviteTeamMemberData {
  email: string;
  role?: 'admin' | 'manager' | 'member' | 'viewer';
}

export const teamApi = {
  inviteMember: async (data: InviteTeamMemberData): Promise<ApiResponse<{ invitation: TeamInvitation; token?: string }>> => {
    const response = await apiClient.post<ApiResponse<{ invitation: TeamInvitation; token?: string }>>('/team/invite', data);
    return response.data;
  },

  getInvitations: async (): Promise<ApiResponse<TeamInvitation[]>> => {
    const response = await apiClient.get<ApiResponse<TeamInvitation[]>>('/team/invitations');
    return response.data;
  },

  cancelInvitation: async (id: string): Promise<ApiResponse<{}>> => {
    const response = await apiClient.delete<ApiResponse<{}>>(`/team/invitations/${id}`);
    return response.data;
  },

  resendInvitation: async (id: string): Promise<ApiResponse<{ invitation: TeamInvitation; token?: string }>> => {
    const response = await apiClient.post<ApiResponse<{ invitation: TeamInvitation; token?: string }>>(`/team/invitations/${id}/resend`);
    return response.data;
  },

  acceptInvitation: async (token: string, data: { name: string; password: string }): Promise<ApiResponse<{ token: string; user: any }>> => {
    const response = await apiClient.post<ApiResponse<{ token: string; user: any }>>(`/team/accept-invitation/${token}`, data);
    return response.data;
  },
};

