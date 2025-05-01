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
  password?: string;
  isPasswordProtected: boolean;
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
    password: {
      type: String,
      select: false, // Don't include in normal queries
    },
    isPasswordProtected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Remove any existing index on accessToken if it exists
if (albumSchema.indexes) {
  albumSchema.indexes().forEach((index) => {
    if (index[0] && index[0].accessToken) {
      albumSchema.index({ accessToken: 1 }, { unique: false, sparse: false, background: false });
    }
  });
}

const Album = mongoose.model<IAlbum>('Album', albumSchema);

export default Album; 