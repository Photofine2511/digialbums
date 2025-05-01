import express from 'express';
import {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  addAlbumImage,
  removeAlbumImage,
  verifyAlbumPassword,
} from '../controllers/albumController';

const router = express.Router();

// Album routes
router.route('/')
  .post(createAlbum)
  .get(getAlbums);

router.route('/:id')
  .get(getAlbumById)
  .put(updateAlbum)
  .delete(deleteAlbum);

// Password verification route
router.route('/:id/verify-password')
  .post(verifyAlbumPassword);

// Album image routes
router.route('/:id/images')
  .post(addAlbumImage);

router.route('/:id/images/:imageId')
  .delete(removeAlbumImage);

export default router; 