import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  uploadAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { upload } from '../utils/cloudinary.js';
import { protect } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.use(protect);

router.get('/me', getMe);
router.put('/profile', updateProfile);

router.post('/avatar', (req, res, next) => {
  upload.single('avatar')(req, res, (err: any) => {
    if (err) {
      if (err instanceof Error) {
        return next(new AppError(err.message, 400));
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File size too large. Maximum size is 1MB', 400));
      }
      if (err.message && err.message.includes('Only image files')) {
        return next(new AppError(err.message, 400));
      }
      return next(new AppError('File upload error', 400));
    }
    next();
  });
}, uploadAvatar);

router.put('/password', changePassword);

export default router;

