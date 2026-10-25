const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const skillRoutes = require('./routes/skillRoutes');
const studentSkillRoutes = require('./routes/studentSkillRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const jobRoleRoutes = require('./routes/jobRoleRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const projectRoutes = require('./routes/projectRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Import Error Handlers
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/student-skills', studentSkillRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/job-roles', jobRoleRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Student Skill Analyzer API',
    version: '1.0.0'
  });
});

// Root API Welcome & Directory
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Student Skill Analyzer API Platform',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      skills: '/api/skills',
      studentSkills: '/api/student-skills',
      assessments: '/api/assessments',
      jobRoles: '/api/job-roles',
      analysis: '/api/analysis',
      resources: '/api/resources',
      learningPaths: '/api/learning-paths',
      projects: '/api/projects',
      certificates: '/api/certificates',
      feedback: '/api/feedback',
      notifications: '/api/notifications'
    }
  });
});

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
