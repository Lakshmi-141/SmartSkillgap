const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const Career = require('../models/Career');
const seedCareersData = require('../utils/seedCareersData');

// Generator helper to construct tailored career roadmap phases
const buildPersonalizedPhases = (careerTitle, userSkills = []) => {
  const normalizedSkills = userSkills.map(s => ({
    name: s.name.toLowerCase().trim(),
    proficiency: s.proficiency || 'Beginner'
  }));

  const hasMastered = (skillName) => {
    const found = normalizedSkills.find(s => s.name.includes(skillName.toLowerCase()));
    return found && ['Intermediate', 'Advanced', 'Expert'].includes(found.proficiency);
  };

  const isLearning = (skillName) => {
    const found = normalizedSkills.find(s => s.name.includes(skillName.toLowerCase()));
    return found && found.proficiency === 'Beginner';
  };

  const getInitialStatus = (skillName) => {
    if (hasMastered(skillName)) return 'Completed';
    if (isLearning(skillName)) return 'In Progress';
    return 'Not Started';
  };

  // Default Full Stack Roadmap Template
  if (careerTitle.toLowerCase().includes('full stack') || careerTitle.toLowerCase().includes('web')) {
    return [
      {
        phaseNumber: 1,
        title: 'Phase 1: HTML5 & CSS3 Web Fundamentals',
        description: 'Master semantic HTML, CSS Flexbox/Grid, and responsive layout standards.',
        learningObjectives: ['Semantic Markup', 'Flexbox & CSS Grid Layouts', 'Responsive Media Queries'],
        prerequisites: ['Basic Web Literacy'],
        estimatedTime: '1 Week',
        resources: [
          { title: 'MDN Web Docs: HTML & CSS', resourceType: 'Documentation', url: 'https://developer.mozilla.org' },
          { title: 'W3C Web Standards Guide', resourceType: 'Tutorial', url: 'https://w3.org' }
        ],
        status: getInitialStatus('html')
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Modern JavaScript (ES6+)',
        description: 'Master asynchronous programming, promises, DOM manipulation, and ES6 syntax.',
        learningObjectives: ['ES6 Syntax & Arrow Functions', 'Promises & Async/Await', 'DOM Manipulation & Fetch API'],
        prerequisites: ['Phase 1: HTML5 & CSS3'],
        estimatedTime: '2 Weeks',
        resources: [
          { title: 'JavaScript.info Modern Guide', resourceType: 'Documentation', url: 'https://javascript.info' }
        ],
        status: getInitialStatus('javascript')
      },
      {
        phaseNumber: 3,
        title: 'Phase 3: React.js Component Architecture',
        description: 'Build single-page web applications using React components, hooks, and state management.',
        learningObjectives: ['JSX & Component Props', 'useState & useEffect Hooks', 'Axios & Context API'],
        prerequisites: ['Phase 2: Modern JavaScript'],
        estimatedTime: '2 Weeks',
        resources: [
          { title: 'Official React Documentation', resourceType: 'Documentation', url: 'https://react.dev' }
        ],
        status: getInitialStatus('react')
      },
      {
        phaseNumber: 4,
        title: 'Phase 4: Node.js Runtime & Event Loop',
        description: 'Learn server-side JavaScript execution, event loop architecture, and file streams.',
        learningObjectives: ['Node.js Event Loop', 'NPM Package Management', 'Node File System & HTTP Modules'],
        prerequisites: ['Phase 2: Modern JavaScript'],
        estimatedTime: '1 Week',
        resources: [
          { title: 'Node.js Official Documentation', resourceType: 'Documentation', url: 'https://nodejs.org' }
        ],
        status: getInitialStatus('node')
      },
      {
        phaseNumber: 5,
        title: 'Phase 5: Express.js REST API Development',
        description: 'Design and build modular HTTP web servers, routing middleware, and JSON controllers.',
        learningObjectives: ['Express Router Architecture', 'Middleware Pipeline', 'Centralized Error Handling'],
        prerequisites: ['Phase 4: Node.js Runtime'],
        estimatedTime: '1 Week',
        resources: [
          { title: 'Express.js API Reference', resourceType: 'Documentation', url: 'https://expressjs.com' }
        ],
        status: getInitialStatus('express')
      },
      {
        phaseNumber: 6,
        title: 'Phase 6: MongoDB & Data Persistence',
        description: 'Model NoSQL documents, build Mongoose schemas, and perform CRUD operations.',
        learningObjectives: ['Document Database Design', 'Mongoose Schema Modeling', 'Indexes & Query Optimization'],
        prerequisites: ['Phase 5: Express.js'],
        estimatedTime: '1 Week',
        resources: [
          { title: 'MongoDB University Courses', resourceType: 'Course', url: 'https://learn.mongodb.com' }
        ],
        status: getInitialStatus('mongo')
      },
      {
        phaseNumber: 7,
        title: 'Phase 7: REST API Security & Authentication',
        description: 'Secure application endpoints using JWT tokens, bcrypt password hashing, and rate limiters.',
        learningObjectives: ['JSON Web Token (JWT)', 'Bcrypt Password Hashing', 'Rate Limiting & Helmet Security'],
        prerequisites: ['Phase 5 & 6'],
        estimatedTime: '1 Week',
        resources: [
          { title: 'OWASP Web Security Checklist', resourceType: 'Security Guide', url: 'https://owasp.org' }
        ],
        status: getInitialStatus('rest')
      },
      {
        phaseNumber: 8,
        title: 'Phase 8: Version Control & Git / GitHub',
        description: 'Manage codebase versioning, pull requests, branch isolation, and GitHub workflows.',
        learningObjectives: ['Git Branching & Merging', 'Resolving Merge Conflicts', 'GitHub PR Reviews & CI/CD'],
        prerequisites: ['Phase 1-7'],
        estimatedTime: '1 Week',
        resources: [
          { title: 'Pro Git Book', resourceType: 'Documentation', url: 'https://git-scm.com/book' }
        ],
        status: getInitialStatus('git')
      },
      {
        phaseNumber: 9,
        title: 'Phase 9: Full Stack Capstone Project Integration',
        description: 'Build and deploy an end-to-end MERN application to cloud platforms like Vercel and Render.',
        learningObjectives: ['End-to-End MERN Integration', 'Environment Configs & CORS', 'Cloud Deployment (Vercel/Render)'],
        prerequisites: ['Phases 1-8'],
        estimatedTime: '2 Weeks',
        resources: [
          { title: 'Vercel & Render Deployment Docs', resourceType: 'Guide', url: 'https://vercel.com/docs' }
        ],
        status: 'Not Started'
      },
      {
        phaseNumber: 10,
        title: 'Phase 10: Technical Portfolio & Interview Preparation',
        description: 'Optimize your portfolio, sharpen technical data structure problem-solving, and ace mock interviews.',
        learningObjectives: ['Technical Portfolio Presentation', 'System Design & Code Review', 'Mock Behavioral & Technical Interviews'],
        prerequisites: ['Phase 9: Capstone Project'],
        estimatedTime: '1 Week',
        resources: [
          { title: 'Tech Interview Handbook', resourceType: 'Guide', url: 'https://techinterviewhandbook.org' }
        ],
        status: 'Not Started'
      }
    ];
  }

  // Generalized Template for other careers (Data, DevOps, Cloud, Java, Python, Security)
  return [
    {
      phaseNumber: 1,
      title: `Phase 1: ${careerTitle} Core Language & Syntax`,
      description: `Master fundamental syntax, variables, data structures, and control flow for ${careerTitle}.`,
      learningObjectives: ['Language Syntax & Data Structures', 'Environment Setup', 'Basic Problem Solving'],
      prerequisites: ['Computer Basics'],
      estimatedTime: '2 Weeks',
      resources: [{ title: `${careerTitle} Fundamentals`, resourceType: 'Guide', url: 'https://developer.mozilla.org' }],
      status: getInitialStatus('python') || getInitialStatus('java') || getInitialStatus('sql')
    },
    {
      phaseNumber: 2,
      title: `Phase 2: Data Structures & Core Tools`,
      description: `Implement core algorithms, version control with Git, and data manipulation tools.`,
      learningObjectives: ['Data Structures & Collections', 'Git Version Control', 'Basic Scripting'],
      prerequisites: ['Phase 1'],
      estimatedTime: '2 Weeks',
      resources: [{ title: 'Git & Command Line Basics', resourceType: 'Tutorial', url: 'https://git-scm.com' }],
      status: getInitialStatus('git')
    },
    {
      phaseNumber: 3,
      title: `Phase 3: Domain Frameworks & Database Engineering`,
      description: `Build domain services using specialized industry frameworks and SQL/NoSQL databases.`,
      learningObjectives: ['Framework Architecture', 'Database Querying', 'API Integration'],
      prerequisites: ['Phase 2'],
      estimatedTime: '2 Weeks',
      resources: [{ title: 'Database & Framework Guide', resourceType: 'Documentation', url: 'https://w3schools.com' }],
      status: getInitialStatus('sql') || getInitialStatus('docker')
    },
    {
      phaseNumber: 4,
      title: `Phase 4: Security, Automation & DevOps Integration`,
      description: `Implement secure authentication, automated testing pipelines, and containerization.`,
      learningObjectives: ['Security Best Practices', 'Automated CI/CD Pipelines', 'Containerization'],
      prerequisites: ['Phase 3'],
      estimatedTime: '2 Weeks',
      resources: [{ title: 'DevOps & Security Standards', resourceType: 'Guide', url: 'https://docker.com' }],
      status: 'Not Started'
    },
    {
      phaseNumber: 5,
      title: `Phase 5: Production Capstone Project & Portfolio`,
      description: `Develop a comprehensive, production-ready capstone project demonstrating end-to-end expertise.`,
      learningObjectives: ['Capstone Project Execution', 'Cloud Deployment', 'Portfolio Showcase'],
      prerequisites: ['Phases 1-4'],
      estimatedTime: '2 Weeks',
      resources: [{ title: 'Portfolio Showcase Guide', resourceType: 'Guide', url: 'https://github.com' }],
      status: 'Not Started'
    }
  ];
};

