import { Response, NextFunction } from 'express';
import Event from '../models/Event.js';
import { AuthRequest } from '../types/index.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

export const getEvents = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;
  const { startDate, endDate } = req.query;

  const query: any = {
    $or: [
      { createdBy: userId },
      { attendees: userId },
    ],
  };

  if (startDate && endDate) {
    query.startTime = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string),
    };
  }

  const events = await Event.find(query)
    .populate('createdBy', 'name email avatar')
    .populate('attendees', 'name email avatar')
    .sort({ startTime: 1 });

  res.status(200).json({
    success: true,
    data: events,
  });
});

export const getEvent = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const event = await Event.findById(req.params.id)
    .populate('createdBy', 'name email avatar')
    .populate('attendees', 'name email avatar');

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  res.status(200).json({
    success: true,
    data: event,
  });
});

export const createEvent = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const event = await Event.create({
    ...req.body,
    createdBy: req.user!._id,
  });

  const populatedEvent = await Event.findById(event._id)
    .populate('createdBy', 'name email avatar')
    .populate('attendees', 'name email avatar');

  res.status(201).json({
    success: true,
    data: populatedEvent,
  });
});

export const updateEvent = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('createdBy', 'name email avatar')
    .populate('attendees', 'name email avatar');

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  res.status(200).json({
    success: true,
    data: event,
  });
});

export const deleteEvent = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

