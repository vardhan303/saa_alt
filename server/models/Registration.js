import mongoose from 'mongoose';

const RegistrationSchema = new mongoose.Schema({
  // Participant information
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Hackathon information
  hackathonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hackathon', 
    required: true 
  },
  
  // Registration status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'attended'],
    default: 'pending'
  },
  
  // Registration details
  registrationDate: { 
    type: Date, 
    default: Date.now 
  },
  
  // Additional registration information
  motivation: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  
  skillsAndExperience: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  
  teamPreferences: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Dietary restrictions, accessibility needs, etc.
  specialRequirements: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Contact information (additional to user profile)
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Registration metadata
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvedAt: Date,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure one registration per user per hackathon
RegistrationSchema.index({ userId: 1, hackathonId: 1 }, { unique: true });

// Other indexes for performance
RegistrationSchema.index({ hackathonId: 1, status: 1 });
RegistrationSchema.index({ userId: 1 });
RegistrationSchema.index({ status: 1 });
RegistrationSchema.index({ registrationDate: 1 });

// Virtual fields
RegistrationSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

RegistrationSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

RegistrationSchema.virtual('canParticipate').get(function() {
  return ['approved', 'attended'].includes(this.status);
});

// Pre-save middleware
RegistrationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set approval timestamp when status changes to approved
  if (this.isModified('status') && this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = new Date();
  }
  
  next();
});

// Instance methods
RegistrationSchema.methods.approve = function(approvedBy) {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

RegistrationSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

RegistrationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

RegistrationSchema.methods.markAttended = function() {
  this.status = 'attended';
  return this.save();
};

// Static methods
RegistrationSchema.statics.findByHackathon = function(hackathonId, status = null) {
  const query = { hackathonId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('userId', 'name email displayName university currentSem')
    .populate('approvedBy', 'name email displayName')
    .sort({ registrationDate: 1 });
};

RegistrationSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .populate('hackathonId', 'name startDate endDate status location')
    .populate('approvedBy', 'name email displayName')
    .sort({ registrationDate: -1 });
};

RegistrationSchema.statics.getParticipants = function(hackathonId) {
  return this.find({ 
    hackathonId, 
    status: { $in: ['approved', 'attended'] } 
  })
    .populate('userId', 'name email displayName university currentSem')
    .sort({ registrationDate: 1 });
};

RegistrationSchema.statics.getRegistrationStats = function(hackathonId) {
  return this.aggregate([
    { $match: { hackathonId: mongoose.Types.ObjectId(hackathonId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Validation: Check if hackathon allows registration
RegistrationSchema.pre('validate', async function(next) {
  if (this.isNew) {
    try {
      const hackathon = await mongoose.model('Hackathon').findById(this.hackathonId);
      
      if (!hackathon) {
        return next(new Error('Hackathon not found'));
      }
      
      // Check if registration is still open
      if (!hackathon.canRegister()) {
        return next(new Error('Registration is closed for this hackathon'));
      }
      
  // Check capacity limits (maxParticipants is now a virtual: maxTeamSize * maxTeams)
  if (hackathon.maxParticipants) {
        const currentParticipants = await this.constructor.countDocuments({
          hackathonId: this.hackathonId,
          status: { $in: ['approved', 'attended'] }
        });
        
        if (currentParticipants >= hackathon.maxParticipants) {
          return next(new Error('Hackathon has reached maximum participant capacity'));
        }
      }
      
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export const Registration = mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);