import apiClient from './client';
import { ApiResponse } from '../types';

export interface ReportsData {
  stats: {
    totalProjects: number;
    activeProjects: number;
    activeTasks: number;
    completedTasks: number;
    completedTasksThisWeek: number;
    overdueTasks: number;
    teamSize: number;
  };
  taskStatusData: { name: string; value: number }[];
  taskPriorityData: { name: string; value: number }[];
  projectProgressData: { name: string; progress: number; totalTasks: number; completedTasks: number }[];
  tasksCompletedOverTime: { date: string; completed: number }[];
}

export const reportsApi = {
  getReportsData: async (): Promise<ApiResponse<ReportsData>> => {
    const response = await apiClient.get<ApiResponse<ReportsData>>('/reports');
    return response.data;
  },
};

