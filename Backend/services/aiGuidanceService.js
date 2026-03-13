// AI Guidance Service
// Provides AI-powered coding assistance, progress analysis, code review, and learning paths

class AIGuidanceService {
  constructor() {
    // OpenAI and Anthropic will be initialized if API keys are provided
    this.openai = null;
    this.anthropic = null;
    
    // Initialize clients if API keys are available
    if (process.env.OPENAI_API_KEY) {
      const OpenAI = require('openai');
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      const Anthropic = require('@anthropic-ai/sdk');
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  // Check if AI services are available
  isAvailable() {
    return this.openai !== null || this.anthropic !== null;
  }

  // Analyze user's current milestone progress and provide guidance
  async analyzeProgress(userId, projectId, currentCode = null, errorLog = null) {
    const Project = require('../models/Project');
    const User = require('../models/User');
    
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Find user's enrollment
    const enrollment = project.enrolledUsers.find(
      e => e.user.toString() === userId
    );
    
    if (!enrollment) {
      throw new Error('User not enrolled in project');
    }
    
    const currentMilestoneIndex = enrollment.currentMilestone;
    const currentMilestone = project.milestones[currentMilestoneIndex];
    
    // Calculate progress percentage
    const totalMilestones = project.milestones.length;
    const completedCount = enrollment.completedMilestones.length;
    const progressPercentage = Math.round((completedCount / totalMilestones) * 100);

    // If OpenAI is available, use it for detailed analysis
    if (this.openai && currentMilestone) {
      return await this.getAIAnalysis(project, enrollment, currentMilestone, currentCode, errorLog);
    }
    
    // Fallback: Provide basic analysis without AI
    return this.getBasicAnalysis(project, enrollment, currentMilestone, progressPercentage);
  }

  // Get AI-powered analysis
  async getAIAnalysis(project, enrollment, currentMilestone, currentCode, errorLog) {
    const context = this.buildContext(project, enrollment, currentMilestone);
    
    const systemPrompt = `You are an expert software engineering mentor. Analyze the student's progress on "${project.title}".
Current milestone: ${currentMilestone?.title || 'Unknown'}
Tech stack: ${enrollment.chosenStack?.name || 'Not selected'}

Provide:
1. Progress assessment (0-100%)
2. Specific next steps (3-5 actionable items)
3. Code review feedback (if code provided)
4. Learning resources tailored to their level
5. Common pitfalls to avoid

Be encouraging but critical when needed. Focus on industry best practices.`;

    const userMessages = [];
    
    if (currentCode) {
      userMessages.push({
        role: 'user',
        content: `Here's my current code:\n\`\`\`\n${currentCode}\n\`\`\``
      });
    }

    if (errorLog) {
      userMessages.push({
        role: 'user',
        content: `I'm getting these errors:\n${errorLog}`
      });
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...userMessages
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return this.parseAIResponse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Return basic analysis on API error
      const totalMilestones = project.milestones.length;
      const completedCount = enrollment.completedMilestones.length;
      const progressPercentage = Math.round((completedCount / totalMilestones) * 100);
      return this.getBasicAnalysis(project, enrollment, currentMilestone, progressPercentage);
    }
  }

  // Build context for AI
  buildContext(project, enrollment, milestone) {
    return {
      projectTitle: project.title,
      difficulty: project.difficulty,
      stack: enrollment.chosenStack,
      currentMilestone: milestone?.title || 'Unknown',
      completedMilestones: enrollment.completedMilestones,
      startDate: enrollment.enrolledAt,
      lastActivity: enrollment.lastActivity,
      previousSubmissions: enrollment.submissions || []
    };
  }

  // Get basic analysis without AI
  getBasicAnalysis(project, enrollment, currentMilestone, progressPercentage) {
    const nextSteps = [];
    
    if (currentMilestone) {
      nextSteps.push({
        title: 'Complete current milestone',
        description: currentMilestone.description || 'Work on the current milestone objectives',
        estimatedHours: currentMilestone.estimatedHours || 4
      });
    }
    
    // Add general next steps
    nextSteps.push({
      title: 'Review milestone resources',
      description: 'Check the provided learning materials and resources',
      estimatedHours: 2
    });
    
    nextSteps.push({
      title: 'Practice with examples',
      description: 'Complete hands-on exercises related to the current topic',
      estimatedHours: 3
    });
    
    return {
      progressAssessment: progressPercentage,
      milestoneContext: currentMilestone?.title || 'Getting Started',
      completedMilestones: enrollment.completedMilestones.length,
      remainingMilestones: project.milestones.length - enrollment.completedMilestones.length,
      nextSteps,
      insights: {
        summary: `You are making good progress on ${project.title}. Keep up the momentum!`,
        warnings: [],
        recommendations: [
          'Regular practice is key to mastering new concepts',
          'Don\'t hesitate to ask for help when stuck'
        ]
      },
      codeReview: null,
      resources: currentMilestone?.resources || [],
      pitfalls: []
    };
  }

  // Real-time coding assistant
  async getCodingAssistance(userId, query, currentFile = null, projectContext = null) {
    // If Anthropic is available, use it for coding assistance
    if (this.anthropic) {
      try {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          system: `You are a helpful coding assistant. Provide:
- Code examples with explanations
- Best practices and why they matter
- Debugging strategies
- Performance considerations
Keep responses concise but thorough.`,
          messages: [
            {
              role: 'user',
              content: `Project: ${projectContext?.title || 'Unknown'}
File: ${currentFile || 'Unknown'}
Query: ${query}`
            }
          ]
        });

        return {
          answer: response.content[0].text,
          suggestedCode: this.extractCodeBlocks(response.content[0].text),
          confidence: this.calculateConfidence(response.content[0].text)
        };
      } catch (error) {
        console.error('Anthropic API error:', error);
      }
    }
    
    // Fallback: Provide basic response without AI
    return {
      answer: this.getBasicCodingResponse(query),
      suggestedCode: [],
      confidence: 0.5
    };
  }

