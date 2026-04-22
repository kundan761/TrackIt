import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const cloudName = config.get('CLOUDINARY_CLOUD_NAME');
const apiKey = config.get('CLOUDINARY_API_KEY');
const apiSecret = config.get('CLOUDINARY_API_SECRET');

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('⚠️  Cloudinary configuration is missing. Avatar uploads will not work.');
  console.warn('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file');
}

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

let storage: CloudinaryStorage | null = null;

if (cloudName && apiKey && apiSecret) {
  try {
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req, file) => {
        return {
          folder: 'project-management/avatars',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
          transformation: [
            { width: 400, height: 400, crop: 'limit' },
            { quality: 'auto' },
          ],
          public_id: `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
          resource_type: 'image',
          format: 'auto',
        };
      },
    });
  } catch (error) {
    console.error('Failed to initialize Cloudinary storage:', error);
    storage = null;
  }
}

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'));
  }
};

const MemoryStorage = multer.memoryStorage();

export const upload = multer({
  storage: storage || MemoryStorage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter,
});

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

export const extractPublicId = (url: string): string | null => {
  if (!url) return null;
  
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
};

