import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

// Generates a unique file name so uploads never overwrite each other
function generateFileName(file: Express.Multer.File): string {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return `${uniqueSuffix}${extname(file.originalname)}`;
}

export const imageUploadOptions = {
  storage: diskStorage({
    destination: './uploads/events',
    filename: (_req, file, callback) => {
      callback(null, generateFileName(file));
    },
  }),
  fileFilter: (_req, file, callback) => {
    const allowed = /jpg|jpeg|png|webp/;
    const isValid = allowed.test(extname(file.originalname).toLowerCase());
    if (!isValid) {
      return callback(new BadRequestException('Only image files are allowed (jpg, jpeg, png, webp)'), false);
    }
    callback(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
};
