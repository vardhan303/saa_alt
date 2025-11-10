import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  // Team basic information
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  
  // Associated hackathon
  hackathonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hackathon', 
    required: true 
  },
  
  // Team members (references to User model)
  members: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    },
    joinedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  
  // Team status and management
  status: {
    type: String,
    enum: ['draft', 'active', 'locked', 'disbanded'],
    default: 'draft'
  },
  
  // Team leader (first member is typically the leader)
  leaderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  
  // Team formation metadata
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // Hackathon organizer who created the team
  
  // Project submission fields
  submission: {
    title: { type: String, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    repoUrl: { type: String, trim: true },        // GitHub/GitLab link
    demoUrl: { type: String, trim: true },        // Live demo or video
    technologies: [{ type: String, trim: true }], // Tech stack used
    submittedAt: { type: Date },
    isSubmitted: { type: Boolean, default: false }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
TeamSchema.index({ hackathonId: 1 });
TeamSchema.index({ 'members.userId': 1 });
TeamSchema.index({ createdBy: 1 });
TeamSchema.index({ status: 1 });

// Virtual fields
TeamSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

TeamSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Pre-save middleware
TeamSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set team leader if not set and members exist
  if (this.members && this.members.length > 0 && !this.leaderId) {
    this.leaderId = this.members[0].userId;
    this.members[0].role = 'leader';
  }
  
  next();
});

// Instance methods
TeamSchema.methods.addMember = function(userId, role = 'member') {
  // Check if user is already a member
  const existingMember = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this team');
  }
  
  // Add new member
  this.members.push({
    userId,
    role,
    joinedAt: new Date()
  });
  
  // Set as leader if first member
  if (this.members.length === 1) {
    this.leaderId = userId;
    this.members[0].role = 'leader';
  }
  
  return this.save();
};

TeamSchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.findIndex(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (memberIndex === -1) {
    throw new Error('User is not a member of this team');
  }
  
  const wasLeader = this.members[memberIndex].role === 'leader';
  this.members.splice(memberIndex, 1);
  
  // If leader was removed and team still has members, assign new leader
  if (wasLeader && this.members.length > 0) {
    this.members[0].role = 'leader';
    this.leaderId = this.members[0].userId;
  } else if (this.members.length === 0) {
    this.leaderId = null;
  }
  
  return this.save();
};

TeamSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString()
  );
};

TeamSchema.methods.isLeader = function(userId) {
  return this.leaderId && this.leaderId.toString() === userId.toString();
};

// Static methods
TeamSchema.statics.findByHackathon = function(hackathonId) {
  return this.find({ hackathonId })
    .populate('members.userId', 'name email displayName')
    .populate('leaderId', 'name email displayName')
    .populate('createdBy', 'name email displayName')
    .sort({ createdAt: 1 });
};

TeamSchema.statics.findByMember = function(userId) {
  return this.find({ 'members.userId': userId })
    .populate('hackathonId', 'name startDate endDate status')
    .populate('members.userId', 'name email displayName')
    .populate('leaderId', 'name email displayName')
    .sort({ createdAt: -1 });
};

TeamSchema.statics.findByOrganizer = function(organizerId) {
  return this.find({ createdBy: organizerId })
    .populate('hackathonId', 'name startDate endDate status')
    .populate('members.userId', 'name email displayName')
    .populate('leaderId', 'name email displayName')
    .sort({ createdAt: -1 });
};

// Validation: Ensure team size doesn't exceed hackathon limits
TeamSchema.pre('validate', async function(next) {
  if (this.isModified('members') || this.isNew) {
    try {
      const hackathon = await mongoose.model('Hackathon').findById(this.hackathonId);
      if (hackathon && this.members.length > hackathon.maxTeamSize) {
        return next(new Error(`Team size cannot exceed ${hackathon.maxTeamSize} members`));
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);