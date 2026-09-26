const Assessment = require('../models/Assessment');
const Resource = require('../models/Resource');
const Project = require('../models/Project');
const User = require('../models/User');

const defaultAssessments = [
  {
    title: 'JavaScript Fundamentals & ES6+ Proficiency Test',
    description: 'Evaluate core JavaScript competencies including closures, async/await, promises, ES6 syntax, and array methods.',
    category: 'Frontend',
    skillName: 'JavaScript (ES6+)',
    difficulty: 'Intermediate',
    passingPercentage: 70,
    questions: [
      {
        questionText: 'Which keyword creates a block-scoped variable that cannot be reassigned?',
        options: ['var', 'let', 'const', 'static'],
        correctOptionIndex: 2,
        explanation: '`const` declares a block-scoped identifier that cannot be reassigned after initialization.'
      },
      {
        questionText: 'What will `typeof NaN` evaluate to in JavaScript?',
        options: ['number', 'nan', 'undefined', 'object'],
        correctOptionIndex: 0,
        explanation: 'In JavaScript, `NaN` (Not-a-Number) is technically of type "number".'
      },
      {
        questionText: 'Which method returns a new array with all elements that pass a provided test function?',
        options: ['map()', 'filter()', 'reduce()', 'forEach()'],
        correctOptionIndex: 1,
        explanation: '`Array.prototype.filter()` creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test.'
      },
      {
        questionText: 'How do you handle asynchronous operations cleanly without callback hell in modern JS?',
        options: ['Promises and Async/Await', 'Nested setTimeout calls', 'XMLHttpRequest synchronously', 'Global event listeners'],
        correctOptionIndex: 0,
        explanation: 'Promises and async/await syntax allow writing asynchronous code that looks and behaves like synchronous code.'
      },
      {
        questionText: 'What is the output of `[1, 2, 3].reduce((acc, val) => acc + val, 0)`?',
        options: ['6', '[1, 2, 3]', '0', 'undefined'],
        correctOptionIndex: 0,
        explanation: '`reduce` sums up elements starting from initial value 0: 0+1+2+3 = 6.'
      }
    ]
  },
  {
    title: 'React.js Component Architecture & Hooks Assessment',
    description: 'Test your mastery of React component lifecycle, state management, custom hooks, and JSX principles.',
    category: 'Frontend',
    skillName: 'React.js',
    difficulty: 'Intermediate',
    passingPercentage: 70,
    questions: [
      {
        questionText: 'Which Hook is used to perform side effects in functional React components?',
        options: ['useState', 'useContext', 'useEffect', 'useReducer'],
        correctOptionIndex: 2,
        explanation: '`useEffect` accepts a function that contains imperative, possibly effectful code.'
      },
      {
        questionText: 'What parameter should be passed as the second argument to `useEffect` to run the effect only on mount?',
        options: ['An empty array `[]`', '`null`', '`true`', 'No second argument'],
        correctOptionIndex: 0,
        explanation: 'Passing an empty dependency array `[]` tells React to run the effect callback only once when the component mounts.'
      },
      {
        questionText: 'How do you pass data down a React component tree without manually drilling props?',
        options: ['React Context API', 'Redux Store strictly', 'Global window variables', 'DOM query selectors'],
        correctOptionIndex: 0,
        explanation: 'React Context provides a way to share values like user info or UI themes between components without explicitly passing a prop through every level of the tree.'
      }
    ]
  },
  {
    title: 'Node.js & Express REST API Skill Assessment',
    description: 'Validate backend knowledge of Node.js event loop, Express middleware pipelines, route controllers, and HTTP status codes.',
    category: 'Backend',
    skillName: 'Node.js',
    difficulty: 'Intermediate',
    passingPercentage: 70,
    questions: [
      {
        questionText: 'Which Express method mounts middleware functions at the specified path?',
        options: ['app.use()', 'app.listen()', 'app.route()', 'app.mount()'],
        correctOptionIndex: 0,
        explanation: '`app.use()` mounts specified middleware function(s) at the specified path.'
      },
      {
        questionText: 'What HTTP status code represents successful creation of a resource?',
        options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
        correctOptionIndex: 1,
        explanation: '`201 Created` indicates that the request has succeeded and led to the creation of a resource.'
      },
      {
        questionText: 'Which core Node module is used for handling file system operations?',
        options: ['http', 'fs', 'path', 'url'],
        correctOptionIndex: 1,
        explanation: 'The `fs` module enables interacting with the file system in a way modeled on standard POSIX functions.'
      }
    ]
  }
];

