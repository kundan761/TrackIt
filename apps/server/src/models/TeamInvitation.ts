import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamInvitation extends Document {
  email: string;
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  token: string;
  expiresAt: Date;
  role?: 'admin' | 'manager' | 'member' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

const teamInvitationSchema = new Schema<ITeamInvitation>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'member', 'viewer'],
      default: 'member',
    },
  },
  {
    timestamps: true,
  }
);

teamInvitationSchema.index({ email: 1, status: 1 });
teamInvitationSchema.index({ expiresAt: 1 });
teamInvitationSchema.pre('save', function (next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

export default mongoose.model<ITeamInvitation>('TeamInvitation', teamInvitationSchema);

