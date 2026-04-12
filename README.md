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

### Server (.env)

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/project-management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
JWT_REFRESH_EXPIRE=30d

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Email Configuration
# For Gmail: Use App Password (not regular password)
# Go to Google Account > Security > 2-Step Verification > App Passwords
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM_NAME=TrackIt

# Alternative SMTP Configuration (if not using Gmail)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
```

### Client (.env)

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Email Setup

### Gmail Setup (Recommended)

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to Security > 2-Step Verification > App Passwords
4. Generate an App Password for "Mail"
5. Use this App Password as `EMAIL_PASSWORD` in your `.env` file

### Other Email Providers

For other email providers (Outlook, Yahoo, etc.), use SMTP configuration:

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@provider.com
EMAIL_PASSWORD=your-password
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Root
   npm install
   
   # Server
   cd server
   npm install
   
   # Client
   cd ../client
   npm install
   ```

## Running the Application

1. Start MongoDB (if running locally)
2. Start the server:
   ```bash
   cd server
   npm run dev
   ```
3. Start the client:
   ```bash
   cd client
   npm run dev
   ```

## Team Invitations

Team invitations are sent via email. When a user is invited:
1. They receive an email with an invitation link
2. Clicking the link takes them to the invitation acceptance page
3. They create their account with name and password
4. They are automatically logged in and added to the team

## License

MIT
