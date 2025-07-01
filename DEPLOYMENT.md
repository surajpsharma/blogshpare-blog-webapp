# Deployment Guide for BlogSphare

This guide provides instructions for deploying the BlogSphare application with:

- Backend on Render.com
- Frontend on Vercel.com

## Prerequisites

- GitHub account
- Render.com account
- Vercel.com account
- MongoDB Atlas account (for database)
- Cloudinary account (for image storage)

## Backend Deployment (Render.com)

1. **Prepare your environment variables**

   Create a `.env` file in the backend directory with the following variables (use `.env.example` as a template):

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=5000
   ```

2. **Deploy to Render.com**

   a. Push your code to GitHub

   b. Log in to Render.com and create a new Web Service

   c. Connect your GitHub repository

   d. Configure the service:

   - Name: blogsphare-backend
   - Root Directory: backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

   e. Add the environment variables from your `.env` file

   f. Deploy the service

3. **Verify the deployment**

   Once deployed, your backend API will be available at:
   `https://your-service-name.onrender.com`

## Frontend Deployment (Vercel.com)

1. **Prepare your environment variables**

   Create a `.env` file in the frontend directory with:

   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

   **Important**: After deploying your backend to Render.com, you'll need to update this URL with the actual Render.com URL of your backend service. The URL should end with `/api` as shown above.

2. **Deploy to Vercel.com**

   a. Push your code to GitHub

   b. Log in to Vercel.com and import your project

   c. Configure the project:

   - Framework Preset: Create React App
   - Root Directory: frontend
   - Build Command: `npm run build`
   - Output Directory: build

   d. Add the environment variables from your `.env` file

   e. Deploy the project

3. **Verify the deployment**

   Once deployed, your frontend will be available at the Vercel-provided URL.

## Pre-Deployment Steps

1. **Update API Endpoints**

   Before deploying, make sure all API endpoints in your frontend code are using the centralized config:

   a. Run the utility script to identify files that need updating:

   ```
   node update-api-endpoints.js
   ```

   b. For each identified file:

   - Add `import config from "../config";` at the top
   - Replace `${process.env.REACT_APP_BACKEND_URL}/api/endpoint` with `${config.apiUrl}/endpoint`

   This ensures your frontend will work correctly with the deployed backend.

## Post-Deployment Steps

1. **Update CORS settings**

   After deploying the frontend, get the Vercel-provided URL and update the `FRONTEND_URL` environment variable in your Render.com backend service.

2. **Test the application**

   Verify that all features work correctly in the deployed environment:

   - User registration and login
   - Blog creation and viewing
   - Profile management
   - Image uploads
   - Comments and interactions

## MongoDB Atlas Configuration

1. **Create a MongoDB Atlas Cluster**

   - Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (the free tier is sufficient for starting)
   - Once the cluster is created, click on "Connect"
   - Choose "Connect your application"
   - Copy the connection string

2. **Configure Network Access**

   - In MongoDB Atlas, go to "Network Access" under Security
   - Click "Add IP Address"
   - For development, you can add your current IP
   - For production with Render.com, select "Allow Access from Anywhere" (or add Render.com's IP ranges if you prefer more security)
   - Click "Confirm"

3. **Create a Database User**

   - In MongoDB Atlas, go to "Database Access" under Security
   - Click "Add New Database User"
   - Create a username and password (use a strong password)
   - Set appropriate permissions (e.g., "Read and Write to Any Database")
   - Click "Add User"

4. **Update Your Connection String**
   - Replace `<username>` and `<password>` in your connection string with your database user credentials
   - Add this connection string to your `.env` file as `MONGODB_URI`

## Cloudinary Configuration

1. **Create a Cloudinary Account**
   - Sign up or log in to [Cloudinary](https://cloudinary.com/)
   - Go to your dashboard to find your account details
2. **Get Your Credentials**
   - Copy your Cloud Name, API Key, and API Secret
   - Add these to your `.env` file as:
     ```
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```

## Troubleshooting

- **CORS Issues**: Ensure the `FRONTEND_URL` in the backend environment variables exactly matches your Vercel frontend URL.
- **API Connection Issues**: Verify that `REACT_APP_API_URL` in the frontend points to the correct Render.com backend URL.
- **Database Connection Issues**:
  - Check MongoDB Atlas network access settings to ensure your Render.com service can connect
  - Verify your connection string is correct and includes the database name
  - Make sure your database user has the correct permissions
  - If using MongoDB Atlas free tier, be aware of connection limitations
- **Cloudinary Issues**:
  - Verify your Cloudinary credentials are correctly set in the backend environment variables
  - Check file size limits (free tier has limitations)
  - Ensure your upload folder permissions are set correctly

## SSL/TLS Issues

If you encounter SSL/TLS errors with MongoDB:

1. Make sure your Node.js version is up to date
2. Verify that your connection string includes `ssl=true` and `tls=true`
3. If needed, you can set `tlsAllowInvalidCertificates=true` for testing (not recommended for production)
4. On Render.com, you may need to set the Node.js version explicitly in your settings
