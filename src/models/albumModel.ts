import mongoose, { Document, Schema } from 'mongoose';

interface IImage {
  id: string;
  url: string;
  publicId: string;
}

export interface IAlbum extends Document {
  title: string;
  photographerName?: string;
  coverImage: string;
  coverImagePublicId: string;
  images: IImage[];
  createdAt: Date;
  updatedAt: Date;
}

const albumSchema = new Schema<IAlbum>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    photographerName: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    coverImagePublicId: {
      type: String,
      required: true,
    },
    images: [
      {
        id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Album = mongoose.model<IAlbum>('Album', albumSchema);

export default Album; 