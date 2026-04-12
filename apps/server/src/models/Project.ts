import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  startDate?: Date;
  endDate?: Date;
  color: string;
  coverImage?: string;
  createdBy: mongoose.Types.ObjectId;
  teamMembers: mongoose.Types.ObjectId[];
  settings?: {
    defaultView: 'list' | 'board' | 'timeline';
    allowPublicAccess: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'archived'],
      default: 'active',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    coverImage: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    settings: {
      defaultView: {
        type: String,
        enum: ['list', 'board', 'timeline'],
        default: 'board',
      },
      allowPublicAccess: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>('Project', projectSchema);

