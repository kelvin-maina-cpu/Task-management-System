const mongoose = require('mongoose');

// Milestone Schema
const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  order: Number,
  estimatedHours: Number,
  learningOutcomes: [String],
  deliverables: [String],
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['article', 'video', 'documentation', 'github'] }
  }]
});

// Tech Stack Schema
const techStackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['frontend', 'backend', 'database', 'devops', 'testing', 'mobile', 'ai'] 
  },
  technologies: [{
    name: String,
    version: String,
    purpose: String,
    alternatives: [String]
  }],
  architecture: {
    pattern: String,
    diagram: String,
    description: String
  },
  pros: [String],
  cons: [String],
  whenToChoose: String
});

// Main Project Schema
const projectSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: { type: String, unique: true, sparse: true },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: { type: String, maxlength: 200 },
  
  // Categorization
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  domain: {
    type: String,
    enum: ['Web', 'Mobile', 'AI', 'DevOps', 'Blockchain', 'IoT', 'Data Science', 'Other'],
    default: 'Web'
  },
  tags: [{ type: String }],
  
  // Project Status
  isTemplate: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  estimatedDuration: {
    type: String,
    trim: true
  },
  teamSize: {
    type: String,
    default: "1-2 developers"
  },
  
  // Detailed Requirements
  requirements: {
    functional: [{
      asA: String,
      iWant: String,
      soThat: String,
      priority: { type: String, enum: ['Must Have', 'Should Have', 'Could Have'] }
    }],
    nonFunctional: [{
      category: String,
      requirement: String,
      metric: String
    }]
  },
  
  // Technical Architecture
databaseSchema: mongoose.Schema.Types.Mixed,
  
  apiEndpoints: [{
    method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
    path: String,
    description: String,
    requestBody: mongoose.Schema.Types.Mixed,
    response: mongoose.Schema.Types.Mixed,
    authRequired: Boolean
  }],
  
  // UI/UX
  wireframes: [{
    title: String,
    description: String,
    imageUrl: String
  }],
  
  // Implementation Guide
  milestones: [milestoneSchema],
  
  // Stack Suggestions (enhanced from original) - RELAXED for legacy data
  suggestedStacks: [{
    name: String,
    category: String,
    technologies: mongoose.Schema.Types.Mixed,  // ✅ Flexible array/object/string
    architecture: mongoose.Schema.Types.Mixed,
    pros: [String],
    cons: [String],
    whenToChoose: String
  }],
  
  // Legacy field support
  _legacyStacks: [{
    name: String,
    technologies: [String],
    description: String
  }],

  
  // Resources
  starterCode: {
    repositoryUrl: String,
    setupInstructions: String,
    environmentVariables: [{
      name: String,
      description: String,
      required: Boolean
    }]
  },
  
  // Learning Outcomes (kept from original)
  learningOutcomes: [{ type: String }],
  realWorldUse: { type: String, trim: true },
  
  // User Progress Tracking
    enrolledUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrolledAt: { type: Date, default: Date.now },
    currentMilestone: { type: Number, default: 0 },
    completedMilestones: [{ type: Number }],
    chosenStack: mongoose.Schema.Types.Mixed,  // Flexible for frontend data
    repositoryUrl: String,
    deployedUrl: String,
    status: { 
      type: String, 
      enum: ['enrolled', 'in-progress', 'completed', 'abandoned'],
      default: 'enrolled'
    }
  }],

  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isTemplate; }
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Ratings and Reviews
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    completed: Boolean
  }],
  averageRating: { type: Number, default: 0 },
  completionCount: { type: Number, default: 0 },
  
  // Dates
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for techStack compatibility (for backward compatibility)
projectSchema.virtual('techStack').get(function() {
  if (this.suggestedStacks && this.suggestedStacks.length > 0) {
    return this.suggestedStacks.flatMap(stack => 
      stack.technologies ? stack.technologies.map(t => t.name || t) : []
    );
  }
  if (this._legacyStacks && this._legacyStacks.length > 0) {
    return this._legacyStacks.flatMap(stack => stack.technologies || []);
  }
  return [];
});

// Indexes for performance
// Note: slug has unique:true in schema which creates index automatically
projectSchema.index({ difficulty: 1, domain: 1, isActive: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ 'enrolledUsers.user': 1 });
projectSchema.index({ members: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ isTemplate: 1, difficulty: 1, domain: 1 });

// Pre-save middleware to handle legacy stacks conversion
projectSchema.pre('save', async function() {
  // Calculate average rating
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  }
  
  // Generate slug from title if not provided
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});


module.exports = mongoose.model('Project', projectSchema);

