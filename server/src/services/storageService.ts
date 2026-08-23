import { env } from '../config/env';

export interface FileStorageResult {
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export const getFileUrl = (filename: string): string => {
  // In development, serve through Express static route: /uploads/:filename
  // In production with S3/Cloudinary, this returns the CDN/S3 URL
  return `/uploads/${filename}`;
};

export const processUploadedFile = (
  file: Express.Multer.File
): FileStorageResult => {
  return {
    url: getFileUrl(file.filename),
    filename: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
  };
};
