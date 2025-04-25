import { v2 as cloudinary } from 'cloudinary';

export const cloudinaryConfig = (): void => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
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

// Upload image to Cloudinary
export const uploadToCloudinary = async (
  imagePath: string,
  folder: string = 'album-spark'
): Promise<UploadApiResponse> => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder,
      resource_type: 'auto'
    });
    return result as UploadApiResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Cloudinary Upload Error: ${error.message}`);
    } else {
      console.error('Unknown Cloudinary upload error');
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