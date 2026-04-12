import { Response, NextFunction } from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { AuthRequest } from '../types/index.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { createNotification } from '../utils/createNotification.js';

export const getTasks = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;
  const { projectId, status, assignee, priority, search } = req.query;

  const query: any = {
    $or: [
      { createdBy: userId },
      { assignees: userId },
      { projectId: { $in: await Project.find({ teamMembers: userId }).distinct('_id') } },
    ],
  };

  if (projectId) {
    query.projectId = projectId;
  }

  if (status) {
    query.status = status;
  }

  if (assignee) {
    query.assignees = assignee;
  }

  if (priority) {
    query.priority = priority;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const tasks = await Task.find(query)
    .populate('projectId', 'name color')
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('comments.userId', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: tasks,
  });
});

export const getTask = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const task = await Task.findById(req.params.id)
    .populate('projectId', 'name color')
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('comments.userId', 'name email avatar');

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

export const createTask = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const task = await Task.create({
    ...req.body,
    createdBy: req.user!._id,
  });

  const populatedTask = await Task.findById(task._id)
    .populate('projectId', 'name color')
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  if (populatedTask?.assignees && Array.isArray(populatedTask.assignees) && populatedTask.assignees.length > 0) {
    const assigneeIds = populatedTask.assignees.map((assignee: any) => 
      typeof assignee === 'object' ? assignee._id : assignee
    );
    const creatorId = req.user!._id.toString();
    
    for (const assigneeId of assigneeIds) {
      if (assigneeId.toString() !== creatorId) {
        await createNotification({
          userId: assigneeId,
          type: 'task_assignment',
          title: 'New Task Assigned',
          message: `${req.user!.name} assigned you a task: ${populatedTask.title}`,
          link: `/tasks?task=${populatedTask._id}`,
        });
      }
    }
  }

  res.status(201).json({
    success: true,
    data: populatedTask,
  });
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const oldTask = await Task.findById(req.params.id);
  
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('projectId', 'name color')
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('comments.userId', 'name email avatar');

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  if (task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0) {
    const assigneeIds = task.assignees.map((assignee: any) => 
      typeof assignee === 'object' ? assignee._id : assignee
    );
    const updaterId = req.user!._id.toString();
    
    if (req.body.status && oldTask && oldTask.status !== req.body.status) {
      for (const assigneeId of assigneeIds) {
        if (assigneeId.toString() !== updaterId) {
          await createNotification({
            userId: assigneeId,
            type: 'task_update',
            title: 'Task Status Updated',
            message: `${req.user!.name} updated task "${task.title}" status to ${req.body.status}`,
            link: `/tasks?task=${task._id}`,
          });
        }
      }
    }

    if (req.body.assignees && Array.isArray(req.body.assignees)) {
      const oldAssigneeIds = oldTask?.assignees 
        ? oldTask.assignees.map((a: any) => (typeof a === 'object' ? a._id : a).toString())
        : [];
      const newAssigneeIds = req.body.assignees.map((a: any) => (typeof a === 'object' ? a._id : a).toString());
      
      const newlyAssigned = newAssigneeIds.filter((id: string) => !oldAssigneeIds.includes(id));
      for (const assigneeId of newlyAssigned) {
        if (assigneeId !== updaterId) {
          await createNotification({
            userId: assigneeId,
            type: 'task_assignment',
            title: 'Task Assigned',
            message: `${req.user!.name} assigned you a task: ${task.title}`,
            link: `/tasks?task=${task._id}`,
          });
        }
      }
    }
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

