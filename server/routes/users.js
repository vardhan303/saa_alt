import { Router } from 'express';
import { verifyJwt } from '../utils/jwt.js';
import { User } from '../models/User.js';

const router = Router();

// Middleware to authenticate normal user via auth_token cookie
router.use(async (req, res, next) => {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = verifyJwt(token);
    req.userId = decoded.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Submit a role request
router.post('/request-role', async (req, res) => {
  try {
    const { role } = req.body || {};
    const allowed = ['creator', 'judge', 'organizer'];
    if (!role || !allowed.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.roleRequests) user.roleRequests = [];
    if (!user.roleRequests.includes(role)) {
      user.roleRequests.push(role);
      await user.save();
    }

    res.json({ ok: true, roleRequests: user.roleRequests });
  } catch (err) {
    console.error('Error requesting role:', err);
    res.status(500).json({ error: 'Failed to request role' });
  }
});

export default router;
