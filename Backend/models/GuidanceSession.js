const mongoose = require('mongoose');

// Schema for AI guidance sessions
const guidanceSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false  // Made optional to handle cases where projectId is not provided
  },
  milestone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project.milestones'
  },
  type: {
    type: String,
    enum: ['ai_chat', 'code_review', 'progress_analysis', 'learning_path', 'architecture_review'],
    default: 'ai_chat'
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: String
  },
  // For code review specific data
  code: {
    type: String
  },
  language: {
    type: String
  },
  review: {
    score: Number,
    criticalIssues: [String],
    warnings: [String],
    suggestions: [String],
    refactoredCode: String
  },
  // AI metadata
  aiModel: {
    type: String,
    enum: ['gpt-4', 'gpt-4-turbo', 'claude-3-opus', 'claude-3-sonnet'],
    default: 'gpt-4-turbo'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  // Session tracking
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'] },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
guidanceSessionSchema.index({ user: 1, project: 1, createdAt: -1 });
guidanceSessionSchema.index({ project: 1, type: 1 });

module.exports = mongoose.model('GuidanceSession', guidanceSessionSchema);

