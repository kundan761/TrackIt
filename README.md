# TrackIt - Project Management Platform

A comprehensive, production-ready project management application built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

## 🚀 Live Demo

- **Frontend**: [Link](https://track-it-kappa-fawn.vercel.app/)
- **Backend API**: [Link](https://trackit-xqw6.onrender.com)

## ✨ Features

- **User Authentication**: Secure JWT-based auth with password recovery and profile management.
- **Project Management**: Create, update, and track multiple projects with role-based access.
- **Task System**: Kanban, List, and Calendar views for tasks with priority levels, assignees, and due dates.
- **Team Collaboration**: Invite members via email with specific roles (Admin, Manager, Member, Viewer).
- **Real-time Notifications**: Stay updated on task assignments and project changes.
- **Reports & Analytics**: Visual progress tracking and project health metrics.
- **Modern UI**: Dark mode support, responsive design, and smooth animations.

## 📸 Project Screenshots

<div align="center">
  <h3>Dashboard Overview</h3>
  <img src="assets/dashboard.png" alt="Dashboard" width="800" />
  
  <h3>Kanban Task Board</h3>
  <img src="assets/task-page.png" alt="Task Management" width="800" />
  
  <h3>Project Details</h3>
  <img src="assets/project-info.png" alt="Project Info" width="800" />
  
  <h3>Team Management</h3>
  <img src="assets/team-page.png" alt="Team Page" width="800" />
  
  <h3>Analytics & Reports</h3>
  <img src="assets/report-page.png" alt="Reports" width="800" />
</div>

## 🛠 Tech Stack

### Frontend
- React 18 & TypeScript
- Redux Toolkit (State Management)
- Tailwind CSS (Styling)
- Vite (Build Tool)
- React Router 6 (Routing)
- Lucide React (Icons)

### Backend
- Node.js & Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer (Email Services)
- Cloudinary (Image Hosting)

## ⚙️ Environment Variables

Create a `.env` file in the root directory based on the following template:

```env
# Server Configuration
PORT=5500
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://localhost:3000

# Email Configuration (Gmail recommended)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM_NAME=TrackIt

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client Configuration
VITE_API_URL=http://localhost:5500/api
```

## 🚀 Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/trackit.git
   cd trackit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Email Setup (Gmail)**:
   - Enable 2-Step Verification in your Google Account.
   - Generate an **App Password** for "Mail".
   - Use this password in your `.env` file as `EMAIL_PASSWORD`.

4. **Run in Development**:
   ```bash
   # Runs both frontend and backend concurrently
   npm run dev
   ```

## 🌐 Deployment Guide

### Frontend (Vercel)
- **Root Directory**: `.`
- **Build Command**: `npm run build:client`
- **Output Directory**: `apps/client/dist`
- **Rewrites**: Handled automatically by `vercel.json` in the root.

### Backend (Render)
- **Build Command**: `npm install && npm run build:server`
- **Start Command**: `npm start`
- **Env Variables**: Ensure all variables from `.env` are added to the Render dashboard.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
