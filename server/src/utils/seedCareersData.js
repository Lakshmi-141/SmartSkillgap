const seedCareers = [
  {
    title: 'Full Stack Developer',
    description: 'Build complete web applications spanning client-side user interfaces, server-side REST APIs, and database architecture.',
    requiredSkills: [
      { name: 'JavaScript (ES6+)', importance: 'Core', category: 'Frontend' },
      { name: 'React.js', importance: 'Core', category: 'Frontend' },
      { name: 'Node.js', importance: 'Core', category: 'Backend' },
      { name: 'Express.js', importance: 'Required', category: 'Backend' },
      { name: 'MongoDB / Mongoose', importance: 'Required', category: 'Database' },
      { name: 'HTML5 & CSS3', importance: 'Required', category: 'Frontend' },
      { name: 'Git & GitHub', importance: 'Required', category: 'Tools' }
    ],
    recommendedSkills: ['TypeScript', 'Docker', 'Tailwind CSS', 'GraphQL', 'Next.js'],
    roadmap: [
      { step: 1, title: 'Frontend Basics', description: 'HTML5, CSS3, Flexbox/Grid, Modern JavaScript ES6+', skills: ['HTML5 & CSS3', 'JavaScript (ES6+)'] },
      { step: 2, title: 'React & UI Component Architecture', description: 'Components, Hooks, State Management, Axios', skills: ['React.js', 'Tailwind CSS'] },
      { step: 3, title: 'Backend APIs & Express', description: 'REST APIs, Middleware, JWT Auth, Route Controllers', skills: ['Node.js', 'Express.js'] },
      { step: 4, title: 'Database & Full Stack Integration', description: 'MongoDB schemas, Mongoose models, End-to-end integration', skills: ['MongoDB / Mongoose', 'Git & GitHub'] }
    ]
  },
  {
    title: 'Frontend Developer',
    description: 'Specialize in building responsive, dynamic, and visually stunning web interfaces and single-page applications.',
    requiredSkills: [
      { name: 'HTML5 & CSS3', importance: 'Core', category: 'Frontend' },
      { name: 'JavaScript (ES6+)', importance: 'Core', category: 'Frontend' },
      { name: 'React.js', importance: 'Core', category: 'Frontend' },
      { name: 'Tailwind CSS', importance: 'Required', category: 'Frontend' },
      { name: 'TypeScript', importance: 'Required', category: 'Frontend' },
      { name: 'Git & GitHub', importance: 'Required', category: 'Tools' }
    ],
    recommendedSkills: ['Next.js', 'Redux Toolkit', 'UI/UX Design Systems', 'Web Performance Optimization'],
    roadmap: [
      { step: 1, title: 'Web Fundamentals', description: 'Master semantic HTML, CSS layout math, and core JavaScript DOM manipulation', skills: ['HTML5 & CSS3', 'JavaScript (ES6+)'] },
      { step: 2, title: 'Modern Frameworks', description: 'React component lifecycle, custom hooks, and state management', skills: ['React.js', 'TypeScript'] },
      { step: 3, title: 'Styling & Performance', description: 'Tailwind CSS design tokens, responsive breakpoints, and web vitals', skills: ['Tailwind CSS', 'Next.js'] }
    ]
  },
  {
    title: 'Backend Developer',
    description: 'Design and optimize server-side logic, database architectures, microservices, and secure API gateways.',
    requiredSkills: [
      { name: 'Node.js', importance: 'Core', category: 'Backend' },
      { name: 'Express.js', importance: 'Core', category: 'Backend' },
      { name: 'SQL & PostgreSQL', importance: 'Required', category: 'Database' },
      { name: 'MongoDB', importance: 'Required', category: 'Database' },
      { name: 'RESTful API Design', importance: 'Core', category: 'Backend' },
      { name: 'Docker', importance: 'Required', category: 'DevOps' }
    ],
    recommendedSkills: ['Redis Caching', 'Microservices Architecture', 'GraphQL', 'Kafka'],
    roadmap: [
      { step: 1, title: 'Server Fundamentals', description: 'Node.js event loop, asynchronous IO, module patterns', skills: ['Node.js', 'Express.js'] },
      { step: 2, title: 'Data Persistence', description: 'Relational vs NoSQL schema modeling, queries, indexing', skills: ['MongoDB', 'SQL & PostgreSQL'] },
      { step: 3, title: 'API Security & Deployment', description: 'JWT authentication, rate limiting, Docker containerization', skills: ['RESTful API Design', 'Docker'] }
    ]
  },
  {
    title: 'Java Developer',
    description: 'Build enterprise-grade software applications, microservices, and robust backend systems using Java and Spring Boot.',
    requiredSkills: [
      { name: 'Core Java (SE/EE)', importance: 'Core', category: 'Languages' },
      { name: 'Spring Boot', importance: 'Core', category: 'Backend' },
      { name: 'Hibernate / JPA', importance: 'Required', category: 'Backend' },
      { name: 'SQL & MySQL', importance: 'Required', category: 'Database' },
      { name: 'REST APIs', importance: 'Required', category: 'Backend' },
      { name: 'Maven / Gradle', importance: 'Required', category: 'Tools' }
    ],
    recommendedSkills: ['Microservices', 'Spring Security', 'JUnit & Mockito', 'Docker'],
    roadmap: [
      { step: 1, title: 'Java Syntax & OOP', description: 'Object-oriented programming, Collections framework, Exception handling', skills: ['Core Java (SE/EE)'] },
      { step: 2, title: 'Spring Framework', description: 'Dependency Injection, Spring MVC, REST APIs with Spring Boot', skills: ['Spring Boot', 'REST APIs'] },
      { step: 3, title: 'Enterprise Data & Testing', description: 'Hibernate ORM, JPA repositories, SQL queries, unit testing', skills: ['Hibernate / JPA', 'SQL & MySQL', 'Maven / Gradle'] }
    ]
  },
  {
    title: 'Python Developer',
    description: 'Develop scalable web applications, automation scripts, data pipelines, and backend services with Python.',
    requiredSkills: [
      { name: 'Python 3', importance: 'Core', category: 'Languages' },
      { name: 'Django / FastAPI', importance: 'Core', category: 'Backend' },
      { name: 'SQL & PostgreSQL', importance: 'Required', category: 'Database' },
      { name: 'REST API Design', importance: 'Required', category: 'Backend' },
      { name: 'Git', importance: 'Required', category: 'Tools' }
    ],
    recommendedSkills: ['Celery & Redis', 'Docker', 'pytest', 'Pandas'],
    roadmap: [
      { step: 1, title: 'Python Fundamentals', description: 'Data structures, OOP, decorators, generators, file handling', skills: ['Python 3'] },
      { step: 2, title: 'Web Frameworks', description: 'Building REST endpoints using FastAPI or Django REST Framework', skills: ['Django / FastAPI', 'REST API Design'] },
      { step: 3, title: 'Database & Deployment', description: 'ORM models, SQL migrations, background task queues', skills: ['SQL & PostgreSQL', 'Git'] }
    ]
  },
  {
    title: 'Data Analyst',
    description: 'Extract, clean, analyze, and visualize data to deliver actionable business insights and strategic dashboards.',
    requiredSkills: [
      { name: 'SQL Queries', importance: 'Core', category: 'Database' },
      { name: 'Python / R', importance: 'Core', category: 'Languages' },
      { name: 'Pandas & NumPy', importance: 'Required', category: 'Data' },
      { name: 'Tableau / Power BI', importance: 'Required', category: 'Visualization' },
      { name: 'Excel Advanced Analysis', importance: 'Required', category: 'Tools' }
    ],
    recommendedSkills: ['Statistics & Probability', 'BigQuery / Snowflake', 'Data Cleaning Techniques'],
    roadmap: [
      { step: 1, title: 'Data Querying & SQL', description: 'Mastering JOINs, aggregations, subqueries, and window functions', skills: ['SQL Queries'] },
      { step: 2, title: 'Python Data Wrangling', description: 'Data manipulation with Pandas, numerical processing with NumPy', skills: ['Python / R', 'Pandas & NumPy'] },
      { step: 3, title: 'Business Intelligence & Visualization', description: 'Building interactive dashboards in Power BI or Tableau', skills: ['Tableau / Power BI', 'Excel Advanced Analysis'] }
    ]
  },
  {
    title: 'Data Scientist',
    description: 'Apply statistical analysis, machine learning algorithms, and predictive modeling to solve complex domain problems.',
    requiredSkills: [
      { name: 'Python', importance: 'Core', category: 'Languages' },
      { name: 'Pandas & NumPy', importance: 'Core', category: 'Data' },
      { name: 'Scikit-Learn', importance: 'Core', category: 'Machine Learning' },
      { name: 'SQL & Database Querying', importance: 'Required', category: 'Database' },
      { name: 'Statistics & Probability', importance: 'Required', category: 'Math' },
      { name: 'Data Visualization (Seaborn/Matplotlib)', importance: 'Required', category: 'Visualization' }
    ],
    recommendedSkills: ['TensorFlow / PyTorch', 'Feature Engineering', 'Big Data (Spark)', 'Model Deployment'],
    roadmap: [
      { step: 1, title: 'Math & Statistical Foundations', description: 'Linear algebra, probability theory, hypothesis testing', skills: ['Statistics & Probability', 'Python'] },
      { step: 2, title: 'Exploratory Data Analysis', description: 'Wrangling messy data, visual distributions, trend identification', skills: ['Pandas & NumPy', 'Data Visualization (Seaborn/Matplotlib)'] },
      { step: 3, title: 'Machine Learning & Evaluation', description: 'Supervised & unsupervised learning, model validation metrics', skills: ['Scikit-Learn', 'SQL & Database Querying'] }
    ]
  },
  {
    title: 'AI/ML Engineer',
    description: 'Design, train, optimize, and deploy deep learning models, neural networks, and generative AI pipelines into production.',
    requiredSkills: [
      { name: 'Python', importance: 'Core', category: 'Languages' },
      { name: 'PyTorch / TensorFlow', importance: 'Core', category: 'Deep Learning' },
      { name: 'Machine Learning Algorithms', importance: 'Core', category: 'AI' },
      { name: 'NLP & Computer Vision Basics', importance: 'Required', category: 'AI' },
      { name: 'Docker & Model MLOps', importance: 'Required', category: 'DevOps' }
    ],
    recommendedSkills: ['LLM Fine-Tuning & Prompting', 'LangChain / LlamaIndex', 'GPU Acceleration (CUDA)', 'ONNX'],
    roadmap: [
      { step: 1, title: 'Machine Learning Fundamentals', description: 'Regression, classification, loss functions, optimization algorithms', skills: ['Python', 'Machine Learning Algorithms'] },
      { step: 2, title: 'Deep Learning & Neural Networks', description: 'CNNs, RNNs, Transformer architectures in PyTorch or TensorFlow', skills: ['PyTorch / TensorFlow', 'NLP & Computer Vision Basics'] },
      { step: 3, title: 'MLOps & Production Deployment', description: 'Containerizing model pipelines, REST APIs, monitoring drift', skills: ['Docker & Model MLOps'] }
    ]
  },
  {
    title: 'Cloud Engineer',
    description: 'Architect, deploy, secure, and manage scalable cloud infrastructure on AWS, Azure, or Google Cloud Platform.',
    requiredSkills: [
      { name: 'AWS / Azure / GCP', importance: 'Core', category: 'Cloud' },
      { name: 'Linux System Administration', importance: 'Core', category: 'OS' },
      { name: 'Infrastructure as Code (Terraform)', importance: 'Required', category: 'Cloud' },
      { name: 'Networking & Security', importance: 'Required', category: 'Networking' },
      { name: 'Docker', importance: 'Required', category: 'DevOps' }
    ],
    recommendedSkills: ['Kubernetes', 'Cloud Security Certification', 'Python Scripting', 'Bash Shell'],
    roadmap: [
      { step: 1, title: 'Linux & Cloud Fundamentals', description: 'Linux command line, VPCs, IAM security policies, EC2/Compute instances', skills: ['AWS / Azure / GCP', 'Linux System Administration'] },
      { step: 2, title: 'Infrastructure Automation', description: 'Terraform IaC provisioning, cloud storage, load balancing', skills: ['Infrastructure as Code (Terraform)', 'Networking & Security'] },
      { step: 3, title: 'Containerization & Cloud Native', description: 'Dockerizing services, cloud monitoring, disaster recovery', skills: ['Docker'] }
    ]
  },
  {
    title: 'DevOps Engineer',
    description: 'Automate CI/CD pipelines, manage infrastructure scaling, ensure uptime, and bridge development with operations.',
    requiredSkills: [
      { name: 'Linux Administration', importance: 'Core', category: 'OS' },
      { name: 'Docker & Kubernetes', importance: 'Core', category: 'Containerization' },
      { name: 'CI/CD Pipelines (GitHub Actions / Jenkins)', importance: 'Core', category: 'Automation' },
      { name: 'Terraform (IaC)', importance: 'Required', category: 'Infrastructure' },
      { name: 'Git & Bash Scripting', importance: 'Required', category: 'Tools' }
    ],
    recommendedSkills: ['Prometheus & Grafana', 'AWS Architecture', 'Ansible Configuration Management', 'Python'],
    roadmap: [
      { step: 1, title: 'Linux & Version Control', description: 'Shell scripting, file permissions, network routing, Git branching', skills: ['Linux Administration', 'Git & Bash Scripting'] },
      { step: 2, title: 'Containers & CI/CD', description: 'Docker multi-stage builds, GitHub Actions pipeline automation', skills: ['Docker & Kubernetes', 'CI/CD Pipelines (GitHub Actions / Jenkins)'] },
      { step: 3, title: 'Kubernetes & IaC', description: 'Cluster management, Helm charts, Terraform infrastructure deployment', skills: ['Terraform (IaC)'] }
    ]
  },
  {
    title: 'Cybersecurity Analyst',
    description: 'Protect network infrastructure, monitor threat vulnerabilities, execute risk audits, and respond to security incidents.',
    requiredSkills: [
      { name: 'Network Security Fundamentals', importance: 'Core', category: 'Security' },
      { name: 'Linux & Windows Admin', importance: 'Core', category: 'OS' },
      { name: 'Ethical Hacking & Penetration Testing', importance: 'Required', category: 'Security' },
      { name: 'SIEM Tools (Splunk/Wireshark)', importance: 'Required', category: 'Monitoring' },
      { name: 'Python / Bash Scripting', importance: 'Required', category: 'Scripting' }
    ],
    recommendedSkills: ['CompTIA Security+', 'CISSP Fundamentals', 'Cloud Security', 'Incident Response'],
    roadmap: [
      { step: 1, title: 'Networking & OS Hardening', description: 'OSI model, TCP/IP, firewalls, Linux/Windows security configuration', skills: ['Network Security Fundamentals', 'Linux & Windows Admin'] },
      { step: 2, title: 'Threat Monitoring & Packet Analysis', description: 'Analyzing network logs with Wireshark, SIEM threat detection', skills: ['SIEM Tools (Splunk/Wireshark)', 'Python / Bash Scripting'] },
      { step: 3, title: 'Vulnerability Assessment & Hacking', description: 'Penetration testing frameworks (Nmap, Metasploit), risk compliance', skills: ['Ethical Hacking & Penetration Testing'] }
    ]
  }
];

module.exports = seedCareers;
