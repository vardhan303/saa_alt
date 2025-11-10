import mongoose from 'mongoose';

const ScheduleItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['kickoff', 'hacking', 'meals', 'demos', 'judging', 'awards', 'workshop', 'networking', 'other'],
    required: true 
  },
  description: String,
  location: String, // Optional specific location for this item
}, { _id: false });

const LocationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['onsite', 'virtual', 'hybrid'], 
    required: true 
  },
  venue: String, // Physical venue name/address
  meetingUrl: String, // Virtual meeting link
  timezone: { type: String, default: 'UTC' }, // IANA timezone
}, { _id: false });

const OrganizerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  organization: String,
}, { _id: false });

const HackathonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  theme: String, // Single theme for simplicity
  
  // Dates
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: Date,
  submissionDeadline: Date,
  
  // Status management
  status: { 
    type: String, 
    enum: ['draft', 'upcoming', 'registration-open', 'active', 'judging', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Location and logistics
  location: { type: LocationSchema, required: true },
  
  // Team and participation limits
  maxTeamSize: { type: Number, default: 4, min: 1, max: 10 },
  maxTeams: { type: Number, required: true, min: 1 }, // Required: number of teams
  // maxParticipants will be derived as maxTeamSize * maxTeams (no persistence)
  
  // Registration settings
  registrationRequired: { type: Boolean, default: true },
  approvalRequired: { type: Boolean, default: false }, // Manual approval of participants
  
  // Organizer information
  organizer: { type: OrganizerSchema, required: true },
  
  // Event schedule
  schedule: [ScheduleItemSchema],
  
  // Features and settings
  allowTeamFormation: { type: Boolean, default: true },
  allowLateSubmissions: { type: Boolean, default: false },
  publicResults: { type: Boolean, default: true },
  
  // Prizes and recognition
  prizes: [{
    title: String, // "1st Place", "Best Use of API", etc.
    description: String,
    value: String, // "$1000", "Laptop", etc.
  }],
  
  // Administrative
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
HackathonSchema.index({ status: 1, startDate: 1 });
HackathonSchema.index({ createdBy: 1 });
HackathonSchema.index({ 'location.type': 1 });

// Virtual fields
HackathonSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startDate && now <= this.endDate;
});

HackathonSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return ['draft', 'upcoming', 'registration-open'].includes(this.status) && now < this.startDate;
});

HackathonSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)); // days
});

// Derived participant capacity
HackathonSchema.virtual('maxParticipants').get(function() {
  if (typeof this.maxTeamSize !== 'number' || typeof this.maxTeams !== 'number') return undefined;
  return this.maxTeamSize * this.maxTeams;
});

// Pre-save middleware
HackathonSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Validation: endDate must be after startDate
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  // Auto-set submission deadline if not provided (24 hours before end)
  if (!this.submissionDeadline && this.endDate) {
    this.submissionDeadline = new Date(this.endDate.getTime() - (24 * 60 * 60 * 1000));
  }
  
  next();
});

// Instance methods
HackathonSchema.methods.canRegister = function() {
  const now = new Date();
  return this.status === 'registration-open' && 
         (!this.registrationDeadline || now <= this.registrationDeadline);
};

HackathonSchema.methods.canSubmit = function() {
  const now = new Date();
  return ['active', 'judging'].includes(this.status) && 
         (!this.submissionDeadline || now <= this.submissionDeadline || this.allowLateSubmissions);
};

// Static methods
HackathonSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ startDate: 1 });
};

HackathonSchema.statics.findUpcoming = function() {
  return this.find({ 
    status: { $in: ['upcoming', 'registration-open'] },
    startDate: { $gt: new Date() }
  }).sort({ startDate: 1 });
};

export const Hackathon = mongoose.models.Hackathon || mongoose.model('Hackathon', HackathonSchema);