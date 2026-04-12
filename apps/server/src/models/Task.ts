import mongoose, { Schema, Document } from 'mongoose';

export interface ISubtask {
  title: string;
  completed: boolean;
}

export interface IComment extends Document {
  content: string;
  userId: mongoose.Types.ObjectId;
  mentions: mongoose.Types.ObjectId[];
  attachments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId: mongoose.Types.ObjectId;
  assignees: mongoose.Types.ObjectId[];
  dueDate?: Date;
  estimatedTime?: number;
  actualTime?: number;
  tags: string[];
  dependencies: mongoose.Types.ObjectId[];
  subtasks: ISubtask[];
  comments: IComment[];
  attachments: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subtaskSchema = new Schema<ISubtask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'File',
      },
    ],
  },
  {
    timestamps: true,
    _id: true,
  }
);

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'in_review', 'done', 'blocked'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dueDate: {
      type: Date,
    },
    estimatedTime: {
      type: Number,
    },
    actualTime: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    dependencies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    subtasks: [subtaskSchema],
    comments: [commentSchema],
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'File',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>('Task', taskSchema);

