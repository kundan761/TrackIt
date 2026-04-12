import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder {
  type: 'email' | 'push' | 'in_app';
  minutesBefore: number;
}

export interface IEvent extends Document {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  attendees: mongoose.Types.ObjectId[];
  location?: string;
  reminders: IReminder[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    type: {
      type: String,
      enum: ['email', 'push', 'in_app'],
      required: true,
    },
    minutesBefore: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    location: {
      type: String,
      trim: true,
    },
    reminders: [reminderSchema],
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

export default mongoose.model<IEvent>('Event', eventSchema);

