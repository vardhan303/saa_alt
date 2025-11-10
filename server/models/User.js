import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema({
  value: { type: String },
  type: { type: String }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  googleId: { type: String, index: true, unique: true },
  displayName: String,
  emails: [EmailSchema],
  photo: String,
  // Authorization roles for platform capabilities
  roles: { type: [String], default: ['participant'], index: true },
  // Pending role requests (simple string list for now)
  roleRequests: { type: [String], default: [] },
  // Extended academic profile fields
  university: { type: String, trim: true },
  currentSem: { type: String, trim: true },
  currentCGPA: { type: Number, min: 0, max: 10 }, // assuming 10 point scale
  universityEmail: { type: String, trim: true, lowercase: true },
  lastLoginAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.index({ createdAt: -1 });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