  // Generate personalized learning path
  async generateLearningPath(userId, projectId, skillGaps = []) {
    const Project = require('../models/Project');
    const User = require('../models/User');
    
    const user = await User.findById(userId);
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    // If OpenAI is available, generate AI-powered learning path
    if (this.openai) {
      const prompt = `Create a personalized learning path for a ${user?.experienceLevel || 'intermediate'} developer 
building ${project.title} with ${project.difficulty} difficulty.

Skill gaps identified: ${skillGaps.join(', ')}

Generate:
1. Prerequisite topics to review (with estimated time)
2. Milestone-specific learning checkpoints
3. Hands-on exercises for each concept
4. Assessment criteria for each milestone

Format as structured JSON.`;

      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content);
      } catch (error) {
        console.error('OpenAI API error:', error);
      }
    }
    
    // Fallback: Generate basic learning path
    return this.getBasicLearningPath(project, skillGaps);
  }

  // Generate basic learning path without AI
  getBasicLearningPath(project, skillGaps) {
    const prerequisites = [
      { topic: 'JavaScript Fundamentals', estimatedHours: 10 },
      { topic: 'HTML/CSS Basics', estimatedHours: 8 },
      { topic: 'Git Version Control', estimatedHours: 4 }
    ];
    
    const checkpoints = project.milestones.map((milestone, index) => ({
      milestone: milestone.title,
      checkpoint: `Complete ${milestone.title}`,
      criteria: milestone.deliverables || ['Complete all tasks'],
      estimatedHours: milestone.estimatedHours || 4
    }));
    
    return {
      prerequisites,
      checkpoints,
      skillGaps: skillGaps.map(gap => ({
        skill: gap,
        exercises: ['Complete related coding exercises', 'Build a small project']
      }))
    };
  }

  // Automated code review
  async reviewCode(code, language, projectContext, milestoneContext) {
    if (!this.openai) {
      // Return basic review without AI
      return this.getBasicCodeReview(code, language);
    }

    const prompt = `Review this ${language} code for the ${milestoneContext?.title || 'project'} milestone:

\`\`\`${language}
${code}
\`\`\`

Evaluate on:
1. Correctness (does it work?)
2. Best practices (industry standards)
3. Security (vulnerabilities?)
4. Performance (efficiency?)
5. Maintainability (clean code?)

Provide:
- Overall score (0-100)
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (nice to have)

Format as JSON.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getBasicCodeReview(code, language);
    }
  }

  // Basic code review without AI
  getBasicCodeReview(code, language) {
    const issues = [];
    const warnings = [];
    const suggestions = [];
    
    // Basic checks
    if (!code || code.trim().length === 0) {
      issues.push('No code provided for review');
    }
    
    // Check for console.log statements (might want to remove in production)
    if (code.includes('console.log') && language !== 'javascript') {
      suggestions.push('Consider removing console.log statements before production');
    }
    
    // Check for TODO comments
    if (code.includes('TODO')) {
      warnings.push('Found TODO comments - make sure to address them');
    }
    
    // Basic score calculation
    let score = 100;
    score -= issues.length * 15;
    score -= warnings.length * 5;
    score -= suggestions.length * 2;
    score = Math.max(0, score);

    return {
      score,
      criticalIssues: issues,
      warnings,
      suggestions,
      refactoredCode: null
    };
  }

  // Architecture decision helper
  async recommendArchitecture(decisionContext, constraints = []) {
    if (!this.anthropic) {
      return this.getBasicArchitectureRecommendation(decisionContext);
    }

    const prompt = `Given this architecture decision:
${JSON.stringify(decisionContext, null, 2)}

Constraints: ${constraints.join(', ')}

Recommend:
1. Best approach with justification
2. Trade-offs of each option
3. Implementation steps`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      });

      return {
        recommendation: response.content[0].text,
        decisionMatrix: this.extractDecisionMatrix(response.content[0].text)
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      return this.getBasicArchitectureRecommendation(decisionContext);
    }
  }

  // Basic architecture recommendation without AI
  getBasicArchitectureRecommendation(decisionContext) {
    return {
      recommendation: 'Consider using a modular architecture with clear separation of concerns. Start simple and iterate.',
      decisionMatrix: {
        'Monolithic': { pros: ['Simpler to develop', 'Easier to deploy'], cons: ['Harder to scale', 'Tight coupling'] },
        'Microservices': { pros: ['Scalable', 'Independent deployment'], cons: ['Complex to manage', 'Network overhead'] }
      }
    };
  }

  // Parse AI response into structured format
  parseAIResponse(content) {
    const sections = content.split('\n\n');
    return {
      progressAssessment: this.extractNumber(content, /progress[:\s]*(\d+)/i) || 50,
      nextSteps: this.extractList(sections, 'Next Steps'),
      codeReview: this.extractSection(sections, 'Code Review'),
      resources: this.extractList(sections, 'Resources'),
      pitfalls: this.extractList(sections, 'Pitfalls'),
      rawResponse: content,
      insights: {
        summary: this.extractSection(sections, 'Summary') || content.substring(0, 200),
        warnings: this.extractList(sections, 'Warning') || [],
        recommendations: this.extractList(sections, 'Recommendation') || []
      }
    };
  }

  // Extract code blocks from text
  extractCodeBlocks(text) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({ language: match[1] || 'text', code: match[2] });
    }
    return blocks;
  }

  // Calculate confidence based on response characteristics
  calculateConfidence(text) {
    const hasCode = text.includes('```');
    const hasExplanation = text.length > 200;
    const hasWarnings = text.toLowerCase().includes('warning') || text.toLowerCase().includes('caution');
    
    let score = 0.7;
    if (hasCode) score += 0.1;
    if (hasExplanation) score += 0.1;
    if (hasWarnings) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  // Extract section from parsed content
  extractSection(sections, keyword) {
    const section = sections.find(s => s.toLowerCase().includes(keyword.toLowerCase()));
    return section ? section.replace(new RegExp(`${keyword}:?`, 'i'), '').trim() : '';
  }

  // Extract list items from section
  extractList(sections, keyword) {
    const section = this.extractSection(sections, keyword);
    if (!section) return [];
    return section.split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
      .map(line => line.replace(/^[\s\d\-\*\.]+/, '').trim());
  }

  // Extract number from text
  extractNumber(text, regex) {
    const match = text.match(regex);
    return match ? parseInt(match[1]) : null;
  }

  // Extract decision matrix from text
  extractDecisionMatrix(text) {
    const lines = text.split('\n');
    const matrix = {};
    let currentOption = null;
    
    lines.forEach(line => {
      if (line.includes('Option') || line.includes('Approach')) {
        currentOption = line.split(':')[0].trim();
        matrix[currentOption] = { pros: [], cons: [] };
      }
      if (line.includes('Pros:') && currentOption) {
        matrix[currentOption].pros.push(line.replace('Pros:', '').trim());
      }
      if (line.includes('Cons:') && currentOption) {
        matrix[currentOption].cons.push(line.replace('Cons:', '').trim());
      }
    });
    
    return matrix;
  }

  // Basic coding response without AI
  getBasicCodingResponse(query) {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('error') || queryLower.includes('bug')) {
      return "I'd recommend checking the error message carefully. Common approaches include:\n1. Check the stack trace for the exact line of the error\n2. Verify all variables are defined before use\n3. Check for typos in function names and variable names\n4. Make sure you're using the correct data types";
    }
    
    if (queryLower.includes('how to') || queryLower.includes('tutorial')) {
      return "Here are some general steps:\n1. Break down the problem into smaller parts\n2. Start with the simplest implementation\n3. Test each part individually\n4. Refactor as needed for better code quality";
    }
    
    return "I'm here to help with your coding questions! Please provide more details about what you're working on, including any error messages or code snippets if applicable.";
  }
}

module.exports = new AIGuidanceService();

