const difficultyByType = {
  web: 'Intermediate',
  mobile: 'Intermediate',
  fullstack: 'Advanced',
};

const domainByType = {
  web: 'Web',
  mobile: 'Mobile',
  fullstack: 'Web',
};

const durationByType = {
  web: '4-6 weeks',
  mobile: '5-7 weeks',
  fullstack: '6-9 weeks',
};

const sampleProjects = [
  { id: 1, title: 'E-commerce Platform', type: 'fullstack', desc: 'Multi-vendor marketplace with cart, payments, and seller dashboard.', stacks: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Stripe', 'Prisma', 'Redis'] },
  { id: 2, title: 'Food Delivery App', type: 'mobile', desc: 'Real-time food ordering with GPS tracking and push notifications.', stacks: ['React Native', 'Expo', 'Firebase', 'Google Maps API', 'Redux Toolkit', 'Stripe'] },
  { id: 3, title: 'SaaS Analytics Dashboard', type: 'web', desc: 'Business intelligence tool with charts, KPIs, and report exports.', stacks: ['React', 'Vite', 'D3.js', 'Chart.js', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'] },
  { id: 4, title: 'Real Estate Listing Portal', type: 'fullstack', desc: 'Property search with map integration, filters, and agent CRM.', stacks: ['Vue 3', 'Nuxt.js', 'Leaflet.js', 'Django', 'MySQL', 'Cloudinary', 'Elasticsearch'] },
  { id: 5, title: 'Fitness & Workout Tracker', type: 'mobile', desc: 'Log workouts, set goals, and track progress with analytics.', stacks: ['Flutter', 'Dart', 'Firebase Firestore', 'Hive', 'Provider', 'Google Fit API'] },
  { id: 6, title: 'Online Learning Platform', type: 'fullstack', desc: 'Video courses, quizzes, certificates, and student progress tracking.', stacks: ['Next.js', 'TypeScript', 'MongoDB', 'AWS S3', 'Express.js', 'Stripe', 'Socket.io'] },
  { id: 7, title: 'Social Media App', type: 'mobile', desc: 'Photo/video sharing with stories, likes, comments, and DMs.', stacks: ['React Native', 'GraphQL', 'Apollo', 'Node.js', 'PostgreSQL', 'AWS S3', 'Firebase'] },
  { id: 8, title: 'Hospital Management System', type: 'web', desc: 'Patient records, appointment scheduling, and billing management.', stacks: ['Angular', 'TypeScript', 'Spring Boot', 'Java', 'MySQL', 'JWT', 'Docker', 'Nginx'] },
  { id: 9, title: 'Job Board Platform', type: 'fullstack', desc: 'Job listings, applicant tracking, and employer dashboards.', stacks: ['Next.js', 'Prisma', 'PostgreSQL', 'Tailwind CSS', 'Clerk Auth', 'Resend', 'Vercel'] },
  { id: 10, title: 'Digital Wallet & Fintech App', type: 'mobile', desc: 'Send money, pay bills, view transactions, and manage cards.', stacks: ['Flutter', 'Dart', 'Node.js', 'PostgreSQL', 'Plaid API', 'Stripe', 'AWS Lambda'] },
  { id: 11, title: 'Hotel Booking Website', type: 'web', desc: 'Search rooms, compare prices, book, and manage reservations.', stacks: ['React', 'Redux', 'Express.js', 'MongoDB', 'Mapbox', 'Stripe', 'Cloudinary'] },
  { id: 12, title: 'News & Media Portal', type: 'web', desc: 'News aggregation with categories, search, and subscription model.', stacks: ['Next.js', 'TypeScript', 'Sanity CMS', 'Tailwind CSS', 'PostgreSQL', 'Stripe', 'Vercel'] },
  { id: 13, title: 'Ride-Hailing App', type: 'mobile', desc: 'Driver & rider matching with live GPS, fare estimate, and ratings.', stacks: ['React Native', 'Google Maps', 'Socket.io', 'Node.js', 'MongoDB', 'Stripe', 'Firebase'] },
  { id: 14, title: 'Project Management Tool', type: 'fullstack', desc: 'Kanban boards, task assignments, deadlines, and team collaboration.', stacks: ['React', 'TypeScript', 'Nest.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Socket.io', 'Docker'] },
  { id: 15, title: 'Telemedicine Platform', type: 'fullstack', desc: 'Doctor consultations via video call with prescriptions and records.', stacks: ['Next.js', 'WebRTC', 'Twilio', 'Django', 'PostgreSQL', 'Celery', 'Redis', 'AWS'] },
  { id: 16, title: 'Recipe & Meal Planner App', type: 'mobile', desc: 'Browse recipes, plan weekly meals, and auto-generate shopping lists.', stacks: ['Flutter', 'Riverpod', 'Supabase', 'Dart', 'Spoonacular API', 'SQLite'] },
  { id: 17, title: 'Event Ticketing Platform', type: 'web', desc: 'Event discovery, ticket purchase, QR check-in, and organizer tools.', stacks: ['Vue 3', 'Pinia', 'Node.js', 'MySQL', 'Stripe', 'QR Code API', 'Cloudinary', 'Docker'] },
  { id: 18, title: 'Inventory Management System', type: 'web', desc: 'Stock tracking, supplier management, purchase orders, and reporting.', stacks: ['React', 'TypeScript', 'FastAPI', 'Python', 'PostgreSQL', 'Celery', 'Docker', 'Chart.js'] },
  { id: 19, title: 'Language Learning App', type: 'mobile', desc: 'Flashcards, daily lessons, streaks, and AI-powered pronunciation check.', stacks: ['React Native', 'Expo', 'OpenAI API', 'Firebase', 'Redux', 'AsyncStorage', 'Lottie'] },
  { id: 20, title: 'Smart Home Control App', type: 'mobile', desc: 'Control IoT devices, automate routines, and monitor energy usage.', stacks: ['Flutter', 'MQTT', 'Node.js', 'InfluxDB', 'Firebase', 'BLE API', 'Raspberry Pi'] },
];

const toTechnology = (name, index) => ({
  name,
  purpose: index === 0 ? 'Primary foundation for the project build.' : `Supports the ${name.toLowerCase()} portion of the solution.`,
});

const createMilestones = (title) => [
  {
    order: 1,
    title: 'Product planning',
    description: `Define the product scope, user journeys, and architecture for ${title}.`,
    estimatedHours: 6,
    deliverables: ['Feature map', 'User flows', 'Implementation plan'],
  },
  {
    order: 2,
    title: 'Core build',
    description: `Implement the main experience and technical foundation for ${title}.`,
    estimatedHours: 18,
    deliverables: ['Main workflows', 'Connected data layer', 'Integrated services'],
  },
  {
    order: 3,
    title: 'Quality and release',
    description: `Polish, test, and prepare ${title} for demo or deployment.`,
    estimatedHours: 10,
    deliverables: ['Release checklist', 'QA fixes', 'Deployment notes'],
  },
];

const sampleProjectTemplates = sampleProjects.map((project) => ({
  _id: `sample-${project.id}`,
  title: project.title,
  slug: `sample-${project.id}-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  description: project.desc,
  difficulty: difficultyByType[project.type] || 'Intermediate',
  domain: domainByType[project.type] || 'Web',
  estimatedDuration: durationByType[project.type] || '4-6 weeks',
  teamSize: project.type === 'fullstack' ? '2-4 developers' : '1-3 developers',
  tags: [project.type === 'fullstack' ? 'Full-stack' : project.type === 'mobile' ? 'Mobile app' : 'Web app', ...project.stacks.slice(0, 3)],
  isTemplate: true,
  isActive: true,
  techStack: project.stacks,
  learningOutcomes: [
    `Plan and deliver ${project.title} as a realistic product project.`,
    'Choose technologies that match product requirements.',
    'Understand the tradeoffs inside a modern implementation stack.',
  ],
  realWorldUse: `This sample reflects the architecture and planning style used when teams build ${project.title} in production.`,
  milestones: createMilestones(project.title),
  suggestedStacks: [
    {
      name: `${project.title} Recommended Stack`,
      category: project.type === 'mobile' ? 'mobile' : 'frontend',
      technologies: project.stacks.map(toTechnology),
      architecture: {
        pattern: project.type === 'fullstack' ? 'Layered full-stack architecture' : project.type === 'mobile' ? 'Mobile client with integrated services' : 'Frontend application with supporting APIs',
        description: `A curated stack for building ${project.title} with the technologies provided in the sample.`,
      },
      pros: [
        'Matches the sample project technologies directly',
        'Covers the main build and delivery layers',
        'Useful for learning realistic project planning',
      ],
      cons: ['Can be broader than a first prototype', 'Some tools may increase setup complexity'],
      whenToChoose: `Choose this stack when you want to build ${project.title} close to the provided sample.`,
    },
  ],
}));

const getSampleProjectTemplates = () => sampleProjectTemplates;
const getSampleProjectTemplateById = (id) => sampleProjectTemplates.find((project) => project._id === id) || null;

module.exports = {
  getSampleProjectTemplates,
  getSampleProjectTemplateById,
};
