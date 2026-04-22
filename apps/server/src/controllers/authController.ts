import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../types/index.js';
import crypto from 'crypto';
import { upload, deleteImage, extractPublicId } from '../utils/cloudinary.js';
import { config } from '../config/index.js';

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError('User already exists', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  res.status(201).json({
    success: true,
    token,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  const token = generateToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  res.status(200).json({
    success: true,
    token,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      preferences: user.preferences,
    },
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      preferences: user.preferences,
    },
  });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, email } = req.body;
  const userId = req.user!._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const originalRole = user.role;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return next(new AppError('Email already in use', 400));
      }
      user.email = email;
    }

    if (name !== undefined && name !== null && name.trim() !== '') {
      user.name = name.trim();
    }

    const validRoles = ['admin', 'manager', 'member', 'viewer'];
    if (!validRoles.includes(originalRole)) {
      if (config.get('server.node_env', 'development') === 'development') {
        console.warn(`Invalid role detected: ${originalRole}. Setting to default: member`);
      }
      user.role = 'member';
    } else {
      user.role = originalRole;
    }

    await user.save();

    const updatedUser = await User.findById(userId);

    if (!updatedUser) {
      return next(new AppError('Failed to retrieve updated user', 500));
    }

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        preferences: updatedUser.preferences,
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return next(new AppError(messages.join(', '), 400));
    }
    if (error.code === 11000) {
      return next(new AppError('Email already in use', 400));
    }
    return next(new AppError(error.message || 'Failed to update profile', 500));
  }
});

export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }

  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const originalRole = user.role;
    const validRoles = ['admin', 'manager', 'member', 'viewer'];
    if (!validRoles.includes(originalRole)) {
      user.role = 'member';
    } else {
      user.role = originalRole;
    }

    const cloudName = config.get('server.cloudinary_cloud_name');
    const apiKey = config.get('server.cloudinary_api_key');
    const apiSecret = config.get('server.cloudinary_api_secret');
    
    if (!cloudName || !apiKey || !apiSecret) {
      return next(new AppError('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your env.yaml.', 500));
    }
    
    const fileInfo = req.file as any;
    
    if (fileInfo.buffer && !fileInfo.path && !fileInfo.secure_url && !fileInfo.url) {
      return next(new AppError('Cloudinary storage is not properly configured. Please check your Cloudinary credentials.', 500));
    }
    
    let avatarUrl = fileInfo.path;
    
    if (!avatarUrl) {
      avatarUrl = fileInfo.secure_url || fileInfo.url;
    }
    
    if (!avatarUrl && fileInfo.result) {
      avatarUrl = fileInfo.result.secure_url || fileInfo.result.url;
    }
    
    if (!avatarUrl) {
      if (config.get('server.node_env', 'development') === 'development') {
        console.error('Cloudinary upload failed - file object:', JSON.stringify(fileInfo, null, 2));
      }
      return next(new AppError('Failed to get image URL from Cloudinary. The file may not have been uploaded successfully. Please check your Cloudinary configuration and try again.', 500));
    }
    
    if (!avatarUrl.startsWith('http')) {
      const cName = config.get('server.cloudinary_cloud_name');
      if (cName && avatarUrl.includes('project-management/avatars')) {
        avatarUrl = `https://res.cloudinary.com/${cName}/image/upload/${avatarUrl}`;
      } else {
        avatarUrl = `https://${avatarUrl}`;
      }
    }
    
    if (avatarUrl.startsWith('http://')) {
      avatarUrl = avatarUrl.replace('http://', 'https://');
    }
    
    if (user.avatar && user.avatar !== avatarUrl) {
      try {
        const publicId = extractPublicId(user.avatar);
        if (publicId) {
          await deleteImage(publicId);
        }
      } catch (deleteError) {
        if (config.get('server.node_env', 'development') === 'development') {
          console.warn('Failed to delete old avatar:', deleteError);
        }
      }
    }
    
    user.avatar = avatarUrl;
    await user.save();

    const updatedUser = await User.findById(userId);

    if (!updatedUser) {
      return next(new AppError('Failed to retrieve updated user', 500));
    }

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        preferences: updatedUser.preferences,
      },
    });
  } catch (error: any) {
    if (config.get('server.node_env', 'development') === 'development') {
      console.error('Avatar upload error:', error);
      console.error('Error stack:', error.stack);
    }
    return next(new AppError(error.message || 'Failed to upload avatar', 500));
  }
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!._id;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  const user = await User.findById(userId).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await user.save({ validateBeforeSave: false });

  // TODO: Send email with reset token
  // const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

  res.status(200).json({
    success: true,
    message: 'Password reset email sent',
    resetToken,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { password } = req.body;

  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const authToken = generateToken(user._id.toString());

  res.status(200).json({
    success: true,
    token: authToken,
    message: 'Password reset successful',
  });
});
