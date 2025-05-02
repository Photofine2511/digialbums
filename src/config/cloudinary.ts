import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export const cloudinaryConfig = (): void => {
  cloudinary.config({
    cloud_name: "dznnjip3y",
    api_key: "388923686462861",
    api_secret: "db-oLbkRGohL5OPVXWENMMpeGHg",
    secure: true
  });
};

// Define Cloudinary response types since they're not exported by the library
interface UploadApiResponse {
  public_id: string;
  secure_url: string;
  [key: string]: any;
}

interface DeleteApiResponse {
  result: string;
  [key: string]: any;
}

// Upload image to Cloudinary with support for large files
export const uploadToCloudinary = async (
  imagePath: string,
  folder: string = 'album-spark'
): Promise<UploadApiResponse> => {
  try {
    console.log(`Cloudinary upload starting for file: ${imagePath}`);
    console.log('Using Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'NOT SET', // don't log the actual key
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'NOT SET', // don't log the actual secret
    });
    
    // Check if file exists before upload
    if (!fs.existsSync(imagePath)) {
      throw new Error(`File does not exist at path: ${imagePath}`);
    }
    
    // Check file size to ensure it's not empty
    const stats = fs.statSync(imagePath);
    if (stats.size === 0) {
      throw new Error(`File is empty: ${imagePath}`);
    }
    
    console.log(`File size: ${(stats.size / (1024 * 1024)).toFixed(2)}MB`);
    
    // Configure for large file uploads
    const uploadOptions = {
      folder,
      resource_type: 'auto' as 'auto',
      chunk_size: 20000000, // 20MB chunks for large files
      timeout: 3600000, // 1 hour timeout
      use_filename: true,
      unique_filename: true,
    };
    
    const result = await cloudinary.uploader.upload(imagePath, uploadOptions);
    
    console.log(`Cloudinary upload success for: ${imagePath}`);
    return result as UploadApiResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Cloudinary Upload Error: ${error.message}`);
      console.error('Error details:', error);
    } else {
      console.error('Unknown Cloudinary upload error');
      console.error('Error value:', error);
    }
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (
  publicId: string
): Promise<DeleteApiResponse | undefined> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result as DeleteApiResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Cloudinary Delete Error: ${error.message}`);
    } else {
      console.error('Unknown Cloudinary delete error');
    }
    return undefined;
  }
}; 