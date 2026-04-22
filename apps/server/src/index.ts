import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import { config } from './config/index.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import eventRoutes from './routes/events.js';
import dashboardRoutes from './routes/dashboard.js';
import reportsRoutes from './routes/reports.js';
import teamRoutes from './routes/team.js';
import notificationRoutes from './routes/notifications.js';

const app = express();
const PORT = config.get('PORT');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});
app.use(errorHandler);

const MONGODB_URI = config.get('MONGODB_URI');

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

export default app;

