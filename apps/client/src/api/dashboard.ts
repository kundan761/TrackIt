import apiClient from './client';
import { ApiResponse } from '../types';

export interface DashboardData {
  stats: {
    totalProjects: number;
    activeTasks: number;
    completedTasksThisWeek: number;
    overdueTasks: number;
    teamSize: number;
  };
  projects: any[];
  tasks: any[];
  urgentTasks: any[];
  upcomingEvents: any[];
  teamMembers: any[];
}

export const dashboardApi = {
  getDashboardData: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>('/dashboard');
    return response.data;
  },
};

