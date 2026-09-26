const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { apiLimiter } = require('./middleware/rateLimiter');

const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const careerRoutes = require('./routes/careerRoutes');
const skillGapRoutes = require('./routes/skillGapRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const projectRoutes = require('./routes/projectRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Enable Trust Proxy for Rate Limiting behind load balancers/proxies
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Allowed Origins for Production (Vercel) & Local Development
const allowedOrigins = [
  'https://smart-skillgap-3uqb-1ng5yx2q7-thota3.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000'
];

if (process.env.CLIENT_URL) {
  const customUrls = process.env.CLIENT_URL.split(',').map(u => u.trim());
  customUrls.forEach(url => {
    if (url && !allowedOrigins.includes(url)) {
      allowedOrigins.push(url);
    }
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) ||
                      origin.endsWith('.vercel.app') ||
                      /^http:\/\/localhost:\d+$/.test(origin) ||
                      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy: Origin ${origin} not allowed`), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body Parsers with JSON SyntaxError handling for non-empty payloads
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    if (buf && buf.length > 0) {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        req.badJson = true;
      }
    }
  }
}));
app.use((req, res, next) => {
  if (req.badJson) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload received in request body'
    });
  }
  next();
});

app.use(express.urlencoded({ extended: true }));

// Rate Limiter
app.use('/api', apiLimiter);

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/skill-gap', skillGapRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);


// Serve static client assets if client/dist exists
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Smart Skill Gap API Server is running successfully.',
      healthCheck: '/api/health'
    });
  });
}

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
