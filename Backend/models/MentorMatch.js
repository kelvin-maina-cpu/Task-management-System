const mongoose = require('mongoose');

// Session schema for mentorship meetings
const sessionSchema = new mongoose.Schema({
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  type: {
    type: String,
    enum: ['code_review', 'architecture', 'debugging', 'career', 'general'],
    default: 'general'
  },
  topics: [String],
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  meetingLink: String,
  recordingUrl: String,
  notes: String,
  actionItems: [{
    title: String,
    completed: { type: Boolean, default: false },
    deadline: Date
  }]
});

// Main MentorMatch schema
const mentorMatchSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  // Match scoring
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  matchBreakdown: {
    techStack: Number,
    domain: Number,
    difficulty: Number,
    availability: Number,
    rating: Number,
    pastSuccess: Number
  },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'accepted', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Goals for this mentorship
  goals: [{
    title: String,
    description: String,
    milestone: Number,
    completed: { type: Boolean, default: false }
  }],
  // Sessions
  sessions: [sessionSchema],
  // Feedback
  studentFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    wouldRecommend: Boolean
  },
  mentorFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    studentEngagement: Number
  },
  // Timestamps
  startDate: Date,
  endDate: Date,
  acceptedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Indexes
mentorMatchSchema.index({ student: 1, status: 1 });
mentorMatchSchema.index({ mentor: 1, status: 1 });
mentorMatchSchema.index({ project: 1, status: 1 });

module.exports = mongoose.model('MentorMatch', mentorMatchSchema);

