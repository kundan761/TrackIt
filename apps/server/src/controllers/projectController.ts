import { Response, NextFunction } from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { AuthRequest } from '../types/index.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

export const getProjects = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;
  const { status, search } = req.query;

  const query: any = {
    $or: [
      { createdBy: userId },
      { teamMembers: userId },
    ],
  };

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const projects = await Project.find(query)
    .populate('createdBy', 'name email avatar')
    .populate('teamMembers', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: projects,
  });
});

export const getProject = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email avatar')
    .populate('teamMembers', 'name email avatar');

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const userId = req.user!._id;
  if (
    project.createdBy.toString() !== userId.toString() &&
    !project.teamMembers.some((member: any) => member._id.toString() === userId.toString())
  ) {
    return next(new AppError('Not authorized to access this project', 403));
  }

  res.status(200).json({
    success: true,
    data: project,
  });
});

export const createProject = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const project = await Project.create({
    ...req.body,
    createdBy: req.user!._id,
  });

  const populatedProject = await Project.findById(project._id)
    .populate('createdBy', 'name email avatar')
    .populate('teamMembers', 'name email avatar');

  res.status(201).json({
    success: true,
    data: populatedProject,
  });
});

export const updateProject = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const userId = req.user!._id;
  if (project.createdBy.toString() !== userId.toString()) {
    return next(new AppError('Not authorized to update this project', 403));
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('createdBy', 'name email avatar')
    .populate('teamMembers', 'name email avatar');

  res.status(200).json({
    success: true,
    data: project,
  });
});

export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const userId = req.user!._id;
  if (project.createdBy.toString() !== userId.toString()) {
    return next(new AppError('Not authorized to delete this project', 403));
  }

  await Project.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});

export const addTeamMember = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { email } = req.body;
  const projectId = req.params.id;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const userId = req.user!._id;
  if (project.createdBy.toString() !== userId.toString()) {
    return next(new AppError('Not authorized to add members to this project', 403));
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (project.teamMembers.includes(user._id)) {
    return next(new AppError('User is already a team member', 400));
  }

  project.teamMembers.push(user._id);
  await project.save();

  const populatedProject = await Project.findById(projectId)
    .populate('createdBy', 'name email avatar')
    .populate('teamMembers', 'name email avatar');

  res.status(200).json({
    success: true,
    data: populatedProject,
  });
});

export const removeTeamMember = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const projectId = req.params.id;

  const project = await Project.findById(projectId);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const currentUserId = req.user!._id;
  if (project.createdBy.toString() !== currentUserId.toString()) {
    return next(new AppError('Not authorized to remove members from this project', 403));
  }

  project.teamMembers = project.teamMembers.filter(
    (memberId: any) => memberId.toString() !== userId
  );
  await project.save();

  const populatedProject = await Project.findById(projectId)
    .populate('createdBy', 'name email avatar')
    .populate('teamMembers', 'name email avatar');

  res.status(200).json({
    success: true,
    data: populatedProject,
  });
});

