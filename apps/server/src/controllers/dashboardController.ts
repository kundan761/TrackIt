import { Response, NextFunction } from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { AuthRequest } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export const getDashboardData = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;

  const projects = await Project.find({
    $or: [
      { createdBy: userId },
      { teamMembers: userId },
    ],
  })
    .populate('teamMembers', 'name email avatar')
    .limit(5)
    .sort({ updatedAt: -1 });

  const tasks = await Task.find({
    $or: [
      { assignees: userId },
      { createdBy: userId },
    ],
  })
    .populate('projectId', 'name color')
    .sort({ dueDate: 1, priority: -1 })
    .limit(10);

  const today = startOfDay(new Date());
  const urgentTasks = await Task.find({
    $or: [
      { assignees: userId },
      { createdBy: userId },
    ],
    status: { $ne: 'done' },
    dueDate: { $lte: endOfDay(today) },
  })
    .populate('projectId', 'name color')
    .populate('assignees', 'name email avatar')
    .sort({ dueDate: 1 })
    .limit(5);

  const sevenDaysFromNow = endOfDay(subDays(new Date(), -7));
  const upcomingEvents = await Event.find({
    $or: [
      { createdBy: userId },
      { attendees: userId },
    ],
    startTime: {
      $gte: new Date(),
      $lte: sevenDaysFromNow,
    },
  })
    .populate('createdBy', 'name email avatar')
    .populate('attendees', 'name email avatar')
    .sort({ startTime: 1 })
    .limit(5);

  const teamMemberIds = new Set<string>();
  projects.forEach((project) => {
    project.teamMembers.forEach((member: any) => {
      teamMemberIds.add(member._id.toString());
    });
    if (project.createdBy) {
      teamMemberIds.add(project.createdBy.toString());
    }
  });

  const teamMembers = await User.find({
    _id: { $in: Array.from(teamMemberIds) },
  })
    .select('name email avatar role')
    .limit(8);

  const totalProjects = await Project.countDocuments({
    $or: [
      { createdBy: userId },
      { teamMembers: userId },
    ],
  });

  const activeTasks = await Task.countDocuments({
    $or: [
      { assignees: userId },
      { createdBy: userId },
    ],
    status: { $ne: 'done' },
  });

  const completedTasksThisWeek = await Task.countDocuments({
    $or: [
      { assignees: userId },
      { createdBy: userId },
    ],
    status: 'done',
    updatedAt: {
      $gte: subDays(new Date(), 7),
    },
  });

  const overdueTasks = await Task.countDocuments({
    $or: [
      { assignees: userId },
      { createdBy: userId },
    ],
    status: { $ne: 'done' },
    dueDate: { $lt: startOfDay(new Date()) },
  });

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalProjects,
        activeTasks,
        completedTasksThisWeek,
        overdueTasks,
        teamSize: teamMemberIds.size,
      },
      projects,
      tasks,
      urgentTasks,
      upcomingEvents,
      teamMembers,
    },
  });
});