// Calculate overall completion percentage based on phase statuses
const calculateProgress = (phases = []) => {
  if (!phases.length) return 0;
  const completedCount = phases.filter(p => p.status === 'Completed').length;
  return Math.round((completedCount / phases.length) * 100);
};

// @desc    Generate personalized career roadmap
// @route   POST /api/roadmaps/generate
// @access  Private
const generateRoadmap = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const { targetCareer: requestedCareer } = req.body;
    const careerTitle = requestedCareer || user.targetCareer || user.targetRole || 'Full Stack Developer';

    const phases = buildPersonalizedPhases(careerTitle, user.skills);
    const overallProgress = calculateProgress(phases);

    let roadmap = await Roadmap.findOne({ user: req.user._id });
    if (roadmap) {
      roadmap.targetCareer = careerTitle;
      roadmap.phases = phases;
      roadmap.overallProgress = overallProgress;
      await roadmap.save();
    } else {
      roadmap = await Roadmap.create({
        user: req.user._id,
        targetCareer: careerTitle,
        phases,
        overallProgress
      });
    }

    return res.status(200).json({
      success: true,
      message: `Personalized roadmap generated for ${careerTitle}`,
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's personalized roadmap
// @route   GET /api/roadmaps/:userId
// @access  Private
const getRoadmapByUserId = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId === 'me' ? req.user._id : req.params.userId;

    let roadmap = await Roadmap.findOne({ user: targetUserId });
    
    // If no roadmap exists yet, generate one automatically
    if (!roadmap) {
      const user = await User.findById(targetUserId);
      const careerTitle = user?.targetCareer || user?.targetRole || 'Full Stack Developer';
      const phases = buildPersonalizedPhases(careerTitle, user?.skills || []);
      const overallProgress = calculateProgress(phases);

      roadmap = await Roadmap.create({
        user: targetUserId,
        targetCareer: careerTitle,
        phases,
        overallProgress
      });
    }

    return res.status(200).json({
      success: true,
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress/status of a specific phase in roadmap
// @route   PUT /api/roadmaps/:id/progress
// @access  Private
const updateRoadmapProgress = async (req, res, next) => {
  try {
    const { phaseNumber, phaseId, status } = req.body;

    const validStatuses = ['Not Started', 'In Progress', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phase status. Allowed: Not Started, In Progress, Completed'
      });
    }

    const roadmap = await Roadmap.findOne({ user: req.user._id });
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found for user'
      });
    }

    // Find phase by subdocument ID or phaseNumber
    let targetPhase;
    if (phaseId) {
      targetPhase = roadmap.phases.id(phaseId);
    } else if (phaseNumber !== undefined) {
      targetPhase = roadmap.phases.find(p => p.phaseNumber === Number(phaseNumber));
    }

    if (!targetPhase) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap phase not found'
      });
    }

    targetPhase.status = status;
    roadmap.overallProgress = calculateProgress(roadmap.phases);
    await roadmap.save();

    return res.status(200).json({
      success: true,
      message: `Phase status updated to "${status}"`,
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateRoadmap,
  getRoadmapByUserId,
  updateRoadmapProgress
};
