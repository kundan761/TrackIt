# Project Management App

A comprehensive project management application built with MERN stack.

## Features

- User authentication and authorization
- Project management (CRUD operations)
- Task management with Kanban, List, and Calendar views
- Team collaboration and member invitations
- Calendar and event management
- Reports and analytics
- Dark mode support with multiple themes
- Responsive design

## Tech Stack

### Frontend
- React 18
- TypeScript
- Redux Toolkit
- React Router
- Tailwind CSS
- Vite
- Lucide React (Icons)

### Backend
- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer (Email)

## Environment Variables

Create a `env.yaml` file in the root directory:

```
server:
  port: 5500
  node_env: development
  mongodb_uri: mongodb://localhost:27017/project-management
  jwt_secret: your-super-secret-jwt-key-change-this-in-production
  jwt_expire: 7d
  jwt_refresh_secret: your-super-secret-refresh-token-key-change-this-in-production
  jwt_refresh_expire: 30d
  frontend_url: http://localhost:5173
  email_service: gmail
  email_user: your-email@gmail.com
  email_password: your-app-password-here
  email_from_name: TrackIt
  cloudinary_cloud_name: your-cloud-name
  cloudinary_api_key: your-api-key
  cloudinary_api_secret: your-api-secret

client:
  vite_api_url: http://localhost:5500/api

```

## Email Setup

### Gmail Setup (Recommended)

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to Security > 2-Step Verification > App Passwords
4. Generate an App Password for "Mail"
5. Use this App Password as `EMAIL_PASSWORD` in your `env.yaml` file

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Root
   npm install

   # Run Client and Server
   npm run dev
   ```

## Running the Application

1. Start MongoDB (if running locally)
2. Start the server:
   ```bash
   npm run dev:server
   ```
3. Start the client:
   ```bash
   npm run dev:client
   ```

## Team Invitations

Team invitations are sent via email. When a user is invited:
1. They receive an email with an invitation link
2. Clicking the link takes them to the invitation acceptance page
3. They create their account with name and password
4. They are automatically logged in and added to the team

## License

MIT
