import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import { cloudinaryConfig } from './config/cloudinary';
import albumRoutes from './routes/albumRoutes'
import uploadRoutes from './routes/uploadRoutes'
import { errorHandler, notFound } from './middlewares/errorMiddleware'

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Cloudinary
cloudinaryConfig();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Album Spark API is running');
});

app.use('/api/albums', albumRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 