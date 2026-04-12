export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'project_manager' | 'team_member' | 'viewer';
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  taskAssignments: boolean;
  taskUpdates: boolean;
  comments: boolean;
  mentions: boolean;
  projectUpdates: boolean;
  deadlineReminders: boolean;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  startDate?: Date;
  endDate?: Date;
  color: string;
  coverImage?: string;
  createdBy: string | User;
  teamMembers: (string | User)[];
  settings?: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectSettings {
  defaultView: 'list' | 'board' | 'timeline';
  allowPublicAccess: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string | Project;
  assignees: (string | User)[];
  dueDate?: Date;
  estimatedTime?: number;
  actualTime?: number;
  tags: string[];
  dependencies: string[];
  subtasks: Subtask[];
  comments: Comment[];
  attachments: FileAttachment[];
  createdBy: string | User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Comment {
  _id: string;
  content: string;
  taskId?: string;
  projectId?: string;
  userId: string | User;
  mentions: (string | User)[];
  attachments: FileAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FileAttachment {
  _id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string | User;
  createdAt: Date;
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  attendees: (string | User)[];
  location?: string;
  reminders: Reminder[];
  createdBy: string | User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  type: 'email' | 'push' | 'in_app';
  minutesBefore: number;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'task_assignment' | 'task_update' | 'comment' | 'mention' | 'project_update' | 'deadline_reminder' | 'team_invitation';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

export interface TimeEntry {
  _id: string;
  taskId: string;
  userId: string | User;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  description?: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

