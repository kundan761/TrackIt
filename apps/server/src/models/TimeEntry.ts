import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeEntry extends Document {
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  description?: string;
  createdAt: Date;
}

const timeEntrySchema = new Schema<ITimeEntry>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

timeEntrySchema.index({ taskId: 1, userId: 1, createdAt: -1 });

export default mongoose.model<ITimeEntry>('TimeEntry', timeEntrySchema);

