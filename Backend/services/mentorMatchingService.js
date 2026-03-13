// Mentor Matching Service
// Handles mentor-student matching, scheduling, and mentorship tracking

const User = require('../models/User');
const Project = require('../models/Project');
const MentorMatch = require('../models/MentorMatch');

class MentorMatchingService {
  // Calculate compatibility score between student and mentor
  async calculateMatchScore(student, mentor, project) {
    let score = 0;
    const weights = {
      techStack: 0.3,
      domain: 0.2,
      difficulty: 0.15,
      availability: 0.15,
      rating: 0.1,
      pastSuccess: 0.1
    };

    // Tech stack match
    const studentTechs = student.chosenStack?.technologies?.map(t => t.name) || [];
    const mentorExpertise = mentor.expertise || [];
    const techOverlap = studentTechs.filter(t => 
      mentorExpertise.some(e => e.toLowerCase().includes(t.toLowerCase()))
    );
    const techScore = studentTechs.length > 0 
      ? (techOverlap.length / studentTechs.length) 
      : 0.5;
    score += techScore * weights.techStack * 100;

    // Domain expertise
    const domainMatch = mentor.domains?.includes(project.domain) ? 1 : 0;
    score += domainMatch * weights.domain * 100;

    // Difficulty alignment
    const difficultyLevels = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
    const studentLevel = difficultyLevels[project.difficulty] || 1;
    const mentorMaxLevel = difficultyLevels[mentor.maxDifficulty] || 3;
    const difficultyScore = studentLevel <= mentorMaxLevel ? 1 : 0;
    score += difficultyScore * weights.difficulty * 100;

    // Availability
    const availabilityScore = this.calculateAvailabilityOverlap(
      student.availability,
      mentor.availability
    );
    score += availabilityScore * weights.availability * 100;

    // Mentor rating
    const ratingScore = mentor.averageRating 
      ? (mentor.averageRating / 5) * weights.rating * 100 
      : 0;
    score += ratingScore;

    // Past success rate
    const totalMentorships = mentor.totalMentorships || 0;
    const completedMentorships = mentor.completedMentorships || 0;
    const successRate = totalMentorships > 0 
      ? completedMentorships / totalMentorships 
      : 0.5;
    score += successRate * weights.pastSuccess * 100;

    return {
      totalScore: Math.round(score),
      breakdown: {
        techStack: Math.round(techScore * 100),
        domain: domainMatch * 100,
        difficulty: difficultyScore * 100,
        availability: Math.round(availabilityScore * 100),
        rating: Math.round((mentor.averageRating || 0) / 5 * 100),
        pastSuccess: Math.round(successRate * 100)
      },
      techOverlap: techOverlap.map(t => ({ name: t, matched: true }))
    };
  }

  // Find best mentor matches for a student
  async findMatches(studentId, projectId, limit = 5) {
    const student = await User.findById(studentId);
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Get all available mentors
    const mentors = await User.find({
      role: 'mentor',
      isAvailable: true,
      _id: { $ne: studentId }
    });

    if (mentors.length === 0) {
      return [];
    }

    // Calculate scores for each mentor
    const scoredMentors = await Promise.all(
      mentors.map(async (mentor) => {
        const score = await this.calculateMatchScore(
          { chosenStack: student?.chosenStack, availability: student?.availability },
          mentor,
          project
        );
        return {
          mentor: {
            _id: mentor._id,
            name: mentor.name,
            email: mentor.email,
            avatar: mentor.avatar,
            title: mentor.title,
            expertise: mentor.expertise || [],
            domains: mentor.domains || [],
            averageRating: mentor.averageRating || 0,
            totalReviews: mentor.totalReviews || 0,
            completedMentorships: mentor.completedMentorships || 0,
            totalMentorships: mentor.totalMentorships || 0,
            avgResponseTime: mentor.avgResponseTime || '< 24h',
            isTopRated: (mentor.averageRating || 0) >= 4.8,
            availability: mentor.availability,
            maxDifficulty: mentor.maxDifficulty || 'Advanced'
          },
          score
        };
      })
    );

    // Sort by score and return top matches
    return scoredMentors
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .slice(0, limit);
  }

  // Create mentorship session/request
  async createMentorship(studentId, mentorId, projectId, matchScore) {
    // Check for existing pending request
    const existingRequest = await MentorMatch.findOne({
      student: studentId,
      mentor: mentorId,
      project: projectId,
      status: 'pending'
    });

    if (existingRequest) {
      throw new Error('Mentorship request already exists');
    }

    const mentorship = await MentorMatch.create({
      student: studentId,
      mentor: mentorId,
      project: projectId,
      matchScore: matchScore.totalScore,
      matchBreakdown: matchScore.breakdown,
      status: 'pending',
      startDate: null,
      endDate: null,
      sessions: [],
      goals: []
    });

    // Notify mentor (placeholder - would integrate with notifications)
    await this.notifyMentor(mentorId, {
      type: 'new_mentorship_request',
      studentId,
      projectId,
      matchScore: matchScore.totalScore
    });

    return mentorship;
  }

  // Accept mentorship request
  async acceptMentorship(mentorshipId, mentorId) {
    const mentorship = await MentorMatch.findOne({
      _id: mentorshipId,
      mentor: mentorId,
      status: 'pending'
    });

    if (!mentorship) {
      throw new Error('Mentorship request not found');
    }

    mentorship.status = 'active';
    mentorship.acceptedAt = new Date();
    mentorship.startDate = new Date();
    
    await mentorship.save();

    return mentorship;
  }

