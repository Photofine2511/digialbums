import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Album, { IAlbum } from '../models/albumModel';
import { deleteFromCloudinary } from '../config/cloudinary';

// @desc    Create a new album
// @route   POST /api/albums
// @access  Public
export const createAlbum = asyncHandler(async (req: Request, res: Response) => {
  const { title, photographerName, coverImage, coverImagePublicId, images } = req.body;

  // Create a new album
  const album = await Album.create({
    title,
    photographerName,
    coverImage,
    coverImagePublicId,
    images,
  });

  if (album) {
    res.status(201).json(album);
  } else {
    res.status(400);
    throw new Error('Invalid album data');
  }
});

// @desc    Get all albums
// @route   GET /api/albums
// @access  Public
export const getAlbums = asyncHandler(async (req: Request, res: Response) => {
  const albums = await Album.find().sort('-createdAt');
  res.json(albums);
});

// @desc    Get album by ID
// @route   GET /api/albums/:id
// @access  Public
export const getAlbumById = asyncHandler(async (req: Request, res: Response) => {
  const album = await Album.findById(req.params.id);

  if (album) {
    res.json(album);
  } else {
    res.status(404);
    throw new Error('Album not found');
  }
});

// @desc    Update an album
// @route   PUT /api/albums/:id
// @access  Public
export const updateAlbum = asyncHandler(async (req: Request, res: Response) => {
  const { title, photographerName } = req.body;

  const album = await Album.findById(req.params.id);

  if (album) {
    album.title = title || album.title;
    album.photographerName = photographerName || album.photographerName;

    const updatedAlbum = await album.save();
    res.json(updatedAlbum);
  } else {
    res.status(404);
    throw new Error('Album not found');
  }
});

// @desc    Delete an album
// @route   DELETE /api/albums/:id
// @access  Public
export const deleteAlbum = asyncHandler(async (req: Request, res: Response) => {
  const album = await Album.findById(req.params.id);

  if (album) {
    // Delete images from Cloudinary
    await deleteFromCloudinary(album.coverImagePublicId);

    for (const image of album.images) {
      await deleteFromCloudinary(image.publicId);
    }

    // Delete album from database
    await album.deleteOne();
    res.json({ message: 'Album removed' });
  } else {
    res.status(404);
    throw new Error('Album not found');
  }
});

// @desc    Add an image to an album
// @route   POST /api/albums/:id/images
// @access  Public
export const addAlbumImage = asyncHandler(async (req: Request, res: Response) => {
  const { id, url, publicId } = req.body;

  const album = await Album.findById(req.params.id);

  if (album) {
    album.images.push({ id, url, publicId });
    const updatedAlbum = await album.save();
    res.status(201).json(updatedAlbum);
  } else {
    res.status(404);
    throw new Error('Album not found');
  }
});

// @desc    Remove an image from an album
// @route   DELETE /api/albums/:id/images/:imageId
// @access  Public
export const removeAlbumImage = asyncHandler(async (req: Request, res: Response) => {
  const album = await Album.findById(req.params.id);

  if (album) {
    const imageToRemove = album.images.find(
      (image) => image.id === req.params.imageId
    );

    if (!imageToRemove) {
      res.status(404);
      throw new Error('Image not found in album');
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(imageToRemove.publicId);

    // Remove image from album
    album.images = album.images.filter(
      (image) => image.id !== req.params.imageId
    );

    // Update cover image if deleted
    if (album.images.length > 0 && imageToRemove.url === album.coverImage) {
      album.coverImage = album.images[0].url;
      album.coverImagePublicId = album.images[0].publicId;
    }

    const updatedAlbum = await album.save();
    res.json(updatedAlbum);
  } else {
    res.status(404);
    throw new Error('Album not found');
  }
}); 