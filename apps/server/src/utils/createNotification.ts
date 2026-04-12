import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

interface CreateNotificationParams {
  userId: mongoose.Types.ObjectId | string;
  type: 'task_assignment' | 'task_update' | 'comment' | 'mention' | 'project_update' | 'deadline_reminder' | 'team_invitation';
  title: string;
  message: string;
  link?: string;
}

export const createNotification = async (params: CreateNotificationParams): Promise<void> => {
  try {
    await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      read: false,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