  // Schedule session
  async scheduleSession(mentorshipId, sessionDetails, userId) {
    const { date, duration, type, topics } = sessionDetails;
    
    const session = {
      scheduledAt: new Date(date),
      duration: duration || 60,
      type: type || 'general',
      topics: topics || [],
      status: 'scheduled',
      meetingLink: await this.generateMeetingLink(),
      recordingUrl: null,
      notes: '',
      actionItems: []
    };

    const mentorship = await MentorMatch.findByIdAndUpdate(
      mentorshipId,
      { $push: { sessions: session } },
      { new: true }
    );

    if (!mentorship) {
      throw new Error('Mentorship not found');
    }

    // Send calendar invites (placeholder)
    await this.sendCalendarInvites(mentorship, session);

    return {
      session,
      mentorship
    };
  }

  // Complete a session
  async completeSession(mentorshipId, sessionIndex, notes, actionItems) {
    const mentorship = await MentorMatch.findById(mentorshipId);
    
    if (!mentorship) {
      throw new Error('Mentorship not found');
    }

    const session = mentorship.sessions[sessionIndex];
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'completed';
    session.notes = notes || '';
    session.actionItems = actionItems || [];

    await mentorship.save();

    return mentorship;
  }

  // Add goal to mentorship
  async addGoal(mentorshipId, goalData) {
    const { title, description, milestone } = goalData;

    const mentorship = await MentorMatch.findByIdAndUpdate(
      mentorshipId,
      { 
        $push: { 
          goals: { 
            title, 
            description, 
            milestone, 
            completed: false 
          } 
        } 
      },
      { new: true }
    );

    if (!mentorship) {
      throw new Error('Mentorship not found');
    }

    return mentorship;
  }

  // Submit feedback for mentorship
  async submitFeedback(mentorshipId, feedback, isStudent = true) {
    const mentorship = await MentorMatch.findById(mentorshipId);
    
    if (!mentorship) {
      throw new Error('Mentorship not found');
    }

    if (isStudent) {
      mentorship.studentFeedback = {
        rating: feedback.rating,
        review: feedback.review,
        wouldRecommend: feedback.wouldRecommend
      };
      
      // Update mentor's stats
      await User.findByIdAndUpdate(mentorship.mentor, {
        $inc: { totalMentorships: 1, completedMentorships: 1 },
        $set: { averageRating: feedback.rating }
      });
    } else {
      mentorship.mentorFeedback = {
        rating: feedback.rating,
        review: feedback.review,
        studentEngagement: feedback.studentEngagement
      };
    }

    // Check if all sessions completed - mark as completed
    const allCompleted = mentorship.sessions.every(s => s.status === 'completed');
    if (allCompleted && mentorship.status === 'active') {
      mentorship.status = 'completed';
      mentorship.completedAt = new Date();
    }

    await mentorship.save();

    return mentorship;
  }

  // Get student's mentorships
  async getStudentMentorships(studentId) {
    return await MentorMatch.find({ student: studentId })
      .populate('mentor', 'name email avatar title expertise')
      .populate('project', 'title domain')
      .sort({ createdAt: -1 });
  }

  // Get mentor's mentorships
  async getMentorMentorships(mentorId) {
    return await MentorMatch.find({ mentor: mentorId })
      .populate('student', 'name email avatar')
      .populate('project', 'title domain difficulty')
      .sort({ createdAt: -1 });
  }

  // Calculate availability overlap
  calculateAvailabilityOverlap(studentAvailability, mentorAvailability) {
    if (!studentAvailability || !mentorAvailability) return 0.5;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    let overlapHours = 0;
    let totalPossible = 0;

    days.forEach(day => {
      const studentSlots = studentAvailability[day] || [];
      const mentorSlots = mentorAvailability[day] || [];
      
      studentSlots.forEach(studentSlot => {
        const studentStart = this.parseTime(studentSlot.start);
        const studentEnd = this.parseTime(studentSlot.end);
        totalPossible += studentEnd - studentStart;
        
        mentorSlots.forEach(mentorSlot => {
          const overlap = this.getTimeOverlap(
            { start: studentSlot.start, end: studentSlot.end },
            mentorSlot
          );
          overlapHours += overlap;
        });
      });
    });

    return totalPossible > 0 ? Math.min(overlapHours / totalPossible, 1) : 0.5;
  }

  getTimeOverlap(slot1, slot2) {
    const start1 = this.parseTime(slot1.start);
    const end1 = this.parseTime(slot1.end);
    const start2 = this.parseTime(slot2.start);
    const end2 = this.parseTime(slot2.end);

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    
    return Math.max(0, overlapEnd - overlapStart);
  }

  parseTime(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  // Generate meeting link (placeholder - would integrate with Zoom/Google Meet)
  async generateMeetingLink() {
    const meetingId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    return `https://meet.devmentor.com/${meetingId}`;
  }

  // Notify mentor (placeholder - would integrate with notifications)
  async notifyMentor(mentorId, notification) {
    console.log(`Notifying mentor ${mentorId}:`, notification);
    // Would integrate with WebSocket or email service
  }

  // Send calendar invites (placeholder)
  async sendCalendarInvites(mentorship, session) {
    console.log('Sending calendar invites for session:', session);
    // Would generate .ics files or use Google Calendar API
  }

  // Cancel mentorship
  async cancelMentorship(mentorshipId, userId, reason) {
    const mentorship = await MentorMatch.findOne({
      _id: mentorshipId,
      $or: [{ student: userId }, { mentor: userId }],
      status: { $in: ['pending', 'active'] }
    });

    if (!mentorship) {
      throw new Error('Mentorship not found or already completed');
    }

    mentorship.status = 'cancelled';
    await mentorship.save();

    return mentorship;
  }
}

module.exports = new MentorMatchingService();

