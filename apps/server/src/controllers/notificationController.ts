import { Response, NextFunction } from 'express';
import Notification from '../models/Notification.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../types/index.js';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;
  const { unreadOnly } = req.query;

  const query: any = { userId };
  if (unreadOnly === 'true') {
    query.read = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ userId, read: false });

  res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
  });
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const notification = await Notification.findOne({ _id: id, userId });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification,
  });
});

export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;

  await Notification.updateMany(
    { userId, read: false },
    { read: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

export const deleteNotification = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const notification = await Notification.findOne({ _id: id, userId });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
});

export const deleteAllNotifications = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;

  await Notification.deleteMany({ userId });

  res.status(200).json({
    success: true,
    message: 'All notifications deleted',
  });
});

