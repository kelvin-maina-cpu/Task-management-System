const mongoose = require('mongoose');
const Project = require('../models/Project');
require('dotenv').config({ path: __dirname + '/../.env' });

const realProjects = [
  {
    title: "SaaS Subscription Management System",
    slug: "saas-billing-system",
    description: "Build a complete Stripe-powered subscription billing system with tiered plans, usage-based billing, and customer portals. Handle prorations, upgrades, downgrades, and invoice generation.",
    shortDescription: "Production-ready billing system with Stripe integration",
    difficulty: "Intermediate",
    domain: "Web",
    tags: ["stripe", "billing", "saas", "payments", "subscriptions"],
    estimatedDuration: "3-4 weeks",
    teamSize: "1-2 developers",
    
    requirements: {
      functional: [
        { asA: "business owner", iWant: "to create tiered subscription plans", soThat: "I can monetize my SaaS product", priority: "Must Have" },
        { asA: "customer", iWant: "to upgrade or downgrade my plan", soThat: "I can adjust to my needs", priority: "Must Have" },
        { asA: "customer", iWant: "to see my usage and billing history", soThat: "I can track my spending", priority: "Must Have" },
        { asA: "admin", iWant: "to offer promo codes and discounts", soThat: "I can run marketing campaigns", priority: "Should Have" },
        { asA: "system", iWant: "to handle prorated billing automatically", soThat: "billing is always accurate", priority: "Must Have" }
      ],
      nonFunctional: [
        { category: "Security", requirement: "PCI compliance for payment data", metric: "No sensitive data stored locally" },
        { category: "Reliability", requirement: "Webhook handling", metric: "99.9% successful webhook processing" },
        { category: "Performance", requirement: "Invoice generation", metric: "Generated in < 2 seconds" }
      ]
    },
    
    databaseSchema: {
      entities: [
        {
          name: "User",
          fields: [
            { name: "stripeCustomerId", type: "String", required: false, description: "Stripe customer reference" },
            { name: "subscriptionStatus", type: "String", required: true, description: "active, canceled, past_due" },
            { name: "currentPlanId", type: "ObjectId", required: false, description: "Reference to Plan" }
          ],
          relationships: [{ with: "Plan", type: "one-to-many" }]
        },
        {
          name: "Plan",
          fields: [
            { name: "stripePriceId", type: "String", required: true, description: "Stripe price identifier" },
            { name: "name", type: "String", required: true, description: "Plan name (Basic, Pro, Enterprise)" },
            { name: "price", type: "Number", required: true, description: "Monthly price in cents" },
            { name: "features", type: "Array", required: true, description: "List of included features" },
            { name: "usageLimits", type: "Object", required: true, description: "{ apiCalls: 1000, storage: 10GB }" }
          ]
        },
        {
          name: "Subscription",
          fields: [
            { name: "userId", type: "ObjectId", required: true, description: "Reference to User" },
            { name: "planId", type: "ObjectId", required: true, description: "Reference to Plan" },
            { name: "stripeSubscriptionId", type: "String", required: true, description: "Stripe subscription ID" },
            { name: "currentPeriodStart", type: "Date", required: true },
            { name: "currentPeriodEnd", type: "Date", required: true },
            { name: "cancelAtPeriodEnd", type: "Boolean", default: false }
          ]
        },
        {
          name: "UsageRecord",
          fields: [
            { name: "subscriptionId", type: "ObjectId", required: true },
            { name: "metricName", type: "String", required: true, description: "api_calls, storage_gb, etc." },
            { name: "quantity", type: "Number", required: true },
            { name: "recordedAt", type: "Date", default: "Date.now" }
          ]
        }
      ]
    },
    
    apiEndpoints: [
      { method: "GET", path: "/api/plans", description: "List all available plans", authRequired: false },
      { method: "POST", path: "/api/subscriptions", description: "Create new subscription", requestBody: { planId: "string", paymentMethodId: "string" }, response: { subscriptionId: "string", clientSecret: "string" }, authRequired: true },
      { method: "PUT", path: "/api/subscriptions/:id", description: "Update subscription (upgrade/downgrade)", requestBody: { newPlanId: "string" }, response: { prorationAmount: "number", immediateCharge: "boolean" }, authRequired: true },
      { method: "GET", path: "/api/invoices", description: "Get billing history", authRequired: true },
      { method: "POST", path: "/api/webhooks/stripe", description: "Handle Stripe webhooks", authRequired: false }
    ],
    
    milestones: [
      {
        title: "Project Setup & Stripe Integration",
        description: "Set up Stripe account, configure products and prices, implement basic checkout",
        order: 1,
        estimatedHours: 8,
        learningOutcomes: ["Stripe Dashboard navigation", "Product/Price configuration", "Checkout Session API"],
        deliverables: ["Stripe account configured", "Test products created", "Basic checkout working"],
        resources: [
          { title: "Stripe Billing Quickstart", url: "https://stripe.com/docs/billing/quickstart", type: "documentation" },
          { title: "Stripe Test Cards", url: "https://stripe.com/docs/testing", type: "documentation" }
        ]
      },
      {
        title: "User Authentication & Plan Management",
        description: "Build user auth, create plan management UI, implement plan selection",
        order: 2,
        estimatedHours: 12,
        learningOutcomes: ["JWT authentication", "Role-based access", "Plan comparison UI"],
        deliverables: ["User registration/login", "Plan listing page", "Plan comparison component"],
        resources: [
          { title: "JWT Authentication Best Practices", url: "https://jwt.io/introduction", type: "article" }
        ]
      },
      {
        title: "Subscription Lifecycle Management",
        description: "Handle subscriptions, upgrades, downgrades, and prorations",
        order: 3,
        estimatedHours: 16,
        learningOutcomes: ["Proration calculations", "Subscription states", "Upgrade/downgrade logic"],
        deliverables: ["Subscription creation", "Upgrade/downgrade flow", "Proration handling"],
        resources: [
          { title: "Stripe Subscription Lifecycle", url: "https://stripe.com/docs/billing/subscriptions/overview", type: "documentation" }
        ]
      },
      {
        title: "Usage-Based Billing & Webhooks",
        description: "Implement metered billing, handle webhooks for payment events",
        order: 4,
        estimatedHours: 14,
        learningOutcomes: ["Metered billing", "Webhook security", "Event handling"],
        deliverables: ["Usage tracking", "Webhook endpoint", "Invoice generation"],
        resources: [
          { title: "Stripe Webhooks Best Practices", url: "https://stripe.com/docs/webhooks/quickstart", type: "documentation" }
        ]
      },
      {
        title: "Customer Portal & Polish",
        description: "Build customer dashboard, invoice history, payment method management",
        order: 5,
        estimatedHours: 10,
        learningOutcomes: ["Customer experience", "Invoice UI", "Payment method UX"],
        deliverables: ["Customer portal", "Invoice PDF generation", "Payment method management"],
        resources: [
          { title: "Stripe Customer Portal", url: "https://stripe.com/docs/customer-management", type: "documentation" }
        ]
      }
    ],
    
    suggestedStacks: [
      {
        name: "MERN + Stripe",
        category: "backend",
        technologies: [
          { name: "MongoDB", version: "6.x", purpose: "Store user subscriptions and usage data", alternatives: ["PostgreSQL"] },
          { name: "Express.js", version: "4.x", purpose: "REST API for billing operations", alternatives: ["Fastify"] },
          { name: "React", version: "18.x", purpose: "Customer portal and admin dashboard", alternatives: ["Vue.js"] },
          { name: "Node.js", version: "18.x", purpose: "Server runtime", alternatives: ["Deno"] },
          { name: "Stripe SDK", version: "latest", purpose: "Payment processing", alternatives: ["PayPal SDK"] }
        ],
        architecture: {
          pattern: "Layered Architecture",
          description: "Controllers handle Stripe webhooks, Services manage billing logic, Repositories handle data"
        },
        pros: ["Full JavaScript stack", "Rich Stripe Node.js SDK", "Rapid development"],
        cons: ["Callback hell without async/await", "MongoDB less ideal for financial data"],
        whenToChoose: "When you want fastest time-to-market with JavaScript everywhere"
      },
      {
        name: "PERN Stack",
        category: "backend",
        technologies: [
          { name: "PostgreSQL", version: "15.x", purpose: "ACID-compliant storage for financial records", alternatives: ["MySQL"] },
          { name: "Express.js", version: "4.x", purpose: "API layer", alternatives: ["NestJS"] },
          { name: "React", version: "18.x", purpose: "Frontend", alternatives: ["Next.js"] },
          { name: "Node.js", version: "18.x", purpose: "Runtime", alternatives: [] }
        ],
        architecture: {
          pattern: "Repository Pattern",
          description: "TypeORM or Prisma for database abstraction, clear separation of concerns"
        },
        pros: ["ACID compliance for billing data", "Better data integrity", "Strong typing with TypeORM"],
        cons: ["More complex setup", "Slower development than MongoDB"],
        whenToChoose: "When data consistency is critical and you expect high transaction volume"
      }
    ],
    
    starterCode: {
      repositoryUrl: "https://github.com/example/saas-billing-starter",
      setupInstructions: "1. Clone repo\n2. npm install\n3. Copy .env.example to .env\n4. Add Stripe keys\n5. npm run dev",
      environmentVariables: [
        { name: "STRIPE_SECRET_KEY", description: "Stripe secret key from dashboard", required: true },
        { name: "STRIPE_WEBHOOK_SECRET", description: "Webhook endpoint secret", required: true },
        { name: "STRIPE_PUBLISHABLE_KEY", description: "Frontend Stripe key", required: true },
        { name: "MONGODB_URI", description: "Database connection string", required: true }
      ]
    },
    
    isTemplate: true,
    learningOutcomes: [
      "Stripe integration and payment processing",
      "Subscription lifecycle management",
      "Webhook handling and event processing",
      "Usage-based billing implementation",
      "Customer portal development"
    ],
    realWorldUse: "Essential for any SaaS business - payment processing is the backbone of subscription revenue"
  },
  
  {
    title: "Real-Time Collaborative Code Editor",
    slug: "collaborative-code-editor",
    description: "Build a VS Code-like collaborative editor with real-time synchronization, syntax highlighting, and video chat. Implement operational transformation for conflict resolution.",
    shortDescription: "Google Docs for code with real-time collaboration",
    difficulty: "Advanced",
    domain: "Web",
    tags: ["real-time", "collaboration", "websockets", "yjs", "webrtc"],
    estimatedDuration: "5-6 weeks",
    teamSize: "2-3 developers",
    
    requirements: {
      functional: [
        { asA: "developer", iWant: "to edit code simultaneously with teammates", soThat: "we can pair program remotely", priority: "Must Have" },
        { asA: "user", iWant: "to see cursor positions and selections of others", soThat: "I know what others are working on", priority: "Must Have" },
        { asA: "team lead", iWant: "to start video calls from the editor", soThat: "we can discuss code in context", priority: "Should Have" },
        { asA: "developer", iWant: "to run code in the browser", soThat: "I can test without switching windows", priority: "Could Have" },
        { asA: "user", iWant: "to see version history and restore old versions", soThat: "I can recover from mistakes", priority: "Should Have" }
      ],
      nonFunctional: [
        { category: "Performance", requirement: "Latency for sync", metric: "< 100ms for remote changes" },
        { category: "Scalability", requirement: "Concurrent users per document", metric: "Support 50+ simultaneous editors" },
        { category: "Reliability", requirement: "Conflict resolution", metric: "Zero data loss on concurrent edits" }
      ]
    },
    
    databaseSchema: {
      entities: [
        {
          name: "Document",
          fields: [
            { name: "yjsState", type: "Buffer", required: true, description: "Yjs binary state" },
            { name: "title", type: "String", required: true },
            { name: "language", type: "String", required: true, description: "javascript, python, etc." },
            { name: "ownerId", type: "ObjectId", required: true },
            { name: "permissions", type: "Object", required: true, description: "{ read: ['userId'], write: ['userId'] }" }
          ]
        },
        {
          name: "DocumentUpdate",
          fields: [
            { name: "documentId", type: "ObjectId", required: true },
            { name: "updateData", type: "Buffer", required: true, description: "Yjs update binary" },
            { name: "userId", type: "ObjectId", required: true },
            { name: "timestamp", type: "Date", required: true }
          ]
        },
        {
          name: "Presence",
          fields: [
            { name: "documentId", type: "ObjectId", required: true },
            { name: "userId", type: "ObjectId", required: true },
            { name: "cursor", type: "Object", required: false, description: "{ line, ch }" },
            { name: "selection", type: "Object", required: false },
            { name: "lastSeen", type: "Date", required: true }
          ]
        }
      ]
    },
    
    milestones: [
      {
        title: "Yjs Integration & Basic Sync",
        description: "Learn CRDTs, integrate Yjs, implement basic document sync",
        order: 1,
        estimatedHours: 20,
        learningOutcomes: ["CRDT theory", "Yjs API", "Binary encoding"],
        deliverables: ["Two-browser sync working", "Basic text editor", "Yjs document persistence"]
      },
      {
        title: "WebSocket Infrastructure",
        description: "Build WebSocket server, handle connections, broadcasting",
        order: 2,
        estimatedHours: 16,
        learningOutcomes: ["Socket.io rooms", "Connection management", "Scaling WebSockets"],
        deliverables: ["WebSocket server", "Room-based broadcasting", "Reconnection handling"]
      },
      {
        title: "Code Editor UI",
        description: "Integrate Monaco Editor, add syntax highlighting, themes",
        order: 3,
        estimatedHours: 14,
        learningOutcomes: ["Monaco Editor API", "Language servers", "Editor themes"],
        deliverables: ["Monaco Editor integrated", "Syntax highlighting", "Basic IDE features"]
      },
      {
        title: "Presence & Awareness",
        description: "Show cursors, selections, user avatars in real-time",
        order: 4,
        estimatedHours: 12,
        learningOutcomes: ["Yjs Awareness API", "Cursor tracking", "UI overlay"],
        deliverables: ["Cursor tracking", "User presence indicators", "Selection highlighting"]
      },
      {
        title: "Advanced Features",
        description: "Video chat, code execution, version history",
        order: 5,
        estimatedHours: 20,
        learningOutcomes: ["WebRTC", "Sandboxed code execution", "Versioning"],
        deliverables: ["Video integration", "Code runner", "History timeline"]
      }
    ],
    
    suggestedStacks: [
      {
        name: "Yjs + Socket.io",
        category: "backend",
        technologies: [
          { name: "Yjs", version: "13.x", purpose: "CRDT implementation for conflict-free sync", alternatives: ["Automerge"] },
          { name: "Socket.io", version: "4.x", purpose: "WebSocket transport for real-time updates", alternatives: ["WebSocket API"] },
          { name: "Monaco Editor", version: "latest", purpose: "VS Code editor in browser", alternatives: ["CodeMirror"] },
          { name: "Redis", version: "7.x", purpose: "Pub/sub for multi-server scaling", alternatives: ["RabbitMQ"] }
        ],
        architecture: {
          pattern: "CRDT + WebSocket",
          description: "Yjs handles state merging, Socket.io transports updates, Redis enables horizontal scaling"
        },
        pros: ["Proven CRDT implementation", "Excellent browser support", "Scalable architecture"],
        cons: ["Complex debugging", "Memory intensive for large docs"],
        whenToChoose: "When you need production-ready real-time collaboration"
      }
    ],
    
    isTemplate: true,
    learningOutcomes: [
      "CRDT (Conflict-free Replicated Data Types)",
      "Real-time WebSocket communication",
      "Monaco Editor integration",
      "Presence and awareness systems",
      "WebRTC video chat basics"
    ],
    realWorldUse: "Used in Figma, Notion, Google Docs - collaborative tools are essential for remote teams"
  },
  
  {
    title: "AI-Powered Content Moderation System",
    slug: "ai-content-moderation",
    description: "Build an automated content moderation platform using NLP and computer vision. Detect toxic text, inappropriate images, and spam across user-generated content platforms.",
    shortDescription: "Automated content moderation with ML models",
    difficulty: "Advanced",
    domain: "AI",
    tags: ["machine-learning", "nlp", "computer-vision", "moderation", "tensorflow"],
    estimatedDuration: "4-5 weeks",
    teamSize: "2 developers",
    
    requirements: {
      functional: [
        { asA: "platform owner", iWant: "to automatically flag toxic comments", soThat: "my community stays safe", priority: "Must Have" },
        { asA: "moderator", iWant: "to review AI-flagged content in a queue", soThat: "I can make final decisions", priority: "Must Have" },
        { asA: "user", iWant: "to appeal moderation decisions", soThat: "mistakes can be corrected", priority: "Should Have" },
        { asA: "system", iWant: "to detect NSFW images in uploads", soThat: "inappropriate content is blocked", priority: "Must Have" },
        { asA: "admin", iWant: "to customize moderation thresholds", soThat: "I can adjust sensitivity per community", priority: "Should Have" }
      ],
      nonFunctional: [
        { category: "Performance", requirement: "Moderation latency", metric: "< 500ms per content item" },
        { category: "Accuracy", requirement: "Toxic detection precision", metric: "> 95% precision, > 90% recall" },
        { category: "Scale", requirement: "Content throughput", metric: "10,000 items/minute" }
      ]
    },
    
    databaseSchema: {
      entities: [
        {
          name: "Content",
          fields: [
            { name: "type", type: "String", required: true, description: "text, image, video" },
            { name: "content", type: "String", required: true, description: "Text content or image URL" },
            { name: "status", type: "String", required: true, description: "pending, approved, rejected, appealed" },
            { name: "moderationScore", type: "Number", required: false, description: "AI confidence score 0-1" },
            { name: "flags", type: "Array", required: false, description: ["toxic", "spam", "nsfw"] }
          ]
        },
        {
          name: "ModerationDecision",
          fields: [
            { name: "contentId", type: "ObjectId", required: true },
            { name: "moderatorId", type: "ObjectId", required: true },
            { name: "decision", type: "String", required: true, description: "approve, reject" },
            { name: "reason", type: "String", required: false },
            { name: "aiSuggested", type: "Boolean", required: true }
          ]
        },
        {
          name: "Appeal",
          fields: [
            { name: "contentId", type: "ObjectId", required: true },
            { name: "userId", type: "ObjectId", required: true },
            { name: "reason", type: "String", required: true },
            { name: "status", type: "String", required: true, description: "pending, approved, rejected" },
            { name: "resolution", type: "String", required: false }
          ]
        }
      ]
    },
    
    milestones: [
      {
        title: "ML Model Setup",
        description: "Set up TensorFlow/PyTorch, implement text toxicity classifier",
        order: 1,
        estimatedHours: 16,
        learningOutcomes: ["Transformer models", "Fine-tuning BERT", "Model quantization"],
        deliverables: ["Toxic text classifier", "Model evaluation metrics", "API endpoint"]
      },
      {
        title: "Image Moderation Pipeline",
        description: "Implement NSFW image detection using pre-trained models",
        order: 2,
        estimatedHours: 14,
        learningOutcomes: ["Computer vision", "Image classification", "Content safety"],
        deliverables: ["Image classifier", "Batch processing", "Confidence scoring"]
      },
      {
        title: "Moderation Queue UI",
        description: "Build dashboard for human moderators to review flagged content",
        order: 3,
        estimatedHours: 18,
        learningOutcomes: ["Queue management", "Human-in-the-loop", "Audit trails"],
        deliverables: ["Moderation dashboard", "Review workflows", "Appeal system"]
      },
      {
        title: "Integration & Scaling",
        description: "Deploy models, implement caching, handle high throughput",
        order: 4,
        estimatedHours: 16,
        learningOutcomes: ["Model serving", "Redis caching", "Load balancing"],
        deliverables: ["Production deployment", "Auto-scaling", "Monitoring"]
      }
    ],
    
    suggestedStacks: [
      {
        name: "Python ML Stack",
        category: "backend",
        technologies: [
          { name: "Python", version: "3.10+", purpose: "ML model development", alternatives: [] },
          { name: "TensorFlow", version: "2.x", purpose: "Deep learning framework", alternatives: ["PyTorch"] },
          { name: "FastAPI", version: "latest", purpose: "High-performance API", alternatives: ["Flask"] },
          { name: "Redis", version: "7.x", purpose: "Result caching", alternatives: ["Memcached"] },
          { name: "PostgreSQL", version: "15.x", purpose: "Store moderation decisions", alternatives: ["MongoDB"] }
        ],
        architecture: {
          pattern: "Microservices",
          description: "Separate services for text, image, and video moderation with message queue"
        },
        pros: ["Mature ML ecosystem", "FastAPI performance", "Easy model versioning"],
        cons: ["Python GIL limitations", "High memory usage"],
        whenToChoose: "When ML accuracy is priority and you have Python expertise"
      }
    ],
    
    isTemplate: true,
    learningOutcomes: [
      "NLP text classification",
      "Computer vision for image moderation",
      "Building ML model APIs",
      "Human-in-the-loop workflows",
      "Content moderation at scale"
    ],
    realWorldUse: "Essential for social media, forums, and any platform with user-generated content"
  },

  // Additional projects from the original seed file to maintain variety
  {
    title: "Personal Portfolio Website",
    description: "Build a responsive portfolio website to showcase your skills, projects, and resume. Includes dark mode, contact form, and project gallery.",
    difficulty: "Beginner",
    domain: "Web",
    isTemplate: true,
    estimatedDuration: "2 weeks",
    tags: ["portfolio", "frontend", "responsive"],
    suggestedStacks: [
      {
        name: "HTML/CSS/JS",
        category: "frontend",
        technologies: [
          { name: "HTML5", purpose: "Semantic markup" },
          { name: "CSS3", purpose: "Styling and animations" },
          { name: "JavaScript", purpose: "Interactivity" }
        ],
        architecture: { pattern: "Static Site", description: "Pure frontend fundamentals" },
        pros: ["No frameworks needed", "Fast loading", "Easy deployment"],
        cons: ["Limited interactivity"],
        whenToChoose: "When you want a simple, fast portfolio"
      },
      {
        name: "React Static",
        category: "frontend",
        technologies: [
          { name: "React", version: "18.x", purpose: "Component-based UI" },
          { name: "Tailwind CSS", purpose: "Utility-first styling" },
          { name: "Vite", purpose: "Build tool" }
        ],
        architecture: { pattern: "SPA", description: "Modern React with static generation" },
        pros: ["Reusable components", "Modern development experience"],
        cons: ["More complex setup"],
        whenToChoose: "When you want modern React practices"
      }
    ],
    learningOutcomes: ["Responsive design", "DOM manipulation", "Form handling", "Git workflow"],
    realWorldUse: "Essential for job hunting and personal branding",
    milestones: [
      { title: "Setup & Basic Structure", order: 1, estimatedHours: 4, deliverables: ["Project setup", "Basic HTML structure"] },
      { title: "Styling & Responsiveness", order: 2, estimatedHours: 6, deliverables: ["CSS styling", "Mobile responsive"] },
      { title: "Interactive Features", order: 3, estimatedHours: 6, deliverables: ["Contact form", "Project gallery", "Dark mode"] }
    ]
  },

  {
    title: "Weather Dashboard",
    description: "Create a weather app that shows current conditions and 5-day forecast for any city using a public weather API.",
    difficulty: "Beginner",
    domain: "Web",
    isTemplate: true,
    estimatedDuration: "1 week",
    tags: ["weather", "api", "data-visualization"],
    suggestedStacks: [
      {
        name: "Vanilla JS",
        category: "frontend",
        technologies: [
          { name: "HTML", purpose: "Structure" },
          { name: "CSS", purpose: "Styling" },
          { name: "JavaScript", purpose: "API calls and DOM manipulation" },
          { name: "OpenWeatherMap API", purpose: "Weather data" }
        ],
        architecture: { pattern: "Client-side", description: "API integration without frameworks" },
        pros: ["Learn fundamentals", "No build step"],
        cons: ["Code organization"],
        whenToChoose: "When learning API integration basics"
      }
    ],
    learningOutcomes: ["API integration", "Async/await", "Data fetching", "Error handling"],
    realWorldUse: "API consumption patterns used in all modern apps"
  },

  {
    title: "Task Management App",
    description: "Build a Todoist-like task manager with CRUD operations, categories, due dates, and local storage persistence.",
    difficulty: "Beginner",
    domain: "Web",
    isTemplate: true,
    estimatedDuration: "2 weeks",
    tags: ["todo", "crud", "state-management"],
    suggestedStacks: [
      {
        name: "React + LocalStorage",
        category: "frontend",
        technologies: [
          { name: "React", purpose: "UI components" },
          { name: "LocalStorage", purpose: "Data persistence" },
          { name: "Tailwind CSS", purpose: "Styling" }
        ],
        architecture: { pattern: "Client-side SPA", description: "No backend needed" },
        pros: ["Simple setup", "Fast development"],
        cons: ["No real-time sync"],
        whenToChoose: "When you want a quick personal task manager"
      }
    ],
    learningOutcomes: ["State management", "CRUD operations", "Data persistence", "REST APIs"],
    realWorldUse: "Productivity tools are always in demand"
  },

  {
    title: "E-Commerce Platform",
    description: "Full-featured online store with product catalog, shopping cart, payment processing, and order management.",
    difficulty: "Intermediate",
    domain: "Web",
    isTemplate: true,
    estimatedDuration: "4 weeks",
    tags: ["ecommerce", "payments", "shopping-cart"],
    suggestedStacks: [
      {
        name: "MERN Commerce",
        category: "backend",
        technologies: [
          { name: "MongoDB", purpose: "Product and order storage" },
          { name: "Express", purpose: "API framework" },
          { name: "React", purpose: "Frontend" },
          { name: "Node.js", purpose: "Runtime" },
          { name: "Stripe", purpose: "Payment processing" }
        ],
        architecture: { pattern: "MERN Stack", description: "Full-stack JavaScript" },
        pros: ["Consistent stack", "Large ecosystem"],
        cons: ["Learning curve"],
        whenToChoose: "When building a full-featured store"
      }
    ],
    learningOutcomes: ["Payment integration", "Inventory management", "Admin dashboards", "Search/filter"],
    realWorldUse: "Multi-billion dollar e-commerce industry"
  },

  {
    title: "Real-Time Chat Application",
    description: "Real-time chat app with rooms, emojis, and message history using WebSockets.",
    difficulty: "Intermediate",
    domain: "Web",
    isTemplate: true,
    estimatedDuration: "2 weeks",
    tags: ["chat", "websockets", "real-time"],
    suggestedStacks: [
      {
        name: "Socket.io Chat",
        category: "backend",
        technologies: [
          { name: "React", purpose: "Frontend UI" },
          { name: "Socket.io", purpose: "Real-time communication" },
          { name: "Express", purpose: "Server" },
          { name: "Node.js", purpose: "Runtime" }
        ],
        architecture: { pattern: "Event-driven", description: "WebSocket-based real-time" },
        pros: ["Bidirectional communication", "Room support"],
        cons: ["Connection management"],
        whenToChoose: "When building real-time features"
      }
    ],
    learningOutcomes: ["WebSockets", "Real-time data", "Event handling", "Room management"],
    realWorldUse: "Communication tools and customer support"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing template projects
    await Project.deleteMany({ isTemplate: true });
    console.log('Cleared existing templates');

    // Insert new detailed projects
    const created = await Project.insertMany(realProjects);
    console.log(`Successfully seeded ${created.length} detailed projects`);

    // Log summary
    const byDifficulty = {
      Beginner: realProjects.filter(p => p.difficulty === 'Beginner').length,
      Intermediate: realProjects.filter(p => p.difficulty === 'Intermediate').length,
      Advanced: realProjects.filter(p => p.difficulty === 'Advanced').length
    };
    
    console.log('\nProject Distribution:');
    console.log(`- Beginner: ${byDifficulty.Beginner}`);
    console.log(`- Intermediate: ${byDifficulty.Intermediate}`);
    console.log(`- Advanced: ${byDifficulty.Advanced}`);

    const byDomain = {};
    realProjects.forEach(p => {
      byDomain[p.domain] = (byDomain[p.domain] || 0) + 1;
    });
    
    console.log('\nBy Domain:');
    Object.entries(byDomain).forEach(([domain, count]) => {
      console.log(`- ${domain}: ${count}`);
    });

    console.log('\nProjects with milestones:', realProjects.filter(p => p.milestones?.length > 0).length);
    console.log('Projects with detailed stacks:', realProjects.filter(p => p.suggestedStacks?.length > 0).length);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

