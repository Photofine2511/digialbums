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
  console.log('req.files structure:', JSON.stringify(req.files, null, 2));
  
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
      try {
        console.log(`Processing file: ${file.originalname} (${file.size} bytes)`);
        const filePath = file.path;
        
        if (!fs.existsSync(filePath)) {
          console.error(`File does not exist at path: ${filePath}`);
          throw new Error(`File not found: ${file.originalname}`);
        }
        
        // Generate a unique ID for each image
        const imageId = uuidv4();
        
        // Upload the image to Cloudinary with detailed error handling
        console.log(`Uploading to Cloudinary: ${filePath}`);
        let result;
        try {
          result = await uploadToCloudinary(filePath, 'album-spark');
          console.log(`Cloudinary result received for ${file.originalname}:`, result.secure_url);
        } catch (cloudinaryError) {
          console.error(`Cloudinary upload failed for ${file.originalname}:`, cloudinaryError);
          throw new Error(`Cloudinary upload failed: ${cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error'}`);
        }
        
        // Delete the file from the server after uploading to Cloudinary
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error(`Could not delete temporary file ${filePath}:`, unlinkError);
          // Continue processing even if we can't delete the temp file
        }
        
        const imageResult = {
          id: imageId,
          url: result.secure_url,
          publicId: result.public_id,
        };
        
        console.log(`Successfully processed image: ${file.originalname}`);
        uploadResults.push(imageResult);
      } catch (fileError) {
        console.error(`Error processing individual file ${file.originalname}:`, fileError);
        // Continue processing other files instead of failing the entire batch
        // Clean up this file if it exists
        if (file.path && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            console.error(`Failed to clean up file ${file.path}:`, e);
          }
        }
      }
    }
    
    if (uploadResults.length === 0) {
      throw new Error('All image uploads failed');
    }
    
    console.log(`Successfully processed ${uploadResults.length} out of ${files.length} images`);
    console.log('Upload results:', JSON.stringify(uploadResults));
    res.status(201).json(uploadResults);
  } catch (error) {
    console.error('Error in multiple image upload:', error);
    
    // Cleanup any remaining temporary files
    if (files) {
      for (const file of files) {
        if (file.path && fs.existsSync(file.path)) {
          console.log(`Cleaning up temporary file: ${file.path}`);
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            console.error(`Failed to clean up file ${file.path}:`, e);
          }
        }
      }
    }
    
    res.status(500);
    throw new Error(error instanceof Error ? error.message : 'Image upload failed');
  }
}); 