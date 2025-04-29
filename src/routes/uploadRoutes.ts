import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadImage, uploadMultipleImages } from '../controllers/uploadController';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
  console.log('Created uploads directory');
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! Please upload an image file (jpeg, jpg, png, gif, webp).'));
  }
};

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50MB limit
  fileFilter,
});

console.log('Multer configured for file uploads with 50MB limit');

// Error handler for multer errors
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    console.error('Multer error:', err.code, err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum file size is 50MB' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    // An unknown error occurred
    console.error('Unknown upload error:', err);
    return res.status(500).json({ message: err.message || 'An unknown error occurred during upload' });
  }
  next();
};

// Route for uploading a single image
router.post('/', upload.single('image'), handleMulterError, (req: Request, res: Response, next: NextFunction) => {
  console.log('Single image upload endpoint hit');
  uploadImage(req, res, next);
});

// Route for uploading multiple images
router.post('/multiple', upload.array('images', 20), handleMulterError, (req: Request, res: Response, next: NextFunction) => {
  console.log('Multiple image upload endpoint hit');
  const files = req.files as Express.Multer.File[];
  console.log(`Received ${files ? files.length : 0} files in the multiple upload route`);
  uploadMultipleImages(req, res, next);
});

export default router; 