# SmartSkill - AI-Powered Career Skill Gap & Readiness Platform 🚀

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209.x-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

SmartSkill is an end-to-end web platform designed to analyze student skills against industry career standards, dynamically identify skill gaps, provide personalized learning roadmaps, evaluate competency through assessment quizzes, recommend curated learning resources & portfolio projects, and calculate an indicative 4-component career readiness score.

---

## 1. Project Overview

SmartSkill bridges the gap between educational learning and industry hiring requirements. By mapping master skills to target career paths, the platform allows students to:
- Select and analyze target careers (e.g. Full Stack Engineer, DevOps Architect, Data Engineer).
- Manage self-assessed & assessment-validated skill proficiencies (Levels 0 to 4).
- Execute server-side skill gap analyses.
- Follow personalized step-by-step learning roadmaps prioritized by gap depth and career priority.
- Complete skill assessment quizzes with automated server-side evaluation.
- Access personalized learning resources (courses, documentation, videos) and portfolio project recommendations.
- Track overall career readiness percentage based on a 4-component weighted model (40% skills, 20% assessments, 20% roadmap, 20% projects).

---

## 2. Key Features

- **Authentication & Role-Based Access Control (RBAC)**: Secure JWT authentication, password hashing (`bcryptjs`), role separation (`student` vs `admin`), and rate limiting.
- **Master Skill & Career Management**: Skill taxonomy categorized by domain, career paths with salary ranges, job demand ratings, and required skill proficiency levels.
- **Skill Gap Analysis Engine**: Real-time server-side comparison of user proficiencies against career requirements, classifying gaps into `COMPLETED`, `LOW_GAP`, `MEDIUM_GAP`, and `HIGH_GAP`.
- **Personalized Learning Roadmaps**: Dynamic milestone generation prioritizing high-gap/high-priority skills, featuring step progress tracking (0-100%) and server-controlled completion timestamps.
- **Assessment Engine**: Timed multiple-choice quizzes with server-side scoring and correct answers stripped from client payloads.
- **Learning Resource & Project Recommendations**: Personalized recommendations matching user skill gaps with URL security scheme validation (`http://` and `https://` only).
- **Career Readiness Index**: Server-calculated 40-20-20-20 weighted score complete with statutory employment disclaimer and Recharts visualization charts.
- **Admin Command Center**: Complete administration portal for user management, master skills CRUD, career CRUD, resource CRUD, and project CRUD.

---

## 3. Technology Stack

- **Backend**: Node.js, Express.js (v5), MongoDB / Mongoose (v9), MongoMemoryServer (for standalone zero-config dev/testing).
- **Frontend**: React (v19), Vite (v8), TailwindCSS (v4), Recharts (v3), Lucide React.
- **Security & Middleware**: Helmet, CORS, Express Rate Limit, MongoSanitize, Bcryptjs, JSON Web Tokens.

---

## 4. Architecture

```
                                ┌────────────────────────────────┐
                                │          React Single          │
                                │        Page Application        │
                                └───────────────┬────────────────┘
                                                │ REST API (JSON)
                                                ▼
                                ┌────────────────────────────────┐
                                │       Express.js Server        │
                                ├────────────────────────────────┤
                                │  • Auth & RBAC Middleware      │
                                │  • Security (Helmet/Sanitize)  │
                                │  • Skill Gap & Roadmap Engine  │
                                │  • Readiness Service (40/20/20)│
                                └───────────────┬────────────────┘
                                                │ Mongoose ORM
                                                ▼
                                ┌────────────────────────────────┐
                                │        MongoDB Database        │
                                └────────────────────────────────┘
```

---

## 5. Folder Structure

```
SmartSkill/
├── client/                     # React Single Page Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Axios instance with auth interceptors
│   │   ├── components/         # Reusable UI components (Navbar, Footer, SafeLink, etc.)
│   │   ├── context/            # React Context (AuthContext)
│   │   ├── pages/              # Page views (Dashboard, Skills, Careers, Roadmap, etc.)
│   │   ├── App.jsx             # Main router configuration
│   │   └── main.jsx            # Application entry point
│   └── package.json
├── server/                     # Express API Server
│   ├── config/                 # DB connection configuration
│   ├── controllers/            # Controller handlers for API endpoints
│   ├── middleware/             # Security, Auth, Rate Limiter, and Error Handler
│   ├── models/                 # Mongoose schemas (User, Skill, Career, Roadmap, etc.)
│   ├── routes/                 # Express router definitions
│   ├── services/               # Core business services (skillGap, roadmap, readiness)
│   ├── seed/                   # Database seeder & test suites (Phases 3-11)
│   ├── utils/                  # URL security validators
│   ├── server.js               # Express application server
│   └── package.json
├── .gitignore                  # Git ignore definitions
└── README.md                   # Documentation
```