const defaultResources = [
  {
    title: 'MDN Web Docs: Modern JavaScript (ES6+)',
    description: 'Official comprehensive reference documentation for JavaScript language syntax, standard objects, and modern features.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    type: 'Documentation',
    skill: 'JavaScript (ES6+)',
    difficulty: 'Beginner'
  },
  {
    title: 'React Official Documentation & Interactive Tutorials',
    description: 'Learn React starting with fundamental component composition to advanced state management and hooks.',
    url: 'https://react.dev/learn',
    type: 'Documentation',
    skill: 'React.js',
    difficulty: 'Beginner'
  },
  {
    title: 'Node.js Documentation & Architectural Guides',
    description: 'Official API documentation for Node.js runtime environment, event loop execution, and asynchronous IO.',
    url: 'https://nodejs.org/en/docs',
    type: 'Documentation',
    skill: 'Node.js',
    difficulty: 'Intermediate'
  },
  {
    title: 'Express.js Security & Best Practices Guide',
    description: 'Production best practices for building robust and secure RESTful Web APIs using Express framework.',
    url: 'https://expressjs.com/en/advanced/best-practice-security.html',
    type: 'Article',
    skill: 'Express.js',
    difficulty: 'Intermediate'
  },
  {
    title: 'MongoDB University: Data Modeling & Schema Design',
    description: 'Free comprehensive courses for NoSQL document modeling, indexing strategies, and query performance.',
    url: 'https://learn.mongodb.com',
    type: 'Course',
    skill: 'MongoDB',
    difficulty: 'Intermediate'
  }
];

const defaultProjects = [
  {
    title: 'SmartSkill Gap & Career Roadmap Platform',
    description: 'Build a full-stack web application allowing students to analyze skill gaps, calculate career readiness, and follow personalized learning roadmaps.',
    difficulty: 'Intermediate',
    requiredSkills: ['JavaScript (ES6+)', 'React.js', 'Node.js', 'Express.js', 'MongoDB'],
    skillsGained: ['Full-Stack MERN Architecture', 'JWT Authentication', 'MongoDB Aggregations', 'REST API Integration'],
    estimatedDuration: '2-3 Weeks',
    githubUrl: 'https://github.com/example/smartskillgap',
    demoUrl: 'https://smartskillgap.demo.app',
    targetCareers: ['Full Stack Developer', 'Frontend Developer', 'Backend Developer']
  },
  {
    title: 'E-Commerce REST API & Inventory Service',
    description: 'Design a high-performance backend microservice for managing product catalogs, shopping carts, checkout workflows, and user authentication.',
    difficulty: 'Advanced',
    requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'RESTful API Design'],
    skillsGained: ['Database Schema Design', 'Role-Based Access Control', 'Payment Gateway Integration', 'API Rate Limiting'],
    estimatedDuration: '2 Weeks',
    githubUrl: 'https://github.com/example/ecommerce-api',
    demoUrl: 'https://ecommerce-api.demo.app',
    targetCareers: ['Backend Developer', 'Full Stack Developer']
  },
  {
    title: 'Interactive Analytics & Metrics Dashboard',
    description: 'Create a responsive React single-page dashboard featuring dynamic charts, dark mode, CSV data exports, and real-time statistics updates.',
    difficulty: 'Intermediate',
    requiredSkills: ['React.js', 'Tailwind CSS', 'JavaScript (ES6+)'],
    skillsGained: ['Data Visualization', 'UI Design Tokens', 'State Management', 'Responsive Design'],
    estimatedDuration: '1-2 Weeks',
    githubUrl: 'https://github.com/example/analytics-dashboard',
    demoUrl: 'https://analytics-dashboard.demo.app',
    targetCareers: ['Frontend Developer', 'Data Analyst']
  }
];

const seedDefaultAdminIfEmpty = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@smartskill.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@smartskill.com',
        password: 'AdminPassword123!',
        role: 'admin',
        targetCareer: 'Full Stack Web Developer'
      });
      console.log('[Seed Engine] Default admin account (admin@smartskill.com) created.');
    }
  } catch (err) {
    console.error('[Seed Engine] Error seeding default admin:', err.message);
  }
};

const seedPlatformDataIfEmpty = async () => {
  try {
    await seedDefaultAdminIfEmpty();

    const assessmentCount = await Assessment.countDocuments();
    if (assessmentCount === 0) {
      await Assessment.insertMany(defaultAssessments);
      console.log('[Seed Engine] Default assessment suites created successfully.');
    }

    const resourceCount = await Resource.countDocuments();
    if (resourceCount === 0) {
      await Resource.insertMany(defaultResources);
      console.log('[Seed Engine] Default learning resources seeded successfully.');
    }

    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.insertMany(defaultProjects);
      console.log('[Seed Engine] Default project recommendations seeded successfully.');
    }
  } catch (err) {
    console.error('[Seed Engine] Error seeding platform data:', err.message);
  }
};

module.exports = seedPlatformDataIfEmpty;
