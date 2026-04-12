import { Response, NextFunction } from 'express';
import User from '../models/User.js';
import TeamInvitation from '../models/TeamInvitation.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../types/index.js';
import { generateToken } from '../utils/generateToken.js';
import { sendEmail, emailTemplates } from '../utils/emailService.js';
import { createNotification } from '../utils/createNotification.js';
import crypto from 'crypto';
import { config } from '../config/index.js';

export const inviteTeamMember = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { email, role } = req.body;
  const invitedBy = req.user!._id;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }
  const existingInvitation = await TeamInvitation.findOne({
    email: email.toLowerCase(),
    status: 'pending',
    expiresAt: { $gt: new Date() },
  });

  if (existingInvitation) {
    return next(new AppError('An invitation has already been sent to this email', 400));
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await TeamInvitation.create({
    email: email.toLowerCase(),
    invitedBy,
    token,
    expiresAt,
    role: role || 'member',
    status: 'pending',
  });

  try {
    const frontendUrl = config.get('server.frontend_url');
    const inviteUrl = `${frontendUrl}/invite/${token}`;
    const inviter = await User.findById(invitedBy);
    const inviterName = inviter?.name || 'Team Admin';
    
    await sendEmail({
      to: email,
      subject: `You've been invited to join ${inviterName}'s team on TrackIt`,
      html: emailTemplates.teamInvitation(inviteUrl, inviterName, role || 'team_member'),
    });
  } catch (emailError) {
    console.error('Failed to send invitation email:', emailError);
  }

  res.status(201).json({
    success: true,
    message: 'Invitation sent successfully',
    data: {
      invitation: {
        _id: invitation._id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        role: invitation.role,
      },
      token: config.get('server.node_env', 'development') === 'development' ? token : undefined,
    },
  });
});

export const getInvitations = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const invitations = await TeamInvitation.find({
    invitedBy: req.user!._id,
  })
    .populate('invitedBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: invitations.length,
    data: invitations,
  });
});

export const acceptInvitation = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { name, password } = req.body;

  if (!name || !password) {
    return next(new AppError('Name and password are required', 400));
  }

  const invitation = await TeamInvitation.findOne({
    token,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  });

  if (!invitation) {
    return next(new AppError('Invalid or expired invitation token', 400));
  }

  const existingUser = await User.findOne({ email: invitation.email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }
  const user = await User.create({
    name,
    email: invitation.email,
    password,
    role: invitation.role,
  });

  invitation.status = 'accepted';
  await invitation.save();

  try {
    const inviter = await User.findById(invitation.invitedBy);
    if (inviter) {
      await sendEmail({
        to: inviter.email,
        subject: `${name} accepted your team invitation`,
        html: emailTemplates.invitationAccepted(name, inviter.name),
      });

      await createNotification({
        userId: invitation.invitedBy,
        type: 'team_invitation',
        title: 'Invitation Accepted',
        message: `${name} accepted your team invitation and joined your team`,
        link: '/team',
      });
    }
  } catch (emailError) {
    console.error('Failed to send acceptance notification email:', emailError);
  }

  const authToken = generateToken(user._id.toString());

  res.status(201).json({
    success: true,
    message: 'Account created and invitation accepted',
    token: authToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const cancelInvitation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const invitation = await TeamInvitation.findById(id);

  if (!invitation) {
    return next(new AppError('Invitation not found', 404));
  }

  if (invitation.invitedBy.toString() !== req.user!._id.toString()) {
    return next(new AppError('Not authorized to cancel this invitation', 403));
  }
  if (invitation.status !== 'pending') {
    return next(new AppError('Can only cancel pending invitations', 400));
  }

  await invitation.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Invitation cancelled successfully',
  });
});

export const resendInvitation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const invitation = await TeamInvitation.findById(id);

  if (!invitation) {
    return next(new AppError('Invitation not found', 404));
  }

  if (invitation.invitedBy.toString() !== req.user!._id.toString()) {
    return next(new AppError('Not authorized to resend this invitation', 403));
  }
  if (invitation.status !== 'pending') {
    return next(new AppError('Can only resend pending invitations', 400));
  }

  const token = crypto.randomBytes(32).toString('hex');
  invitation.token = token;
  invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await invitation.save();
  try {
    const frontendUrl = config.get('server.frontend_url');
    const inviteUrl = `${frontendUrl}/invite/${token}`;
    const inviter = await User.findById(req.user!._id);
    const inviterName = inviter?.name || 'Team Admin';
    
    await sendEmail({
      to: invitation.email,
      subject: `You've been invited to join ${inviterName}'s team on TrackIt`,
      html: emailTemplates.teamInvitation(inviteUrl, inviterName, invitation.role as string),
    });
  } catch (emailError) {
    console.error('Failed to resend invitation email:', emailError);
  }

  res.status(200).json({
    success: true,
    message: 'Invitation resent successfully',
    data: {
      invitation: {
        _id: invitation._id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      },
      token: config.get('server.node_env', 'development') === 'development' ? token : undefined,
    },
  });
});