---

## 6. Database Models

- `User`: User accounts (`name`, `email`, `password` hashed, `role`: `student` | `admin`, `targetCareer`).
- `Skill`: Master taxonomy (`name`, `category`, `description`, `icon`).
- `Career`: Target career paths (`title`, `slug`, `description`, `category`, `demand`, `salaryRange`).
- `CareerSkill`: Junction model (`career`, `skill`, `requiredLevel`: 0-4, `priority`: `low` | `medium` | `high` | `critical`).
- `UserSkill`: User skill proficiencies (`user`, `skill`, `proficiency`: 0-4, `source`: `self` | `assessment`).
- `Roadmap`: Personalized user milestone learning steps (`user`, `career`, `steps`: `[{ skill, title, order, priority, status, progress, completedAt }]`).
- `Assessment`: Skill quiz definition (`title`, `description`, `skill`, `difficulty`, `timeLimitMinutes`, `questions`).
- `AssessmentResult`: User quiz submissions (`user`, `assessment`, `skill`, `score`, `percentage`, `proficiency`).
- `Resource`: Curated learning links (`title`, `description`, `url`, `type`, `skill`, `difficulty`).
- `Project`: Portfolio project definitions (`title`, `description`, `difficulty`, `requiredSkills`, `skillsGained`, `githubUrl`, `demoUrl`).

---

## 7. API Endpoints Summary

### Authentication & Profile
- `POST /api/auth/register` — Register student account
- `POST /api/auth/login` — Login user & return JWT
- `GET /api/auth/me` — Get current user profile (excludes password)
- `GET /api/profile` — Get profile & target career
- `PUT /api/profile` — Update profile details

### Skills & User Skills
- `GET /api/skills` — List all master skills
- `GET /api/user-skills` — Get authenticated user skills
- `POST /api/user-skills` — Update user skill proficiency

### Careers & Gap Analysis
- `GET /api/careers` — List all career paths
- `GET /api/careers/:id` — Get career details & requirements
- `GET /api/skill-gap` — Calculate user skill gap analysis for target career
- `POST /api/skill-gap/analyze` — Analyze skill gap for specific career

### Roadmaps
- `GET /api/roadmaps/my-roadmap` — Get personalized career roadmap
- `GET /api/roadmaps/:careerId` — Get roadmap for specific career
- `POST /api/roadmaps/generate` — Generate/regenerate learning roadmap
- `PUT /api/roadmaps/:stepId` — Update step progress/status

### Assessments
- `GET /api/assessments` — List available quizzes (correct answers hidden)
- `GET /api/assessments/:id` — Get quiz details
- `POST /api/assessments/:id/submit` — Submit quiz answers for server-side evaluation

### Resources & Projects
- `GET /api/resources` — List resources (with filters)
- `GET /api/projects` — List projects (with filters)
- `POST /api/projects/progress` — Submit project links & notes

### Recommendations & Readiness
- `GET /api/recommendations` — Personalized resources & projects aligned with gaps
- `GET /api/progress` — 4-component weighted readiness metrics & progress
- `GET /api/readiness` — Career readiness percentage & statutory disclaimer

### Admin Command Center (Admin Only)
- `GET /api/admin/stats` — Platform statistics & recent users
- `GET/PUT/DELETE /api/admin/users` — User management & role modification
- `POST/PUT/DELETE /api/admin/skills` — Master skill CRUD
- `POST/PUT/DELETE /api/admin/careers` — Career path CRUD
- `POST/PUT/DELETE /api/admin/career-skills` — Requirement mappings CRUD
- `POST/PUT/DELETE /api/admin/resources` — Resource CRUD
- `POST/PUT/DELETE /api/admin/assessments` — Assessment CRUD
- `POST/PUT/DELETE /api/admin/projects` — Project CRUD

---

## 8. Environment Variables

Create `.env` in `server/`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/smartskill
JWT_SECRET=supersecret_jwt_key_smartskill_2026_change_in_production
CLIENT_URL=http://localhost:5173
```

> ⚠️ **CRITICAL SECURITY NOTE**: Never commit `.env` or expose `MONGODB_URI` or `JWT_SECRET` to the frontend bundle.

---

## 9. Installation

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)

### Setup Steps
```bash
# 1. Clone the repository
git clone https://github.com/user/SmartSkill.git
cd SmartSkill

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies
cd ../client
npm install
```

---

## 10. Development Commands

### Run Backend Server
```bash
cd server
npm run dev
```

### Run Frontend Client
```bash
cd client
npm run dev
```

---

## 11. Database Seed Commands

Seed the database with default master skills, careers, learning resources, projects, assessment quizzes, and demo user accounts:

```bash
cd server
npm run seed
```

---

## 12. Testing

Run automated phase test suites (Authentication, Gap Analysis, Roadmaps, Recommendations, Progress, Admin Security):

```bash
cd server

