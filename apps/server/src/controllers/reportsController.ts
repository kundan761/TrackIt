import { Response, NextFunction } from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { AuthRequest } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format, subDays } from 'date-fns';

export const getReportsData = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;

  const projects = await Project.find({
    $or: [
      { createdBy: userId },
      { teamMembers: userId },
    ],
  });

  const tasks = await Task.find({
    $or: [
      { assignees: userId },
      { createdBy: userId },
      { projectId: { $in: projects.map((p) => p._id) } },
    ],
  });

  const taskStatusCounts = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    in_review: tasks.filter((t) => t.status === 'in_review').length,
    done: tasks.filter((t) => t.status === 'done').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
  };

  const taskStatusData = [
    { name: 'To Do', value: taskStatusCounts.todo },
    { name: 'In Progress', value: taskStatusCounts.in_progress },
    { name: 'In Review', value: taskStatusCounts.in_review },
    { name: 'Done', value: taskStatusCounts.done },
    { name: 'Blocked', value: taskStatusCounts.blocked },
  ].filter((item) => item.value > 0);

  const projectProgressData = await Promise.all(
    projects.map(async (project) => {
      const projectTasks = tasks.filter(
        (t) => String(t.projectId) === String(project._id)
      );
      const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
      const totalTasks = projectTasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        name: project.name,
        progress,
        totalTasks,
        completedTasks,
      };
    })
  );

  const taskPriorityData = [
    { name: 'Low', value: tasks.filter((t) => t.priority === 'low').length },
    { name: 'Medium', value: tasks.filter((t) => t.priority === 'medium').length },
    { name: 'High', value: tasks.filter((t) => t.priority === 'high').length },
    { name: 'Urgent', value: tasks.filter((t) => t.priority === 'urgent').length },
  ].filter((item) => item.value > 0);

  const tasksCompletedOverTime = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const completed = tasks.filter((t) => {
      if (t.status !== 'done' || !t.updatedAt) return false;
      const updatedAt = new Date(t.updatedAt);
      return updatedAt >= dayStart && updatedAt <= dayEnd;
    }).length;

    tasksCompletedOverTime.push({
      date: format(date, 'MMM d'),
      completed,
    });
  }

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'active').length,
    activeTasks: tasks.filter((t) => t.status !== 'done').length,
    completedTasks: tasks.filter((t) => t.status === 'done').length,
    completedTasksThisWeek: tasks.filter((t) => {
      if (t.status !== 'done' || !t.updatedAt) return false;
      const weekStart = startOfWeek(new Date());
      return new Date(t.updatedAt) >= weekStart;
    }).length,
    overdueTasks: tasks.filter((t) => {
      if (t.status === 'done' || !t.dueDate) return false;
      return new Date(t.dueDate) < startOfDay(new Date());
    }).length,
    teamSize: new Set(
      projects.flatMap((p) => [
        p.createdBy.toString(),
        ...p.teamMembers.map((m: any) => m.toString()),
      ])
    ).size,
  };

  res.status(200).json({
    success: true,
    data: {
      stats,
      taskStatusData,
      taskPriorityData,
      projectProgressData,
      tasksCompletedOverTime,
    },
  });
});

