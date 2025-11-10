import { Router } from 'express';
import { User } from '../models/User.js';
import { AdminAuditLog } from '../models/AdminAuditLog.js';

const router = Router();

// Test endpoint to verify admin routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes are working!' });
});

// Get all users - admin only endpoint
router.get('/users', async (req, res) => {
  try {
    const adminAuth = req.headers.authorization;
    const expected = `Bearer ${process.env.ADMIN_API_TOKEN || 'admin-token'}`;
    if (!adminAuth || adminAuth !== expected) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    // Pagination params
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      User.countDocuments({}),
      User.find({})
        .select('displayName emails googleId createdAt lastLoginAt roles roleRequests')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    // Format the response to make it easier to display
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.displayName || 'Unknown',
      email: user.emails && user.emails.length > 0 ? user.emails[0].value : 'No email',
      googleId: user.googleId,
      roles: user.roles || ['participant'],
      roleRequests: user.roleRequests || [],
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }));

    res.json({
      users: formattedUsers,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Promote/add role to user
router.post('/users/:id/role', async (req, res) => {
  try {
    const adminAuth = req.headers.authorization;
    const expected = `Bearer ${process.env.ADMIN_API_TOKEN || 'admin-token'}`;
    if (!adminAuth || adminAuth !== expected) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const { id } = req.params;
    const { role } = req.body || {};
    const allowedRoles = ['participant', 'creator', 'judge', 'organizer'];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid or missing role' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.roles) user.roles = ['participant'];
    if (!user.roles.includes(role)) {
      user.roles.push(role);
      if (Array.isArray(user.roleRequests) && user.roleRequests.length) {
        user.roleRequests = user.roleRequests.filter(r => r !== role);
      }
      await user.save();
      await AdminAuditLog.create({ action: 'add-role', targetUser: user._id, role });
    }

    res.json({
      ok: true,
      user: {
        id: user._id,
        name: user.displayName,
        email: user.emails && user.emails.length ? user.emails[0].value : null,
        roles: user.roles,
        roleRequests: user.roleRequests || []
      }
    });
  } catch (err) {
    console.error('Error promoting user:', err);
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

export default router;

// Remove role from user (cannot remove participant)
router.delete('/users/:id/role', async (req, res) => {
  try {
    const adminAuth = req.headers.authorization;
    const expected = `Bearer ${process.env.ADMIN_API_TOKEN || 'admin-token'}`;
    if (!adminAuth || adminAuth !== expected) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const { id } = req.params;
    const { role } = req.body || {};
    if (!role) return res.status(400).json({ error: 'Role required' });
    if (role === 'participant') return res.status(400).json({ error: 'Cannot remove participant role' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.roles) user.roles = ['participant'];
    const before = user.roles.length;
    user.roles = user.roles.filter(r => r !== role);
    if (user.roles.length === before) {
      return res.json({ ok: true, unchanged: true, roles: user.roles });
    }
    await user.save();
    await AdminAuditLog.create({ action: 'remove-role', targetUser: user._id, role });

    res.json({ ok: true, roles: user.roles });
  } catch (err) {
    console.error('Error removing role:', err);
    res.status(500).json({ error: 'Failed to remove role' });
  }
});