# Run individual phase test suites
npm run test:auth
npm run test:phase7
npm run test:phase8
npm run test:phase9
npm run test:phase10
npm run test:phase11

# Run complete backend test suite
npm test
```

### Build Frontend Verification
```bash
cd client
npm run build
```

---

## 13. Security Measures Implemented

1. **Password Hashing**: Uses `bcryptjs` with salt rounds (10) for secure password storage.
2. **JWT Authentication & Expiration**: Tokens expire in 24 hours. Signatures validated on every protected request.
3. **Role-Based Authorization (RBAC)**: All administrative endpoints are guarded with `protect` + `adminOnly` middlewares.
4. **IDOR & Ownership Verification**: Roadmap steps, project progress, and assessment submissions strictly check `user: req.user.id`.
5. **NoSQL Injection Sanitization**: Uses `mongo-sanitize` middleware to strip `$` and `.` operators from input bodies and queries.
6. **URL Security Scheme Rejection**: External URLs (`url`, `githubUrl`, `demoUrl`) are validated server-side to reject dangerous schemes (`javascript:`, `data:`, `file:`, `vbscript:`).
7. **External Link Hardening**: Frontend uses `<SafeLink>` with `rel="noopener noreferrer"` and `target="_blank"`.
8. **Sensitive Data Omission**: Password fields are explicitly excluded via `.select('-password')`.
9. **Mass Assignment & Privilege Escalation Defense**: Client payloads cannot update account roles, roadmap priorities, or server timestamps.
10. **Assessment Security**: Correct answers and explanations are stripped from client payloads via schema transforms.

---

## 14. Deployment Instructions

1. **Database**: Set up a MongoDB Atlas cluster or managed MongoDB instance. Set `MONGODB_URI`.
2. **Backend**:
   - Set `NODE_ENV=production`.
   - Configure a strong `JWT_SECRET`.
   - Configure `CLIENT_URL` to match your deployed frontend domain.
   - Deploy server to a Node.js host (e.g. Render, Railway, AWS App Runner).
3. **Frontend**:
   - Build client bundle: `cd client && npm run build`.
   - Deploy `dist/` directory to a static host (e.g. Vercel, Netlify, Cloudflare Pages).
4. **CORS Configuration**: Verify CORS whitelist allows requests from `CLIENT_URL`.

---

## 15. Demo Credentials

> ⚠️ **DEVELOPMENT / DEMO ONLY** (Do not use these credentials in production environments):

- 🔑 **Admin User**:
  - **Email**: `admin@smartskill.com`
  - **Password**: `Admin@123`
- 🔑 **Student User**:
  - **Email**: `student@smartskill.com`
  - **Password**: `Student@123`

---

## 16. Final Audit & Security Report

### Summary of Created & Modified Modules
- `server/src/services/` (`skillGapService.js`, `roadmapService.js`, `recommendationService.js`, `readinessService.js`)
- `server/src/controllers/` (`authController.js`, `skillController.js`, `careerController.js`, `gapController.js`, `roadmapController.js`, `resourceController.js`, `projectController.js`, `recommendationController.js`, `progressController.js`, `adminController.js`)
- `server/src/utils/urlValidator.js`
- `server/src/seed/` (`testAuthPhase3.js`, `testPhase4.js`, `testPhase5.js`, `testPhase6.js`, `testPhase7.js`, `testPhase8.js`, `testPhase9.js`, `testPhase10.js`, `testPhase11.js`)
- `client/src/pages/` (`Dashboard.jsx`, `SkillsManager.jsx`, `CareerSelection.jsx`, `SkillGapAnalysis.jsx`, `CareerRoadmap.jsx`, `Resources.jsx`, `Projects.jsx`, `CareerReadiness.jsx`, `AdminDashboard.jsx`)

### Build & Vulnerability Status
- **Backend Test Suite**: 100% Passed across all phase test suites.
- **Frontend Vite Build**: `npm run build` executed successfully with 0 compilation errors.
- **NPM Audit**: 0 vulnerabilities found across `server` and `client` dependencies.

### Remaining Risks & Honest Evaluation
- **Token Invalidation**: JWTs are stateless. Token revocation prior to 24h expiry requires implementing a redis token blacklist if immediate logout invalidation is required.
- **Rate Limiting Persistence**: Rate limiters currently use memory stores. In distributed multi-instance server deployments, a shared Redis store should be attached to `express-rate-limit`.

---

© 2026 SmartSkill Platform. All rights reserved.
