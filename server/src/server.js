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

// Trust reverse proxy (Vercel, Cloudflare, etc.)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://localhost:5000'];
    if (defaultOrigins.includes(origin)) return callback(null, true);
    
    if (process.env.CLIENT_URL) {
      const allowed = process.env.CLIENT_URL.split(',').map(u => u.trim());
      if (allowed.includes(origin) || allowed.includes('*')) return callback(null, true);
    }
    
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
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
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI environment variable is configured in Vercel project settings.'
    });
  }
});

// General API Rate Limiter
app.use('/api', apiLimiter);

// Health Check Route
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'SMARTSKILL API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
});

// API Routes Mounting (with both /api prefix and direct fallback)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/users', userRoutes);

app.use('/api/user-skills', userSkillRoutes);
app.use('/user-skills', userSkillRoutes);

app.use('/api/profile', profileRoutes);
app.use('/profile', profileRoutes);

app.use('/api/skills', skillRoutes);
app.use('/skills', skillRoutes);

app.use('/api/careers', careerRoutes);
app.use('/careers', careerRoutes);

app.use('/api/career-skills', careerSkillRoutes);
app.use('/career-skills', careerSkillRoutes);

app.use('/api/assessments', assessmentRoutes);
app.use('/assessments', assessmentRoutes);

app.use('/api/gap-analysis', gapRoutes);
app.use('/gap-analysis', gapRoutes);
app.use('/api/skill-gap', gapRoutes);
app.use('/skill-gap', gapRoutes);

app.use('/api/roadmap', roadmapRoutes);
app.use('/roadmap', roadmapRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/roadmaps', roadmapRoutes);

app.use('/api/resources', resourceRoutes);
app.use('/resources', resourceRoutes);

app.use('/api/projects', projectRoutes);
app.use('/projects', projectRoutes);

app.use('/api/readiness', readinessRoutes);
app.use('/readiness', readinessRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/recommendations', recommendationRoutes);
app.use('/recommendations', recommendationRoutes);

app.use('/api/progress', progressRoutes);
app.use('/progress', progressRoutes);

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
