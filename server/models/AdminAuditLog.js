import mongoose from 'mongoose';

const AdminAuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // add-role, remove-role
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String },
  performedBy: { type: String, default: 'static-admin' }, // since we use static auth token
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

AdminAuditLogSchema.index({ createdAt: -1 });

export const AdminAuditLog = mongoose.models.AdminAuditLog || mongoose.model('AdminAuditLog', AdminAuditLogSchema);
