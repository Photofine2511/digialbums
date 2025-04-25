# Album Spark API Server

This is the backend server for the Album Spark application, providing API endpoints for album management and image handling with Cloudinary integration.

## Technologies Used

- Node.js & Express
- TypeScript
- MongoDB with Mongoose
- Cloudinary for image storage
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js 14+ installed
- MongoDB installed locally or connection to MongoDB Atlas
- Cloudinary account for image storage

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your configuration values:
   ```
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/album-spark

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Running the Server

#### Development mode:

```
npm run dev
```

#### Production build:

```
npm run build
npm start
```

## API Endpoints

### Albums

- `GET /api/albums` - Get all albums
- `POST /api/albums` - Create a new album
- `GET /api/albums/:id` - Get a specific album
- `PUT /api/albums/:id` - Update album details
- `DELETE /api/albums/:id` - Delete an album

### Images

- `POST /api/upload` - Upload an image to Cloudinary
- `POST /api/albums/:id/images` - Add an image to an album
- `DELETE /api/albums/:id/images/:imageId` - Remove an image from an album

## Folder Structure

```
server/
├── src/
│   ├── config/         # App configuration
│   ├── controllers/    # API controllers
│   ├── middlewares/    # Express middlewares
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   └── index.ts        # App entry point
├── uploads/            # Temporary uploads folder
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
``` 