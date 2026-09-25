const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Skill = require('../models/Skill');
const Career = require('../models/Career');
const UserSkill = require('../models/UserSkill');
const CareerSkill = require('../models/CareerSkill');
const Roadmap = require('../models/Roadmap');
const Resource = require('../models/Resource');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const Progress = require('../models/Progress');
const Project = require('../models/Project');

let isSeeding = false;

const seedData = async () => {
  if (isSeeding) {
    console.log('⏳ Seeding already in progress, skipping concurrent call...');
    return;
  }
  isSeeding = true;

  try {
    console.log('🌱 Starting SmartSkill Database Seeding...');

    // Clear existing data across all collections
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Career.deleteMany({});
    await UserSkill.deleteMany({});
    await CareerSkill.deleteMany({});
    await Roadmap.deleteMany({});
    await Resource.deleteMany({});
    await Assessment.deleteMany({});
    await AssessmentResult.deleteMany({});
    await Progress.deleteMany({});
    await Project.deleteMany({});

    console.log('🧹 Existing collections cleared.');

    // -------------------------------------------------------------
    // 1. CREATE 35+ SKILLS
    // -------------------------------------------------------------
    const skillsRaw = [
      // Frontend
      { name: 'JavaScript', category: 'Frontend', description: 'Core programming language of the modern web', icon: 'FileCode' },
      { name: 'TypeScript', category: 'Frontend', description: 'Typed superset of JavaScript for scalable applications', icon: 'FileText' },
      { name: 'React.js', category: 'Frontend', description: 'Declarative component-based UI library', icon: 'Code' },
      { name: 'Next.js', category: 'Frontend', description: 'Full-stack React framework with SSR and SSG', icon: 'Globe' },
      { name: 'HTML5 & CSS3', category: 'Frontend', description: 'Web markup and modern CSS layout techniques', icon: 'Layout' },
      { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework for modern styling', icon: 'Palette' },
      { name: 'Vue.js', category: 'Frontend', description: 'Progressive JavaScript framework for building UIs', icon: 'Layers' },

      // Backend
      { name: 'Node.js', category: 'Backend', description: 'Event-driven asynchronous JavaScript runtime', icon: 'Server' },
      { name: 'Express.js', category: 'Backend', description: 'Fast, unopinionated web framework for Node.js', icon: 'Cpu' },
      { name: 'Python', category: 'Backend', description: 'High-level versatile programming language', icon: 'Terminal' },
      { name: 'Java', category: 'Backend', description: 'Object-oriented language for enterprise applications', icon: 'Coffee' },
      { name: 'Go', category: 'Backend', description: 'Statically typed language built for concurrency and speed', icon: 'Zap' },
      { name: 'REST API Design', category: 'Backend', description: 'Architecture style for designing networked APIs', icon: 'Network' },
      { name: 'GraphQL', category: 'Backend', description: 'Query language for APIs and client-driven data fetching', icon: 'Share2' },
      { name: 'Microservices Architecture', category: 'Backend', description: 'Designing loosely coupled, distributed software services', icon: 'Box' },

      // Database
      { name: 'PostgreSQL', category: 'Database', description: 'Advanced open-source relational database', icon: 'Database' },
      { name: 'MongoDB', category: 'Database', description: 'Flexible NoSQL document database', icon: 'HardDrive' },
      { name: 'Redis', category: 'Database', description: 'In-memory key-value data structure store for caching', icon: 'Activity' },
      { name: 'SQL & Analytics', category: 'Database', description: 'Relational data query language and data warehousing', icon: 'Table' },

      // DevOps & Cloud
      { name: 'Docker', category: 'DevOps', description: 'Containerization platform for application isolation', icon: 'Box' },
      { name: 'Kubernetes', category: 'DevOps', description: 'Automated container orchestration platform', icon: 'Sliders' },
      { name: 'AWS Cloud', category: 'DevOps', description: 'Amazon Web Services cloud computing ecosystem', icon: 'Cloud' },
      { name: 'CI/CD Pipelines', category: 'DevOps', description: 'Continuous integration and continuous deployment automation', icon: 'GitPullRequest' },
      { name: 'Linux System Admin', category: 'DevOps', description: 'Linux server management, bash scripting, and administration', icon: 'Terminal' },
      { name: 'Terraform', category: 'DevOps', description: 'Infrastructure as Code software tool', icon: 'Feather' },

      // Data & AI/ML
      { name: 'Data Analysis & Pandas', category: 'Data Science', description: 'Data manipulation and quantitative analysis using Python', icon: 'BarChart2' },
      { name: 'Data Visualization', category: 'Data Science', description: 'Communicating complex data insights via visual charts', icon: 'PieChart' },
      { name: 'Machine Learning', category: 'Data Science', description: 'Predictive modeling and statistical learning algorithms', icon: 'Cpu' },
      { name: 'TensorFlow & PyTorch', category: 'Data Science', description: 'Deep learning frameworks for neural networks', icon: 'Sliders' },
      { name: 'NLP & LLMs', category: 'Data Science', description: 'Natural Language Processing and Large Language Models', icon: 'MessageSquare' },

      // Security
      { name: 'Cybersecurity Fundamentals', category: 'Security', description: 'Principles of information security, threat modeling, and defense', icon: 'Shield' },
      { name: 'Web Security & OWASP', category: 'Security', description: 'Securing web applications against vulnerabilities like XSS, CSRF, SQLi', icon: 'Lock' },
      { name: 'Network Security', category: 'Security', description: 'Firewalls, VPNs, packet analysis, and secure protocols', icon: 'Key' },

      // UI/UX & Design
      { name: 'UI/UX Design & Figma', category: 'UI/UX Design', description: 'User interface design, prototyping, and design systems in Figma', icon: 'Figma' },
      { name: 'User Research & Wireframing', category: 'UI/UX Design', description: 'User testing, persona creation, and low-fidelity prototyping', icon: 'Edit3' },

      // Tools
      { name: 'Git & GitHub', category: 'Tools & Soft Skills', description: 'Distributed version control system and collaborative development', icon: 'GitBranch' }
    ];

    const createdSkills = await Skill.create(skillsRaw);
    console.log(`✅ Created ${createdSkills.length} skills.`);

    // Map skill name -> skill object for easy ref
    const skillMap = {};
    createdSkills.forEach(s => {
      skillMap[s.name] = s;
    });

    // -------------------------------------------------------------
    // 2. CREATE 10 CAREERS
    // -------------------------------------------------------------
    const careersRaw = [
      {
        title: 'Full Stack Developer',
        slug: 'full-stack-developer',
        description: 'Design and implement client-side and server-side web application architectures from frontend UI to backend APIs and databases.',
        category: 'Software Engineering',
        demand: 'Critical',
        salaryRange: '$90,000 - $145,000 / year',
        icon: 'Code'
      },
      {
        title: 'Frontend Developer',
        slug: 'frontend-developer',
        description: 'Specialize in building visually striking, responsive, accessible, and performant user interfaces for web applications.',
        category: 'Software Engineering',
        demand: 'Very High',
        salaryRange: '$85,000 - $130,000 / year',
        icon: 'Layout'
      },
      {
        title: 'Backend Developer',
        slug: 'backend-developer',
        description: 'Build robust, scalable server-side systems, microservices, databases, and high-performance RESTful/GraphQL APIs.',
        category: 'Software Engineering',
        demand: 'High',
        salaryRange: '$95,000 - $150,000 / year',
        icon: 'Server'
      },
      {
        title: 'Data Analyst',
        slug: 'data-analyst',
        description: 'Transform raw datasets into actionable business intelligence through data cleaning, statistical modeling, and interactive dashboards.',
        category: 'Data & Analytics',
        demand: 'High',
        salaryRange: '$75,000 - $115,000 / year',
        icon: 'BarChart2'
      },
      {
        title: 'Data Scientist',
        slug: 'data-scientist',
        description: 'Apply advanced statistical methods, machine learning, and predictive modeling to solve complex enterprise problems.',
        category: 'Data & Analytics',
        demand: 'Very High',
        salaryRange: '$110,000 - $165,000 / year',
        icon: 'Cpu'
      },
      {
        title: 'AI/ML Engineer',
        slug: 'ai-ml-engineer',
        description: 'Develop production-ready machine learning pipelines, deep learning neural networks, and LLM applications.',
        category: 'Artificial Intelligence',
        demand: 'Critical',
        salaryRange: '$120,000 - $185,000 / year',
        icon: 'Zap'
      },
      {
        title: 'Cloud Engineer',
        slug: 'cloud-engineer',
        description: 'Architect, deploy, and manage scalable cloud infrastructure across AWS, Azure, or GCP cloud platforms.',
        category: 'Infrastructure',
        demand: 'High',
        salaryRange: '$100,000 - $155,000 / year',
        icon: 'Cloud'
      },
      {
        title: 'Cybersecurity Analyst',
        slug: 'cybersecurity-analyst',
        description: 'Protect organizational networks, applications, and sensitive assets against cyber attacks, breaches, and exploits.',
        category: 'Security',
        demand: 'Critical',
        salaryRange: '$95,000 - $150,000 / year',
        icon: 'Shield'
      },
      {
        title: 'DevOps Engineer',
        slug: 'devops-engineer',
        description: 'Bridge software development and operations through automated CI/CD pipelines, container orchestration, and infrastructure automation.',
        category: 'Infrastructure',
        demand: 'Very High',
        salaryRange: '$105,000 - $160,000 / year',
        icon: 'Sliders'
      },
      {
        title: 'UI/UX Designer',
        slug: 'ui-ux-designer',
        description: 'Craft intuitive, accessible, and delightful digital user experiences, high-fidelity prototypes, and cohesive design systems.',
        category: 'Design',
        demand: 'High',
        salaryRange: '$80,000 - $125,000 / year',
        icon: 'Figma'
      }
    ];

    const createdCareers = await Career.create(careersRaw);
    console.log(`✅ Created ${createdCareers.length} careers.`);

    const careerMap = {};
    createdCareers.forEach(c => {
      careerMap[c.title] = c;
    });

    // -------------------------------------------------------------
    // 3. CREATE CAREER SKILL REQUIREMENTS (CareerSkill)
    // -------------------------------------------------------------
    const careerSkillsRaw = [
      // Full Stack Developer
      { career: careerMap['Full Stack Developer']._id, skill: skillMap['JavaScript']._id, requiredLevel: 3, priority: 'critical' },
      { career: careerMap['Full Stack Developer']._id, skill: skillMap['React.js']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['Full Stack Developer']._id, skill: skillMap['Node.js']._id, requiredLevel: 3, priority: 'critical' },
      { career: careerMap['Full Stack Developer']._id, skill: skillMap['HTML5 & CSS3']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['Full Stack Developer']._id, skill: skillMap['MongoDB']._id, requiredLevel: 2, priority: 'medium' },
      { career: careerMap['Full Stack Developer']._id, skill: skillMap['REST API Design']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['Full Stack Developer']._id, skill: skillMap['Git & GitHub']._id, requiredLevel: 3, priority: 'high' },

      // Frontend Developer
      { career: careerMap['Frontend Developer']._id, skill: skillMap['JavaScript']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['Frontend Developer']._id, skill: skillMap['TypeScript']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['Frontend Developer']._id, skill: skillMap['React.js']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['Frontend Developer']._id, skill: skillMap['HTML5 & CSS3']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['Frontend Developer']._id, skill: skillMap['Tailwind CSS']._id, requiredLevel: 3, priority: 'medium' },
      { career: careerMap['Frontend Developer']._id, skill: skillMap['UI/UX Design & Figma']._id, requiredLevel: 2, priority: 'low' },

      // Backend Developer
      { career: careerMap['Backend Developer']._id, skill: skillMap['Node.js']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['Backend Developer']._id, skill: skillMap['Express.js']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['Backend Developer']._id, skill: skillMap['PostgreSQL']._id, requiredLevel: 3, priority: 'critical' },
      { career: careerMap['Backend Developer']._id, skill: skillMap['REST API Design']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['Backend Developer']._id, skill: skillMap['Redis']._id, requiredLevel: 2, priority: 'medium' },
      { career: careerMap['Backend Developer']._id, skill: skillMap['Microservices Architecture']._id, requiredLevel: 3, priority: 'high' },

      // Data Analyst
      { career: careerMap['Data Analyst']._id, skill: skillMap['SQL & Analytics']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['Data Analyst']._id, skill: skillMap['Data Analysis & Pandas']._id, requiredLevel: 3, priority: 'critical' },
      { career: careerMap['Data Analyst']._id, skill: skillMap['Data Visualization']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['Data Analyst']._id, skill: skillMap['Python']._id, requiredLevel: 2, priority: 'medium' },

      // Data Scientist
      { career: careerMap['Data Scientist']._id, skill: skillMap['Python']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['Data Scientist']._id, skill: skillMap['Data Analysis & Pandas']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['Data Scientist']._id, skill: skillMap['Machine Learning']._id, requiredLevel: 3, priority: 'critical' },
      { career: careerMap['Data Scientist']._id, skill: skillMap['SQL & Analytics']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['Data Scientist']._id, skill: skillMap['TensorFlow & PyTorch']._id, requiredLevel: 2, priority: 'medium' },

      // AI/ML Engineer
      { career: careerMap['AI/ML Engineer']._id, skill: skillMap['Python']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['AI/ML Engineer']._id, skill: skillMap['Machine Learning']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['AI/ML Engineer']._id, skill: skillMap['TensorFlow & PyTorch']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['AI/ML Engineer']._id, skill: skillMap['NLP & LLMs']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['AI/ML Engineer']._id, skill: skillMap['Docker']._id, requiredLevel: 2, priority: 'medium' },

      // Cloud Engineer
      { career: careerMap['Cloud Engineer']._id, skill: skillMap['AWS Cloud']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['Cloud Engineer']._id, skill: skillMap['Docker']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['Cloud Engineer']._id, skill: skillMap['Kubernetes']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['Cloud Engineer']._id, skill: skillMap['Terraform']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['Cloud Engineer']._id, skill: skillMap['Linux System Admin']._id, requiredLevel: 3, priority: 'critical' },

      // Cybersecurity Analyst
      { career: careerMap['Cybersecurity Analyst']._id, skill: skillMap['Cybersecurity Fundamentals']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['Cybersecurity Analyst']._id, skill: skillMap['Web Security & OWASP']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['Cybersecurity Analyst']._id, skill: skillMap['Network Security']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['Cybersecurity Analyst']._id, skill: skillMap['Linux System Admin']._id, requiredLevel: 3, priority: 'high' },

      // DevOps Engineer
      { career: careerMap['DevOps Engineer']._id, skill: skillMap['Docker']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['DevOps Engineer']._id, skill: skillMap['Kubernetes']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['DevOps Engineer']._id, skill: skillMap['CI/CD Pipelines']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['DevOps Engineer']._id, skill: skillMap['AWS Cloud']._id, requiredLevel: 3, priority: 'high' },
      { career: careerMap['DevOps Engineer']._id, skill: skillMap['Linux System Admin']._id, requiredLevel: 4, priority: 'critical' },

      // UI/UX Designer
      { career: careerMap['UI/UX Designer']._id, skill: skillMap['UI/UX Design & Figma']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['UI/UX Designer']._id, skill: skillMap['User Research & Wireframing']._id, requiredLevel: 4, priority: 'critical' },
      { career: careerMap['UI/UX Designer']._id, skill: skillMap['HTML5 & CSS3']._id, requiredLevel: 2, priority: 'medium' }
    ];

    const createdCareerSkills = await CareerSkill.create(careerSkillsRaw);
    console.log(`✅ Created ${createdCareerSkills.length} career-skill requirement links.`);

    // -------------------------------------------------------------
    // 4. CREATE 50+ LEARNING RESOURCES
    // -------------------------------------------------------------
    const resourcesData = [];
    const resourceTypes = ['article', 'video', 'course', 'documentation', 'book', 'tutorial'];

    const resourceTemplates = [
      { name: 'JavaScript', base: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', desc: 'Comprehensive JS guide and documentation.' },
      { name: 'TypeScript', base: 'https://www.typescriptlang.org/docs', desc: 'Official handbook for static typing in JavaScript.' },
      { name: 'React.js', base: 'https://react.dev/learn', desc: 'Official interactive tutorial and documentation for React.' },
      { name: 'Next.js', base: 'https://nextjs.org/docs', desc: 'Learn server-side rendering, routing, and optimization.' },
      { name: 'HTML5 & CSS3', base: 'https://web.dev/learn/css', desc: 'Modern responsive web layouts, grid, and flexbox.' },
      { name: 'Tailwind CSS', base: 'https://tailwindcss.com/docs', desc: 'Utility-first framework documentation and component styling.' },
      { name: 'Node.js', base: 'https://nodejs.org/en/docs', desc: 'In-depth guide on Node runtime and event loop.' },
      { name: 'Express.js', base: 'https://expressjs.com/en/starter/installing.html', desc: 'Building scalable REST services with Express.' },
      { name: 'Python', base: 'https://docs.python.org/3/tutorial', desc: 'Official Python programming tutorial for beginners to pros.' },
      { name: 'PostgreSQL', base: 'https://www.postgresqltutorial.com', desc: 'Relational database query design, joins, and indexing.' },
      { name: 'MongoDB', base: 'https://learn.mongodb.com', desc: 'NoSQL document modeling, indexing, and aggregation pipelines.' },
      { name: 'Docker', base: 'https://docs.docker.com/get-started', desc: 'Containerizing applications, Dockerfiles, and compose files.' },
      { name: 'Kubernetes', base: 'https://kubernetes.io/docs/tutorials', desc: 'Orchestrating container clusters and microservices.' },
      { name: 'AWS Cloud', base: 'https://aws.amazon.com/getting-started', desc: 'Cloud computing fundamentals: EC2, S3, Lambda, and IAM.' },
      { name: 'Data Analysis & Pandas', base: 'https://pandas.pydata.org/docs/user_guide', desc: 'Data wrangling, cleaning, and quantitative analysis.' },
      { name: 'Machine Learning', base: 'https://scikit-learn.org/stable/user_guide.html', desc: 'Supervised and unsupervised learning algorithms in Python.' },
      { name: 'Cybersecurity Fundamentals', base: 'https://www.cybrary.it', desc: 'Security operations, threat analysis, and network defense.' },
      { name: 'UI/UX Design & Figma', base: 'https://help.figma.com/hc/en-us', desc: 'Mastering component variants, auto layout, and prototyping.' },
      { name: 'Git & GitHub', base: 'https://git-scm.com/doc', desc: 'Version control branching, rebasing, and collaborative PR workflow.' }
    ];

    let resourceCounter = 1;
    resourceTemplates.forEach(item => {
      if (skillMap[item.name]) {
        // Create 3 resources per template skill
        resourcesData.push({
          title: `${item.name} Fundamentals & Crash Course`,
          description: item.desc,
          url: `${item.base}/fundamentals-${resourceCounter}`,
          type: 'course',
          skill: skillMap[item.name]._id,
          difficulty: 'beginner',
          targetLevel: 1,
          isFree: true,
          provider: 'SmartSkill Academy'
        });
        resourcesData.push({
          title: `Mastering ${item.name} - Deep Dive`,
          description: `Advanced patterns, best practices, and performance tuning for ${item.name}.`,
          url: `${item.base}/advanced-${resourceCounter}`,
          type: 'documentation',
          skill: skillMap[item.name]._id,
          difficulty: 'intermediate',
          targetLevel: 2,
          isFree: true,
          provider: 'Official Docs'
        });
        resourcesData.push({
          title: `${item.name} Architecture & Production Patterns`,
          description: `Real-world production case studies and architectural blueprints for ${item.name}.`,
          url: `${item.base}/architecture-${resourceCounter}`,
          type: 'video',
          skill: skillMap[item.name]._id,
          difficulty: 'advanced',
          targetLevel: 3,
          isFree: false,
          provider: 'Tech Conference'
        });
        resourceCounter++;
      }
    });

    // Add extra resources to hit 50+
    const extraSkillNames = Object.keys(skillMap);
    for (let i = 0; i < extraSkillNames.length && resourcesData.length < 55; i++) {
      const sName = extraSkillNames[i];
      resourcesData.push({
        title: `${sName} Practical Hands-On Tutorial #${i + 1}`,
        description: `Step-by-step practical implementation guide for ${sName}.`,
        url: `https://example.com/tutorials/${sName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
        type: resourceTypes[i % resourceTypes.length],
        skill: skillMap[sName]._id,
        difficulty: (i % 3 === 0) ? 'beginner' : (i % 3 === 1) ? 'intermediate' : 'advanced',
        targetLevel: (i % 4) + 1,
        isFree: i % 2 === 0,
        provider: 'Community Portal'
      });
    }

    const createdResources = await Resource.create(resourcesData);
    console.log(`✅ Created ${createdResources.length} learning resources.`);

    // -------------------------------------------------------------
    // 5. CREATE 10+ PROJECTS
    // -------------------------------------------------------------
    const projectsRaw = [
      {
        title: 'Smart Skill Gap & Roadmap Dashboard',
        description: 'Build a full-stack platform featuring skill assessment testing, readiness scores, and visual gap charts.',
        difficulty: 'advanced',
        requiredSkills: [skillMap['React.js']._id, skillMap['Node.js']._id, skillMap['Express.js']._id],
        skillsGained: [skillMap['REST API Design']._id, skillMap['MongoDB']._id, skillMap['JavaScript']._id],
        estimatedDuration: '25-30 hours',
        githubUrl: 'https://github.com/example/smart-skillgap',
        demoUrl: 'https://smartskillgap.demo.app'
      },
      {
        title: 'Real-Time E-Commerce REST API Microservice',
        description: 'Design a high-throughput backend with authentication, product catalog filtering, cart management, and payment gateway.',
        difficulty: 'advanced',
        requiredSkills: [skillMap['Node.js']._id, skillMap['PostgreSQL']._id, skillMap['REST API Design']._id],
        skillsGained: [skillMap['Redis']._id, skillMap['Docker']._id, skillMap['Microservices Architecture']._id],
        estimatedDuration: '30-40 hours',
        githubUrl: 'https://github.com/example/ecommerce-backend-api',
        demoUrl: 'https://api.ecommerce.demo.app'
      },
      {
        title: 'Interactive Task & Kanban Project Manager',
        description: 'Build a drag-and-drop task board with user roles, drag reordering, real-time sync, and deadline reminders.',
        difficulty: 'intermediate',
        requiredSkills: [skillMap['React.js']._id, skillMap['JavaScript']._id, skillMap['HTML5 & CSS3']._id],
        skillsGained: [skillMap['Tailwind CSS']._id, skillMap['TypeScript']._id],
        estimatedDuration: '15-20 hours',
        githubUrl: 'https://github.com/example/kanban-flow',
        demoUrl: 'https://kanbanflow.demo.app'
      },
      {
        title: 'Automated CI/CD Deployment Pipeline for Microservices',
        description: 'Configure automated GitHub Actions workflows to build Docker images and deploy onto Kubernetes clusters on AWS.',
        difficulty: 'advanced',
        requiredSkills: [skillMap['Docker']._id, skillMap['CI/CD Pipelines']._id, skillMap['Linux System Admin']._id],
        skillsGained: [skillMap['Kubernetes']._id, skillMap['AWS Cloud']._id, skillMap['Terraform']._id],
        estimatedDuration: '20-25 hours',
        githubUrl: 'https://github.com/example/devops-k8s-pipeline',
        demoUrl: 'https://devops.demo.app'
      },
      {
        title: 'Customer Churn Prediction Model',
        description: 'Analyze telemetry and billing data to build predictive machine learning models for telecom customer retention.',
        difficulty: 'intermediate',
        requiredSkills: [skillMap['Python']._id, skillMap['Data Analysis & Pandas']._id],
        skillsGained: [skillMap['Machine Learning']._id, skillMap['Data Visualization']._id],
        estimatedDuration: '15-20 hours',
        githubUrl: 'https://github.com/example/customer-churn-ml',
        demoUrl: 'https://churn-predictor.demo.app'
      },
      {
        title: 'AI Document Summarizer & Q&A Assistant',
        description: 'Build an LLM-powered application using Retrieval-Augmented Generation (RAG) to query PDF documents.',
        difficulty: 'advanced',
        requiredSkills: [skillMap['Python']._id, skillMap['NLP & LLMs']._id],
        skillsGained: [skillMap['TensorFlow & PyTorch']._id, skillMap['REST API Design']._id],
        estimatedDuration: '20-30 hours',
        githubUrl: 'https://github.com/example/rag-doc-summarizer',
        demoUrl: 'https://rag-summarizer.demo.app'
      },
      {
        title: 'Enterprise Vulnerability Scanner & OWASP Auditor',
        description: 'Create an automated security audit tool that inspects web endpoints for headers, SSL config, and top OWASP flaws.',
        difficulty: 'advanced',
        requiredSkills: [skillMap['Cybersecurity Fundamentals']._id, skillMap['Web Security & OWASP']._id],
        skillsGained: [skillMap['Network Security']._id, skillMap['Linux System Admin']._id],
        estimatedDuration: '20-25 hours',
        githubUrl: 'https://github.com/example/owasp-auditor',
        demoUrl: 'https://security.demo.app'
      },
      {
        title: 'Design System & Mobile App Prototype in Figma',
        description: 'Create a full design system with auto-layout components, color tokens, and interactive mobile prototypes.',
        difficulty: 'beginner',
        requiredSkills: [skillMap['UI/UX Design & Figma']._id],
        skillsGained: [skillMap['User Research & Wireframing']._id],
        estimatedDuration: '10-15 hours',
        githubUrl: 'https://github.com/example/figma-design-system',
        demoUrl: 'https://figma.com/@design-system-demo'
      },
      {
        title: 'Real-Time Collaborative Code Editor',
        description: 'Build a browser-based code editor supporting syntax highlighting, WebSocket live cursor syncing, and live execution.',
        difficulty: 'advanced',
        requiredSkills: [skillMap['React.js']._id, skillMap['Node.js']._id, skillMap['TypeScript']._id],
        skillsGained: [skillMap['REST API Design']._id, skillMap['Git & GitHub']._id],
        estimatedDuration: '25-35 hours',
        githubUrl: 'https://github.com/example/live-code-editor',
        demoUrl: 'https://code-live.demo.app'
      },
      {
        title: 'Financial Data Analytics & Portfolio Dashboard',
        description: 'Aggregate stock prices and economic indicators into interactive time-series plots and return rate indicators.',
        difficulty: 'intermediate',
        requiredSkills: [skillMap['SQL & Analytics']._id, skillMap['Data Analysis & Pandas']._id],
        skillsGained: [skillMap['Data Visualization']._id, skillMap['Python']._id],
        estimatedDuration: '15-20 hours',
        githubUrl: 'https://github.com/example/finance-analytics',
        demoUrl: 'https://finance-dashboard.demo.app'
      },
      {
        title: 'Responsive Personal Portfolio & Blog Engine',
        description: 'Develop a modern, lightning-fast portfolio site using Next.js, static site generation, and Markdown blogging.',
        difficulty: 'beginner',
        requiredSkills: [skillMap['HTML5 & CSS3']._id, skillMap['JavaScript']._id],
        skillsGained: [skillMap['Next.js']._id, skillMap['Tailwind CSS']._id],
        estimatedDuration: '8-12 hours',
        githubUrl: 'https://github.com/example/next-portfolio',
        demoUrl: 'https://my-portfolio.demo.app'
      }
    ];

    const createdProjects = await Project.create(projectsRaw);
    console.log(`✅ Created ${createdProjects.length} real-world projects.`);

    // -------------------------------------------------------------
    // 6. CREATE 5+ MAJOR ASSESSMENTS (10 QUESTIONS EACH)
    // -------------------------------------------------------------

    // Assessment 1: JavaScript & ES6+ Core
    const jsQuestions = [
      { questionText: 'What is the output of `typeof null` in JavaScript?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correctAnswer: 2, explanation: '`typeof null` returns `"object"` due to a legacy bug in JS design.', points: 10 },
      { questionText: 'Which keyword creates a block-scoped variable that cannot be re-assigned?', options: ['var', 'let', 'const', 'global'], correctAnswer: 2, explanation: '`const` creates a block-scoped binding that cannot be reassigned.', points: 10 },
      { questionText: 'What does a Promise represent in JavaScript?', options: ['A synchronous function execution', 'The eventual completion or failure of an asynchronous operation', 'A DOM event listener', 'An array transformation'], correctAnswer: 1, explanation: 'Promises represent asynchronous operation outcomes.', points: 10 },
      { questionText: 'Which array method returns a new array with elements that pass a testing function?', options: ['map()', 'filter()', 'reduce()', 'forEach()'], correctAnswer: 1, explanation: '`filter()` creates a new array filtered by test condition.', points: 10 },
      { questionText: 'What is closure in JavaScript?', options: ['A function bundled together with references to its surrounding state', 'Closing a database connection', 'Ending an event loop cycle', 'Hiding HTML elements'], correctAnswer: 0, explanation: 'A closure gives access to an outer function scope from an inner function.', points: 10 },
      { questionText: 'What value does `this` take in an arrow function?', options: ['The window object always', 'The lexical enclosing context value of `this`', 'The object that invoked the function', 'undefined'], correctAnswer: 1, explanation: 'Arrow functions do not bind their own `this`; they inherit it lexically.', points: 10 },
      { questionText: 'What is the purpose of `async/await` syntax?', options: ['To block the main UI thread', 'To write asynchronous code that looks and behaves like synchronous code', 'To compile JS into C++', 'To force synchronous network calls'], correctAnswer: 1, explanation: '`async/await` simplifies working with Promise chains.', points: 10 },
      { questionText: 'Which operator is used for safe property navigation in deep objects?', options: ['??', '||', '?.', '::'], correctAnswer: 2, explanation: 'Optional chaining `?.` prevents errors on null/undefined objects.', points: 10 },
      { questionText: 'What is the event loop responsibility in Node.js/V8?', options: ['Handling CPU-bound loops', 'Executing callbacks, handling non-blocking I/O operations', 'Managing CSS rendering', 'Compiling TypeScript to JS'], correctAnswer: 1, explanation: 'The event loop processes non-blocking I/O callbacks.', points: 10 },
      { questionText: 'What is the difference between `==` and `===`?', options: ['`==` performs type coercion; `===` checks value and type strictly', 'There is no difference', '`===` converts strings to numbers automatically', '`==` is faster than `===`'], correctAnswer: 0, explanation: '`===` is strict equality without type coercion.', points: 10 }
    ];

    // Assessment 2: React.js Component Architecture
    const reactQuestions = [
      { questionText: 'What is the primary role of the `useState` hook in React?', options: ['To perform HTTP requests', 'To declare state variables in functional components', 'To define CSS styling', 'To manipulate the DOM directly'], correctAnswer: 1, explanation: '`useState` adds state management to functional React components.', points: 10 },
      { questionText: 'When does the `useEffect` hook with an empty dependency array `[]` run?', options: ['On every render cycle', 'Only once after the initial render (component mount)', 'Before component unmounts only', 'When props update'], correctAnswer: 1, explanation: 'An empty dependency array causes `useEffect` to execute once on mount.', points: 10 },
      { questionText: 'Why should keys be unique when rendering a list of items in React?', options: ['Keys help React identify which items have changed, added, or removed', 'Keys style list items', 'Keys are required for CSS flexbox', 'Keys encrypt component state'], correctAnswer: 0, explanation: 'Keys optimize DOM reconciliation during list updates.', points: 10 },
      { questionText: 'What is the Virtual DOM in React?', options: ['A direct copy of the browser DOM written in HTML', 'An in-memory lightweight representation of the real DOM tree', 'A database engine inside React', 'A browser extension for debugging'], correctAnswer: 1, explanation: 'The Virtual DOM allows React to compute fast diffs before updates.', points: 10 },
      { questionText: 'What is the purpose of `useMemo` hook?', options: ['To memoize expensive calculations between renders', 'To manage form inputs', 'To trigger route transitions', 'To store global Redux state'], correctAnswer: 0, explanation: '`useMemo` caches calculation results based on dependencies.', points: 10 },
      { questionText: 'How do you pass data down from a parent to a child component?', options: ['Via state', 'Via props', 'Via HTTP headers', 'Via Redux dispatch only'], correctAnswer: 1, explanation: 'Props are used to pass data down component hierarchies.', points: 10 },
      { questionText: 'What problem does `useContext` solve?', options: ['Prop drilling across deeply nested component trees', 'State persistence across page reloads', 'Slow network requests', 'Memory leaks in event listeners'], correctAnswer: 0, explanation: 'Context allows sharing global state without prop drilling.', points: 10 },
      { questionText: 'What happens when state changes in a React component?', options: ['The browser reloads', 'The component re-renders', 'All state is erased', 'The server restarts'], correctAnswer: 1, explanation: 'Changing component state triggers a re-render cycle.', points: 10 },
      { questionText: 'What is a controlled component in React forms?', options: ['A component where form data is handled by React component state', 'A component controlled by external JavaScript libraries', 'A hidden form input', 'A component disabled by CSS'], correctAnswer: 0, explanation: 'Controlled components bind input value directly to React state.', points: 10 },
      { questionText: 'What function is returned by `useEffect` used for?', options: ['Submitting form data', 'Cleanup actions (e.g., clearing timers or unsubscribing)', 'Setting initial state', 'Throwing errors'], correctAnswer: 1, explanation: 'The cleanup function runs before re-render or unmount.', points: 10 }
    ];

    // Assessment 3: Node.js & Express Backend Development
    const nodeQuestions = [
      { questionText: 'What is Express.js in the Node ecosystem?', options: ['A database ORM', 'A web application framework for routing and middleware', 'A frontend templating engine', 'A package manager'], correctAnswer: 1, explanation: 'Express is a minimal web application framework for Node.js.', points: 10 },
      { questionText: 'What signature does a standard Express middleware function have?', options: ['(req, res)', '(req, res, next)', '(err, req)', '(data, callback)'], correctAnswer: 1, explanation: 'Middleware functions accept `req`, `res`, and `next`.', points: 10 },
      { questionText: 'Which HTTP method should be used to update an existing resource completely?', options: ['GET', 'POST', 'PUT', 'DELETE'], correctAnswer: 2, explanation: 'PUT replaces or updates a resource entirely.', points: 10 },
      { questionText: 'What does `next()` do inside Express middleware?', options: ['Terminates the request-response cycle', 'Passes control to the next middleware function in stack', 'Restarts the HTTP server', 'Logs an error to console'], correctAnswer: 1, explanation: '`next()` invokes the next middleware handler.', points: 10 },
      { questionText: 'Where are environment variables stored safely in Node.js?', options: ['In package.json', 'In `process.env` loaded from `.env` files', 'In public folder', 'In client-side localStorage'], correctAnswer: 1, explanation: '`process.env` stores environment configuration securely.', points: 10 },
      { questionText: 'What is JWT (JSON Web Token) used for?', options: ['Database indexing', 'Stateless authentication and secure information exchange', 'File compression', 'CSS styling'], correctAnswer: 1, explanation: 'JWT is used for secure transmission of claims between parties.', points: 10 },
      { questionText: 'Which middleware is used to parse JSON bodies in Express 4.16+?', options: ['express.json()', 'body-parser-xml()', 'express.static()', 'cors()'], correctAnswer: 0, explanation: '`express.json()` parses incoming requests with JSON payloads.', points: 10 },
      { questionText: 'What status code represents "Unauthorized" in HTTP response?', options: ['200', '400', '401', '500'], correctAnswer: 2, explanation: '401 Unauthorized indicates unauthenticated access.', points: 10 },
      { questionText: 'How do you handle unhandled errors globally in Express?', options: ['Define a 4-parameter middleware `(err, req, res, next)`', 'Use try/catch in every file only', 'Ignore errors', 'Restart process on error'], correctAnswer: 0, explanation: 'Express error-handling middleware accepts 4 parameters.', points: 10 },
      { questionText: 'What package is standard for hashing passwords securely in Node.js?', options: ['crypto-js', 'bcryptjs', 'md5', 'base64'], correctAnswer: 1, explanation: '`bcryptjs` or `bcrypt` uses salted hashing for passwords.', points: 10 }
    ];

    // Assessment 4: Python & Data Science Assessment
    const pythonQuestions = [
      { questionText: 'Which Python data structure is immutable?', options: ['List', 'Dictionary', 'Tuple', 'Set'], correctAnswer: 2, explanation: 'Tuples cannot be altered once created.', points: 10 },
      { questionText: 'What library is primarily used for DataFrames in Python?', options: ['NumPy', 'Pandas', 'Matplotlib', 'Requests'], correctAnswer: 1, explanation: 'Pandas provides tabular DataFrame data structures.', points: 10 },
      { questionText: 'What is the main function of NumPy in Data Science?', options: ['Building Web APIs', 'High-performance multi-dimensional array processing', 'Creating UI components', 'Connecting to SQL databases'], correctAnswer: 1, explanation: 'NumPy offers vector and matrix calculations.', points: 10 },
      { questionText: 'Which algorithm is a supervised learning classification technique?', options: ['K-Means Clustering', 'Random Forest', 'PCA', 'Apriori'], correctAnswer: 1, explanation: 'Random Forest is a supervised ensemble classifier.', points: 10 },
      { questionText: 'What metric measures the proportion of true positive predictions among positive calls?', options: ['Recall', 'Precision', 'MSE', 'R-Squared'], correctAnswer: 1, explanation: 'Precision = True Positives / (True Positives + False Positives).', points: 10 },
      { questionText: 'In Pandas, how do you handle missing values NaN?', options: ['df.dropna() or df.fillna()', 'df.delete()', 'df.removeNull()', 'df.clean()'], correctAnswer: 0, explanation: '`dropna()` drops missing values and `fillna()` imputes them.', points: 10 },
      { questionText: 'What is overfitting in Machine Learning?', options: ['Model performs well on training data but poorly on unseen test data', 'Model performs poorly on both train and test data', 'Model trains too fast', 'Dataset is too small'], correctAnswer: 0, explanation: 'Overfitting occurs when a model learns noise in training data.', points: 10 },
      { questionText: 'Which visualization plot is best for checking distribution skewness?', options: ['Scatter Plot', 'Histogram / Box Plot', 'Line Chart', 'Pie Chart'], correctAnswer: 1, explanation: 'Histograms show data distributions and skewness.', points: 10 },
      { questionText: 'What is the purpose of train_test_split in Scikit-Learn?', options: ['To clean data', 'To divide data into training set and evaluation set', 'To normalize values between 0 and 1', 'To export CSV files'], correctAnswer: 1, explanation: 'Splits dataset to validate generalization performance.', points: 10 },
      { questionText: 'What technique scales feature values to a standard range (0 to 1)?', options: ['MinMaxScaler / Normalization', 'OneHotEncoder', 'LabelEncoder', 'Imputation'], correctAnswer: 0, explanation: 'MinMaxScaler rescales feature ranges to [0, 1].', points: 10 }
    ];

    // Assessment 5: DevOps & Cloud Infrastructure
    const devopsQuestions = [
      { questionText: 'What is a Docker container image?', options: ['A running virtual machine instance', 'A lightweight, standalone executable package containing application and dependencies', 'A physical server rack', 'A network router config'], correctAnswer: 1, explanation: 'Container images include code, runtime, libraries, and settings.', points: 10 },
      { questionText: 'Which file defines multi-container Docker applications?', options: ['Dockerfile', 'docker-compose.yml', 'package.json', 'Kubeconfig'], correctAnswer: 1, explanation: '`docker-compose.yml` configures multi-container setups.', points: 10 },
      { questionText: 'What is Kubernetes (K8s)?', options: ['A text editor', 'An open-source container orchestration platform', 'A relational database', 'A DNS provider'], correctAnswer: 1, explanation: 'Kubernetes automates deployment, scaling, and management of containers.', points: 10 },
      { questionText: 'What does CI/CD stand for in modern DevOps?', options: ['Computer Integration / Cloud Deployment', 'Continuous Integration / Continuous Deployment', 'Code Inspection / Control Design', 'Cluster Initialization / Container Delivery'], correctAnswer: 1, explanation: 'CI/CD automates code integration, testing, and deployment.', points: 10 },
      { questionText: 'What is the role of Infrastructure as Code (IaC) tools like Terraform?', options: ['Provisioning and managing infrastructure via code configurations', 'Compiling C++ binaries', 'Styling frontend web apps', 'Managing database backups only'], correctAnswer: 0, explanation: 'IaC codifies infrastructure declaration and provisioning.', points: 10 },
      { questionText: 'Which AWS service provides resizable compute capacity virtual servers?', options: ['AWS S3', 'AWS EC2', 'AWS RDS', 'AWS DynamoDB'], correctAnswer: 1, explanation: 'EC2 (Elastic Compute Cloud) provides virtual compute instances.', points: 10 },
      { questionText: 'What command displays active containers in Docker CLI?', options: ['docker run', 'docker ps', 'docker images', 'docker build'], correctAnswer: 1, explanation: '`docker ps` lists running container instances.', points: 10 },
      { questionText: 'In Kubernetes, what is the smallest deployable compute unit?', options: ['Node', 'Pod', 'Cluster', 'Ingress'], correctAnswer: 1, explanation: 'A Pod encapsulates one or more co-located containers.', points: 10 },
      { questionText: 'What is the purpose of reverse proxies like Nginx?', options: ['To route traffic, handle SSL termination, load balance requests', 'To write database queries', 'To store user passwords', 'To generate React code'], correctAnswer: 0, explanation: 'Nginx acts as a reverse proxy, load balancer, and web server.', points: 10 },
      { questionText: 'Which Linux permission command changes file access mode?', options: ['chown', 'chmod', 'chgrp', 'ls -la'], correctAnswer: 1, explanation: '`chmod` changes file and directory access permissions.', points: 10 }
    ];

    const assessmentsRaw = [
      {
        title: 'JavaScript & ES6+ Core Assessment',
        description: 'Test your understanding of closure, scope, async execution, Promises, and ES6+ features.',
        skill: skillMap['JavaScript']._id,
        difficulty: 'intermediate',
        timeLimitMinutes: 20,
        passingScore: 70,
        questions: jsQuestions
      },
      {
        title: 'React.js Frontend Architecture Assessment',
        description: 'Validate component state, hooks lifecycle, virtual DOM diffing, and context patterns.',
        skill: skillMap['React.js']._id,
        difficulty: 'intermediate',
        timeLimitMinutes: 20,
        passingScore: 70,
        questions: reactQuestions
      },
      {
        title: 'Node.js & Express API Backend Assessment',
        description: 'Evaluate RESTful routing, Express middleware stack, JWT security, and error handling.',
        skill: skillMap['Node.js']._id,
        difficulty: 'intermediate',
        timeLimitMinutes: 20,
        passingScore: 70,
        questions: nodeQuestions
      },
      {
        title: 'Python & Data Science Quantitative Assessment',
        description: 'Assess Python data structures, Pandas DataFrames, Scikit-Learn modeling, and metrics.',
        skill: skillMap['Python']._id,
        difficulty: 'advanced',
        timeLimitMinutes: 25,
        passingScore: 75,
        questions: pythonQuestions
      },
      {
        title: 'DevOps & Cloud Infrastructure Assessment',
        description: 'Measure containerization, Kubernetes orchestration, CI/CD automation, and AWS concepts.',
        skill: skillMap['Docker']._id,
        difficulty: 'advanced',
        timeLimitMinutes: 25,
        passingScore: 75,
        questions: devopsQuestions
      }
    ];

    const createdAssessments = await Assessment.create(assessmentsRaw);
    console.log(`✅ Created ${createdAssessments.length} major assessments with 10 questions each.`);

    // -------------------------------------------------------------
    // 7. CREATE DEMO & DEVELOPMENT USERS
    // -------------------------------------------------------------
    // Admin Creds: admin@smartskill.com / Admin@123
    // Student Creds: student@smartskill.com / Student@123

    const adminUser = await User.create({
      name: 'SmartSkill Admin',
      email: 'admin@smartskill.com',
      password: 'Admin@123',
      role: 'admin',
      education: 'Master of Science in Computer Science',
      interests: ['System Architecture', 'EdTech', 'AI Assessment']
    });

    const studentUser = await User.create({
      name: 'Alex Rivera',
      email: 'student@smartskill.com',
      password: 'Student@123',
      role: 'student',
      education: 'Bachelor of Technology in Information Technology',
      interests: ['Full Stack Web Dev', 'Cloud Computing', 'AI Applications'],
      targetCareer: careerMap['Full Stack Developer']._id
    });

    console.log(`✅ Created Demo Users:`);
    console.log(`   🔑 Admin User: admin@smartskill.com (Password: Admin@123) [DEVELOPMENT/DEMO CREDENTIAL]`);
    console.log(`   🔑 Student User: student@smartskill.com (Password: Student@123) [DEVELOPMENT/DEMO CREDENTIAL]`);

    // Create UserSkills for student
    const studentUserSkills = [
      { user: studentUser._id, skill: skillMap['JavaScript']._id, proficiency: 2, source: 'self' },
      { user: studentUser._id, skill: skillMap['React.js']._id, proficiency: 2, source: 'assessment' },
      { user: studentUser._id, skill: skillMap['HTML5 & CSS3']._id, proficiency: 3, source: 'self' },
      { user: studentUser._id, skill: skillMap['Node.js']._id, proficiency: 1, source: 'self' },
      { user: studentUser._id, skill: skillMap['MongoDB']._id, proficiency: 1, source: 'self' },
      { user: studentUser._id, skill: skillMap['Git & GitHub']._id, proficiency: 2, source: 'self' }
    ];

    await UserSkill.create(studentUserSkills);
    console.log(`✅ Created ${studentUserSkills.length} UserSkill records for demo student.`);

    // -------------------------------------------------------------
    // 8. CREATE SAMPLE ROADMAP & PROGRESS FOR DEMO STUDENT
    // -------------------------------------------------------------
    const studentRoadmap = await Roadmap.create({
      user: studentUser._id,
      career: careerMap['Full Stack Developer']._id,
      steps: [
        {
          skill: skillMap['HTML5 & CSS3']._id,
          title: 'HTML5 & Modern Responsive Web Design',
          description: 'Master HTML5 semantics, flexbox, CSS grid, and responsive design systems.',
          order: 1,
          status: 'completed',
          progress: 100,
          completedAt: new Date()
        },
        {
          skill: skillMap['JavaScript']._id,
          title: 'JavaScript Core & ES6+ Concepts',
          description: 'Deep dive into async promises, DOM manipulation, closures, and ES6 syntax.',
          order: 2,
          status: 'in_progress',
          progress: 60
        },
        {
          skill: skillMap['React.js']._id,
          title: 'React.js Component Architecture',
          description: 'Build interactive SPA components, custom hooks, and manage state cleanly.',
          order: 3,
          status: 'in_progress',
          progress: 40
        },
        {
          skill: skillMap['Node.js']._id,
          title: 'Node.js & Express API Backend Development',
          description: 'Construct REST endpoints, authentication with JWT, and database queries.',
          order: 4,
          status: 'not_started',
          progress: 0
        }
      ]
    });
    console.log(`✅ Created sample roadmap for demo student.`);

    // Sample Progress records
    await Progress.create([
      { user: studentUser._id, roadmapStep: studentRoadmap.steps[0]._id.toString(), progress: 100, status: 'completed', completedAt: new Date() },
      { user: studentUser._id, roadmapStep: studentRoadmap.steps[1]._id.toString(), progress: 60, status: 'in_progress' },
      { user: studentUser._id, roadmapStep: studentRoadmap.steps[2]._id.toString(), progress: 40, status: 'in_progress' }
    ]);

    // -------------------------------------------------------------
    // 9. CREATE SAMPLE ASSESSMENT RESULT FOR DEMO STUDENT
    // -------------------------------------------------------------
    const jsAssessment = createdAssessments.find(a => a.title.includes('JavaScript'));
    await AssessmentResult.create({
      user: studentUser._id,
      assessment: jsAssessment._id,
      score: 80,
      percentage: 80,
      proficiency: 2,
      answers: jsQuestions.map((q, idx) => ({
        questionId: jsAssessment.questions[idx]._id,
        questionText: q.questionText,
        selectedOption: q.correctAnswer,
        correctOption: q.correctAnswer,
        isCorrect: true,
        explanation: q.explanation
      }))
    });
    console.log(`✅ Created sample assessment result for demo student.`);

    console.log('\n🎉 SmartSkill Database Seeding Successfully Completed!');
  } catch (err) {
    console.error(`❌ Seeding failed: ${err.message}`);
    throw err;
  } finally {
    isSeeding = false;
  }
};

// Execute if run directly via node
if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB().then(async () => {
    await seedData();
    mongoose.connection.close();
    process.exit(0);
  });
}

module.exports = seedData;
