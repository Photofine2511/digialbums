import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { uploadToCloudinary } from '../config/cloudinary';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Extend the Express Request type
interface FileRequest extends Request {
  file?: Express.Multer.File;
  files?: {
    [fieldname: string]: Express.Multer.File[];
  } | Express.Multer.File[];
}

// @desc    Upload an image to Cloudinary
// @route   POST /api/upload
// @access  Public
export const uploadImage = asyncHandler(async (req: FileRequest, res: Response) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  try {
    const filePath = req.file.path;
    
    // Generate a unique ID for the image
    const imageId = uuidv4();
    
    // Upload the image to Cloudinary
    const result = await uploadToCloudinary(filePath, 'album-spark');
    
    // Delete the file from the server after uploading to Cloudinary
    fs.unlinkSync(filePath);
    
    res.status(201).json({
      id: imageId,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    if (req.file?.path) {
      // Cleanup temporary file if upload failed
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500);
    throw new Error('Image upload failed');
  }
});

// @desc    Upload multiple images to Cloudinary
// @route   POST /api/upload/multiple
// @access  Public
export const uploadMultipleImages = asyncHandler(async (req: FileRequest, res: Response) => {
  console.log('--- MULTIPLE IMAGE UPLOAD HANDLER ---');
  
  // Check the structure of req.files to understand how multer is providing the files
  console.log('req.files type:', typeof req.files);
  console.log('req.files structure:', JSON.stringify(req.files).slice(0, 200) + '...');
  
  // Extract files from request properly depending on the structure
  let files: Express.Multer.File[];
  
  if (Array.isArray(req.files)) {
    // It's already an array
    files = req.files;
    console.log('req.files is an array with length:', files.length);
  } else if (req.files && typeof req.files === 'object') {
    // It's an object, extract the files array from the fieldname
    const filesFromField = Object.values(req.files).flat();
    files = filesFromField;
    console.log('Extracted files from object structure, length:', files.length);
  } else {
    console.error('No files found or unexpected structure:', req.files);
    res.status(400);
    throw new Error('No files uploaded or invalid format');
  }
  
  if (!files || files.length === 0) {
    console.error('No files received in the request');
    res.status(400);
    throw new Error('No files uploaded');
  }

  try {
    console.log(`Starting upload of ${files.length} files to Cloudinary`);
    const uploadResults = [];

    for (const file of files) {
      console.log(`Processing file: ${file.originalname} (${file.size} bytes)`);
      const filePath = file.path;
      
      // Generate a unique ID for each image
      const imageId = uuidv4();
      
      // Upload the image to Cloudinary
      console.log(`Uploading to Cloudinary: ${filePath}`);
      const result = await uploadToCloudinary(filePath, 'album-spark');
      console.log(`Cloudinary result received for ${file.originalname}`);
      
      // Delete the file from the server after uploading to Cloudinary
      fs.unlinkSync(filePath);
      
      const imageResult = {
        id: imageId,
        url: result.secure_url,
        publicId: result.public_id,
      };
      
      console.log(`Successfully processed image: ${file.originalname}`);
      uploadResults.push(imageResult);
    }
    
    console.log(`Successfully processed ${uploadResults.length} images`);
    console.log('Upload results:', JSON.stringify(uploadResults));
    res.status(201).json(uploadResults);
  } catch (error) {
    console.error('Error in multiple image upload:', error);
    
    // Cleanup any remaining temporary files
    if (files) {
      for (const file of files) {
        if (file.path && fs.existsSync(file.path)) {
          console.log(`Cleaning up temporary file: ${file.path}`);
          fs.unlinkSync(file.path);
        }
      }
    }
    
    res.status(500);
    throw new Error('Image upload failed');
  }
}); 