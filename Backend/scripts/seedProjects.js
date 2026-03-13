const mongoose = require('mongoose');
const Project = require('../models/Project');
require('dotenv').config({ path: __dirname + '/../.env' });

const projects = [
  // BEGINNER LEVEL (10 projects)
  {
    title: 'Personal Portfolio Website',
    description: 'Build a responsive portfolio website to showcase your skills, projects, and resume. Includes dark mode, contact form, and project gallery.',
    difficulty: 'Beginner',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '2 weeks',
    suggestedStacks: [
      {
        name: 'HTML/CSS/JS',
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'GitHub Pages'],
        description: 'Pure frontend fundamentals, no frameworks needed'
      },
      {
        name: 'React Static',
        technologies: ['React', 'Tailwind CSS', 'Vite', 'Netlify'],
        description: 'Modern React with static site generation'
      }
    ],
    learningOutcomes: ['Responsive design', 'DOM manipulation', 'Form handling', 'Git workflow'],
    realWorldUse: 'Essential for job hunting and personal branding'
  },
  {
    title: 'Weather Dashboard',
    description: 'Create a weather app that shows current conditions and 5-day forecast for any city using a public weather API.',
    difficulty: 'Beginner',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '1 week',
    suggestedStacks: [
      {
        name: 'Vanilla JS',
        technologies: ['HTML', 'CSS', 'JavaScript', 'OpenWeatherMap API'],
        description: 'Learn API integration without frameworks'
      },
      {
        name: 'React Weather',
        technologies: ['React', 'Axios', 'Chart.js', 'Open-Meteo API'],
        description: 'React with data visualization'
      }
    ],
    learningOutcomes: ['API integration', 'Async/await', 'Data fetching', 'Error handling'],
    realWorldUse: 'API consumption patterns used in all modern apps'
  },
  {
    title: 'Task Management App',
    description: 'Build a Todoist-like task manager with CRUD operations, categories, due dates, and local storage persistence.',
    difficulty: 'Beginner',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '2 weeks',
    suggestedStacks: [
      {
        name: 'Local Storage',
        technologies: ['React', 'LocalStorage', 'Tailwind CSS'],
        description: 'Client-side only, no backend needed'
      },
      {
        name: 'Full Stack',
        technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
        description: 'Introduction to full-stack development'
      }
    ],
    learningOutcomes: ['State management', 'CRUD operations', 'Data persistence', 'REST APIs'],
    realWorldUse: 'Productivity tools are always in demand'
  },
  {
    title: 'Blog Platform',
    description: 'Create a Medium-style blog with markdown support, comments, and user authentication.',
    difficulty: 'Beginner',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '3 weeks',
    suggestedStacks: [
      {
        name: 'JAMstack',
        technologies: ['Next.js', 'Markdown', 'Vercel', 'GitHub CMS'],
        description: 'Static site generation with dynamic features'
      },
      {
        name: 'MERN Blog',
        technologies: ['MongoDB', 'Express', 'React', 'Node.js'],
        description: 'Full-stack with rich text editor'
      }
    ],
    learningOutcomes: ['Content management', 'Authentication', 'Rich text editing', 'SEO'],
    realWorldUse: 'Content marketing and personal branding'
  },
  {
    title: 'Expense Tracker',
    description: 'Track personal finances with income/expense logging, budget categories, and monthly reports with charts.',
    difficulty: 'Beginner',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '2 weeks',
    suggestedStacks: [
      {
        name: 'React Finance',
        technologies: ['React', 'Chart.js', 'LocalStorage'],
        description: 'Client-side with data visualization'
      },
      {
        name: 'Python Web',
        technologies: ['Django', 'Chart.js', 'SQLite'],
        description: 'Python full-stack approach'
      }
    ],
    learningOutcomes: ['Data visualization', 'Form validation', 'Calculations', 'Reporting'],
    realWorldUse: 'FinTech and personal finance management'
  },
  {
    title: 'Recipe Finder App',
    description: 'Search recipes by ingredients, save favorites, and generate shopping lists using a recipe API.',
    difficulty: 'Beginner',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '1 week',
    suggestedStacks: [
      {
        name: 'Spoonacular API',
        technologies: ['React', 'Spoonacular API', 'Styled Components'],
        description: 'Third-party API integration'
      },
      {
        name: 'Mobile First',
        technologies: ['React Native', 'Expo', 'Spoonacular API'],
        description: 'Cross-platform mobile app'
      }
    ],
    learningOutcomes: ['API integration', 'List management', 'Search functionality', 'Mobile design'],
    realWorldUse: 'FoodTech and lifestyle apps'
  },
  {
    title: 'Chat Application',
    description: 'Real-time chat app with rooms, emojis, and message history using WebSockets.',
    difficulty: 'Beginner',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '2 weeks',
    suggestedStacks: [
      {
        name: 'Socket.io',
        technologies: ['React', 'Socket.io', 'Express', 'Node.js'],
        description: 'Real-time bidirectional communication'
      },
      {
        name: 'Firebase Chat',
        technologies: ['React', 'Firebase', 'Firestore'],
        description: 'Serverless real-time database'
      }
    ],
    learningOutcomes: ['WebSockets', 'Real-time data', 'Event handling', 'Room management'],
    realWorldUse: 'Communication tools and customer support'
  },
  {
    title: 'URL Shortener',
    description: 'Build a Bitly-like service that converts long URLs into short, shareable links with click analytics.',
    difficulty: 'Beginner',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '1 week',
    suggestedStacks: [
      {
        name: 'MERN Stack',
        technologies: ['MongoDB', 'Express', 'React', 'Node.js'],
        description: 'Full-stack with URL encoding'
      },
      {
        name: 'Serverless',
        technologies: ['Next.js', 'Vercel KV', 'Serverless Functions'],
        description: 'Edge computing approach'
      }
    ],
    learningOutcomes: ['URL encoding', 'Redirects', 'Analytics', 'Database design'],
    realWorldUse: 'Marketing tools and link management'
  },
  {
    title: 'Book Library System',
    description: 'Digital library catalog with book search, borrowing system, and reading progress tracking.',
    difficulty: 'Beginner',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '2 weeks',
    suggestedStacks: [
      {
        name: 'Google Books API',
        technologies: ['React', 'Google Books API', 'LocalStorage'],
        description: 'External book database integration'
      },
      {
        name: 'Full Library',
        technologies: ['Django', 'PostgreSQL', 'Bootstrap'],
        description: 'Complete library management system'
      }
    ],
    learningOutcomes: ['External APIs', 'Search algorithms', 'Data modeling', 'User sessions'],
    realWorldUse: 'Education and library management systems'
  },
  {
    title: 'Fitness Tracker',
    description: 'Track workouts, set goals, and visualize progress with exercise logging and BMI calculator.',
    difficulty: 'Beginner',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '2 weeks',
    suggestedStacks: [
      {
        name: 'React Health',
        technologies: ['React', 'Chart.js', 'PWA'],
        description: 'Progressive web app for mobile'
      },
      {
        name: 'Health API',
        technologies: ['React', 'Health API', 'Firebase'],
        description: 'Integration with health devices'
      }
    ],
    learningOutcomes: ['Data visualization', 'Calculations', 'PWA', 'Health data'],
    realWorldUse: 'HealthTech and wellness industry'
  },

  // INTERMEDIATE LEVEL (10 projects)
  {
    title: 'E-Commerce Platform',
    description: 'Full-featured online store with product catalog, shopping cart, payment processing, and order management.',
    difficulty: 'Intermediate',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '4 weeks',
    suggestedStacks: [
      {
        name: 'MERN Commerce',
        technologies: ['MongoDB', 'Express', 'React', 'Node.js', 'Stripe'],
        description: 'JavaScript full-stack with payments'
      },
      {
        name: 'Next.js Shop',
        technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'Stripe', 'Tailwind'],
        description: 'Modern React with server-side rendering'
      }
    ],
    learningOutcomes: ['Payment integration', 'Inventory management', 'Admin dashboards', 'Search/filter'],
    realWorldUse: 'Multi-billion dollar e-commerce industry'
  },
  {
    title: 'Social Media Dashboard',
    description: 'Aggregate analytics from Twitter, Instagram, and Facebook with scheduled posting and engagement metrics.',
    difficulty: 'Intermediate',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '3 weeks',
    suggestedStacks: [
      {
        name: 'Social API',
        technologies: ['React', 'Node.js', 'Twitter API', 'Instagram Graph API'],
        description: 'Multiple third-party integrations'
      },
      {
        name: 'Analytics',
        technologies: ['Next.js', 'D3.js', 'Redis', 'Social APIs'],
        description: 'Data visualization and caching'
      }
    ],
    learningOutcomes: ['OAuth 2.0', 'Rate limiting', 'Data aggregation', 'Real-time updates'],
    realWorldUse: 'Social media management tools (Hootsuite, Buffer)'
  },
  {
    title: 'Video Streaming Service',
    description: 'YouTube-like platform with video upload, streaming, comments, and recommendation algorithm.',
    difficulty: 'Intermediate',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '5 weeks',
    suggestedStacks: [
      {
        name: 'MERN Stream',
        technologies: ['MongoDB', 'Express', 'React', 'Node.js', 'AWS S3'],
        description: 'Cloud storage for video files'
      },
      {
        name: 'Modern Stream',
        technologies: ['Next.js', 'Mux', 'PostgreSQL', 'Prisma'],
        description: 'Specialized video streaming infrastructure'
      }
    ],
    learningOutcomes: ['Video encoding', 'Streaming protocols', 'CDN', 'Recommendation systems'],
    realWorldUse: 'Entertainment and edTech platforms'
  },
  {
    title: 'Real Estate Marketplace',
    description: 'Property listing platform with map integration, virtual tours, mortgage calculator, and agent contact.',
    difficulty: 'Intermediate',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '4 weeks',
    suggestedStacks: [
      {
        name: 'Map Integration',
        technologies: ['React', 'Google Maps API', 'Node.js', 'MongoDB'],
        description: 'Geolocation and mapping features'
      },
      {
        name: 'Full Property',
        technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'Mapbox'],
        description: 'Advanced mapping and filtering'
      }
    ],
    learningOutcomes: ['Geolocation', 'Advanced search', 'Image galleries', 'Third-party APIs'],
    realWorldUse: 'PropTech industry (Zillow, Realtor.com)'
  },
  {
    title: 'Online Learning Platform',
    description: 'Udemy-like platform with video courses, progress tracking, quizzes, and certificates.',
    difficulty: 'Intermediate',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '5 weeks',
    suggestedStacks: [
      {
        name: 'EdTech Stack',
        technologies: ['MERN', 'AWS S3', 'Socket.io'],
        description: 'Real-time features with video storage'
      },
      {
        name: 'Modern EdTech',
        technologies: ['Next.js', 'Stripe', 'Mux', 'Prisma'],
        description: 'Optimized for video delivery'
      }
    ],
    learningOutcomes: ['Video progress tracking', 'Quizzes', 'Content delivery', 'Payments'],
    realWorldUse: 'EdTech industry worth $350B+'
  },
  {
    title: 'Job Board Platform',
    description: 'LinkedIn-like job platform with resume upload, job matching algorithm, and application tracking.',
    difficulty: 'Intermediate',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '4 weeks',
    suggestedStacks: [
      {
        name: 'MERN Jobs',
        technologies: ['MongoDB', 'Express', 'React', 'Node.js', 'ElasticSearch'],
        description: 'Search engine for job listings'
      },
      {
        name: 'AI Matching',
        technologies: ['Python', 'Django', 'React', 'PostgreSQL', 'TensorFlow'],
        description: 'ML-powered job recommendations'
      }
    ],
    learningOutcomes: ['Search algorithms', 'File upload', 'Matching algorithms', 'Notifications'],
    realWorldUse: 'HR Tech and recruitment industry'
  },
  {
    title: 'SaaS Project Management',
    description: 'Trello/Asana competitor with kanban boards, Gantt charts, team collaboration, and billing.',
    difficulty: 'Intermediate',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '6 weeks',
    suggestedStacks: [
      {
        name: 'MERN SaaS',
        technologies: ['MongoDB', 'Express', 'React', 'Node.js', 'Stripe'],
        description: 'Subscription billing included'
      },
      {
        name: 'Modern SaaS',
        technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'Stripe', 'Clerk'],
        description: 'Production-ready authentication'
      }
    ],
    learningOutcomes: ['Multi-tenancy', 'Subscription billing', 'Real-time sync', 'Permissions'],
    realWorldUse: 'B2B SaaS products'
  },
  {
    title: 'Healthcare Appointment System',
    description: 'Book doctor appointments with calendar integration, reminders, and telemedicine video calls.',
    difficulty: 'Intermediate',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '4 weeks',
    suggestedStacks: [
      {
        name: 'Health Stack',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Twilio', 'WebRTC'],
        description: 'HIPAA-compliant communication'
      },
      {
        name: 'Modern Health',
        technologies: ['Next.js', 'Prisma', 'Stripe', 'Daily.co'],
        description: 'Integrated video calling'
      }
    ],
    learningOutcomes: ['Calendar APIs', 'Video calls', 'SMS notifications', 'Compliance'],
    realWorldUse: 'HealthTech and telemedicine'
  },
  {
    title: 'Crowdfunding Platform',
    description: 'Kickstarter-like platform with project creation, payment processing, and backer rewards.',
    difficulty: 'Intermediate',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '4 weeks',
    suggestedStacks: [
      {
        name: 'MERN Fund',
        technologies: ['MongoDB', 'Express', 'React', 'Node.js', 'Stripe Connect'],
        description: 'Marketplace payments'
      },
      {
        name: 'Web3 Ready',
        technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'Stripe', 'Solidity'],
        description: 'Crypto payment option'
      }
    ],
    learningOutcomes: ['Escrow payments', 'Milestone tracking', 'Email campaigns', 'Financial reporting'],
    realWorldUse: 'Fintech and fundraising'
  },
  {
    title: 'AI Content Generator',
    description: 'ChatGPT-like interface for generating blog posts, social media content, and code snippets.',
    difficulty: 'Intermediate',
    domain: 'AI',
    isTemplate: true,
    estimatedDuration: '3 weeks',
    suggestedStacks: [
      {
        name: 'OpenAI Integration',
        technologies: ['React', 'Node.js', 'OpenAI API', 'MongoDB'],
        description: 'GPT-4 integration with prompt engineering'
      },
      {
        name: 'Modern AI',
        technologies: ['Next.js', 'Vercel AI SDK', 'PostgreSQL', 'LangChain'],
        description: 'Streaming AI responses'
      }
    ],
    learningOutcomes: ['AI API integration', 'Streaming responses', 'Prompt engineering', 'Token management'],
    realWorldUse: 'AI tools and productivity software'
  },

  // ADVANCED LEVEL (10 projects)
  {
    title: 'Distributed Microservices Platform',
    description: 'Enterprise-grade system with user service, order service, payment service, and API gateway using Docker and Kubernetes.',
    difficulty: 'Advanced',
    domain: 'DevOps',
    isTemplate: true,
    estimatedDuration: '8 weeks',
    suggestedStacks: [
      {
        name: 'Node Microservices',
        technologies: ['Node.js', 'Express', 'Docker', 'Kubernetes', 'RabbitMQ'],
        description: 'Event-driven microservices'
      },
      {
        name: 'Go Microservices',
        technologies: ['Go', 'gRPC', 'Docker', 'Kubernetes', 'Kafka'],
        description: 'High-performance distributed systems'
      }
    ],
    learningOutcomes: ['Service discovery', 'Load balancing', 'Event sourcing', 'CI/CD pipelines'],
    realWorldUse: 'Enterprise architecture at Netflix, Uber, Amazon'
  },
  {
    title: 'Real-time Collaborative Editor',
    description: 'Google Docs-like editor with operational transformation, cursor tracking, and version history.',
    difficulty: 'Advanced',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '6 weeks',
    suggestedStacks: [
      {
        name: 'Yjs CRDT',
        technologies: ['React', 'Yjs', 'WebRTC', 'Node.js'],
        description: 'Conflict-free replicated data types'
      },
      {
        name: 'Operational Transform',
        technologies: ['React', 'Socket.io', 'Redis', 'PostgreSQL'],
        description: 'Traditional OT algorithm'
      }
    ],
    learningOutcomes: ['CRDTs', 'Operational transformation', 'WebRTC', 'Conflict resolution'],
    realWorldUse: 'Collaboration tools (Figma, Notion)'
  },
  {
    title: 'Blockchain Supply Chain',
    description: 'Ethereum-based supply chain tracking with smart contracts, QR codes, and immutable audit trails.',
    difficulty: 'Advanced',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '7 weeks',
    suggestedStacks: [
      {
        name: 'Ethereum DApp',
        technologies: ['Solidity', 'Hardhat', 'Ethers.js', 'React', 'IPFS'],
        description: 'Decentralized application'
      },
      {
        name: 'Enterprise Blockchain',
        technologies: ['Hyperledger Fabric', 'Node.js', 'React', 'PostgreSQL'],
        description: 'Permissioned blockchain for enterprise'
      }
    ],
    learningOutcomes: ['Smart contracts', 'Web3', 'Cryptography', 'Distributed consensus'],
    realWorldUse: 'Supply chain and logistics'
  },
  {
    title: 'Computer Vision Security System',
    description: 'AI-powered surveillance with facial recognition, anomaly detection, and real-time alerts.',
    difficulty: 'Advanced',
    domain: 'AI',
    isTemplate: true,
    estimatedDuration: '8 weeks',
    suggestedStacks: [
      {
        name: 'Python CV',
        technologies: ['Python', 'OpenCV', 'TensorFlow', 'Flask', 'WebRTC'],
        description: 'Traditional computer vision'
      },
      {
        name: 'Edge AI',
        technologies: ['NVIDIA Jetson', 'TensorRT', 'FastAPI', 'React'],
        description: 'Hardware-accelerated edge computing'
      }
    ],
    learningOutcomes: ['Computer vision', 'Deep learning', 'Edge computing', 'Real-time processing'],
    realWorldUse: 'Security and surveillance industry'
  },
  {
    title: 'Algorithmic Trading Bot',
    description: 'Automated stock trading with technical indicators, backtesting, and risk management.',
    difficulty: 'Advanced',
    domain: 'AI',
    isTemplate: true,
    estimatedDuration: '6 weeks',
    suggestedStacks: [
      {
        name: 'Python Finance',
        technologies: ['Python', 'Pandas', 'Alpaca API', 'PostgreSQL'],
        description: 'Data-driven trading strategies'
      },
      {
        name: 'ML Trading',
        technologies: ['Python', 'TensorFlow', 'Backtrader', 'Redis'],
        description: 'Machine learning predictions'
      }
    ],
    learningOutcomes: ['Financial modeling', 'Time series analysis', 'Risk management', 'API trading'],
    realWorldUse: 'Quantitative finance and hedge funds'
  },
  {
    title: 'IoT Smart Home Platform',
    description: 'Control lights, thermostats, and security systems with voice commands and automation rules.',
    difficulty: 'Advanced',
    domain: 'Mobile',
    isTemplate: true,
    estimatedDuration: '7 weeks',
    suggestedStacks: [
      {
        name: 'IoT Stack',
        technologies: ['React Native', 'Node.js', 'MQTT', 'Raspberry Pi', 'MongoDB'],
        description: 'Full IoT ecosystem'
      },
      {
        name: 'Voice Enabled',
        technologies: ['Flutter', 'AWS IoT', 'Alexa Skills', 'Firebase'],
        description: 'Voice-controlled smart home'
      }
    ],
    learningOutcomes: ['IoT protocols', 'Hardware integration', 'Voice interfaces', 'Automation rules'],
    realWorldUse: 'Smart home and IoT industry'
  },
  {
    title: 'Natural Language Processing Pipeline',
    description: 'Build sentiment analysis, named entity recognition, and text summarization services.',
    difficulty: 'Advanced',
    domain: 'AI',
    isTemplate: true,
    estimatedDuration: '6 weeks',
    suggestedStacks: [
      {
        name: 'Python NLP',
        technologies: ['Python', 'spaCy', 'Hugging Face', 'FastAPI', 'Redis'],
        description: 'Production NLP pipelines'
      },
      {
        name: 'LLM Pipeline',
        technologies: ['Python', 'LangChain', 'Pinecone', 'Streamlit'],
        description: 'Large language model applications'
      }
    ],
    learningOutcomes: ['NLP techniques', 'Transformer models', 'Vector databases', 'Model deployment'],
    realWorldUse: 'AI-powered customer service and analytics'
  },
  {
    title: 'Multi-tenant SaaS CRM',
    description: 'Salesforce competitor with customizable pipelines, reporting, and white-label capabilities.',
    difficulty: 'Advanced',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '10 weeks',
    suggestedStacks: [
      {
        name: 'Enterprise SaaS',
        technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'Stripe', 'AWS'],
        description: 'Scalable multi-tenant architecture'
      },
      {
        name: 'Micro-frontend',
        technologies: ['Module Federation', 'React', 'GraphQL', 'Kubernetes'],
        description: 'Independent deployable features'
      }
    ],
    learningOutcomes: ['Multi-tenancy', 'Data isolation', 'Custom fields', 'Enterprise security'],
    realWorldUse: 'Enterprise SaaS products'
  },
  {
    title: 'Autonomous Drone Control System',
    description: 'Program drones for autonomous navigation, object avoidance, and mission planning.',
    difficulty: 'Advanced',
    domain: 'AI',
    isTemplate: true,
    estimatedDuration: '9 weeks',
    suggestedStacks: [
      {
        name: 'ROS Stack',
        technologies: ['ROS2', 'Python', 'OpenCV', 'Pixhawk', 'Gazebo'],
        description: 'Robot Operating System'
      },
      {
        name: 'Modern Drone',
        technologies: ['PX4', 'MAVSDK', 'Python', 'Unity Simulation'],
        description: 'Modern drone SDKs'
      }
    ],
    learningOutcomes: ['Robotics', 'Path planning', 'Sensor fusion', 'Simulation'],
    realWorldUse: 'Drones and autonomous vehicles'
  },
  {
    title: 'Decentralized Finance (DeFi) Protocol',
    description: 'Build lending/borrowing platform with liquidity pools, yield farming, and governance tokens.',
    difficulty: 'Advanced',
    domain: 'Web',
    isTemplate: true,
    estimatedDuration: '10 weeks',
    suggestedStacks: [
      {
        name: 'Ethereum DeFi',
        technologies: ['Solidity', 'Hardhat', 'Ethers.js', 'React', 'The Graph'],
        description: 'DeFi on Ethereum'
      },
      {
        name: 'Cross-chain',
        technologies: ['Cosmos SDK', 'Go', 'IBC Protocol', 'React'],
        description: 'Multi-chain DeFi protocol'
      }
    ],
    learningOutcomes: ['DeFi mechanics', 'Smart contract security', 'Tokenomics', 'Governance'],
    realWorldUse: 'Decentralized finance revolution'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing templates
    await Project.deleteMany({ isTemplate: true });
    console.log('Cleared existing templates');

    // Insert new projects
    await Project.insertMany(projects);
    console.log(`Successfully seeded ${projects.length} projects`);

    // Log summary
    const byDifficulty = {
      Beginner: projects.filter(p => p.difficulty === 'Beginner').length,
      Intermediate: projects.filter(p => p.difficulty === 'Intermediate').length,
      Advanced: projects.filter(p => p.difficulty === 'Advanced').length
    };
    
    console.log('\nProject Distribution:');
    console.log(`- Beginner: ${byDifficulty.Beginner}`);
    console.log(`- Intermediate: ${byDifficulty.Intermediate}`);
    console.log(`- Advanced: ${byDifficulty.Advanced}`);

    const byDomain = {};
    projects.forEach(p => {
      byDomain[p.domain] = (byDomain[p.domain] || 0) + 1;
    });
    
    console.log('\nBy Domain:');
    Object.entries(byDomain).forEach(([domain, count]) => {
      console.log(`- ${domain}: ${count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

