const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('mongo-sanitize');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const userSkillRoutes = require('./routes/userSkillRoutes');
const profileRoutes = require('./routes/profileRoutes');
const skillRoutes = require('./routes/skillRoutes');
const careerRoutes = require('./routes/careerRoutes');
const careerSkillRoutes = require('./routes/careerSkillRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const gapRoutes = require('./routes/gapRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const projectRoutes = require('./routes/projectRoutes');
const readinessRoutes = require('./routes/readinessRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const progressRoutes = require('./routes/progressRoutes');

const app = express();

// Connect Database
connectDB();

// Security Middleware
app.use(helmet());

const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : defaultOrigins;

const allowedOrigins = Array.from(new Set([
  ...clientOrigins,
  ...(process.env.NODE_ENV !== 'production' ? defaultOrigins : [])
]));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser & Limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// NoSQL Injection Data Sanitization Middleware
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.query) req.query = mongoSanitize(req.query);
  if (req.params) req.params = mongoSanitize(req.params);
  next();
});

// Database Readiness Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please check MONGODB_URI or network configuration.'
    });
  }
});

// General API Rate Limiter
app.use('/api', apiLimiter);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'SMARTSKILL API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user-skills', userSkillRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/career-skills', careerSkillRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/gap-analysis', gapRoutes);
app.use('/api/skill-gap', gapRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/readiness', readinessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/progress', progressRoutes);

// Global Error Handler
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 SMARTSKILL Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
