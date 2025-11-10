import express from 'express';
import { Registration } from '../models/Registration.js';
import { Hackathon } from '../models/Hackathon.js';
import { verifyJwt } from '../utils/jwt.js';
import { emitRegistrationCreated, emitRegistrationUpdated } from '../socket.js';

const router = express.Router();

// Auth middleware (reuse jwt cookie logic)
const authenticateToken = (req, res, next) => {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ message: 'Access token required' });
  const decoded = verifyJwt(token);
  if (!decoded) return res.status(403).json({ message: 'Invalid token' });
  req.user = { ...decoded, id: decoded.sub || decoded.googleId || decoded.id || decoded._id };
  next();
};

// Helper to check if user is hackathon owner/organizer
async function isHackathonOwnerOrOrganizer(user, hackathon) {
  if (!user || !hackathon) return false;
  const userRoles = Array.isArray(user.roles) ? user.roles : [];
  const isOwner = hackathon.createdBy?.toString() === user.id;
  const isOrganizer = userRoles.includes('organizer');
  return isOwner || isOrganizer;
}

// GET /api/registrations?hackathonId=...&status=pending - list registrations for a hackathon (creator/organizer)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { hackathonId, status } = req.query;
    if (!hackathonId) return res.status(400).json({ message: 'hackathonId required' });
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    // Only allow owner/organizer to view
    const canModerate = await isHackathonOwnerOrOrganizer(req.user, hackathon);
    if (!canModerate) return res.status(403).json({ message: 'Not authorized to view registrations' });
    const query = { hackathonId };
    if (status) query.status = status;
    const regs = await Registration.find(query)
      .populate('userId', 'name email displayName university currentSem')
      .sort({ registrationDate: 1 });
    res.json(regs);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/registrations/:hackathonId - create a registration request
router.post('/:hackathonId', authenticateToken, async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { motivation, skillsAndExperience, teamPreferences, specialRequirements } = req.body || {};


    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

    // Debug log for registration status
    console.log('[REGISTRATION DEBUG]', {
      hackathonId,
      status: hackathon.status,
      registrationDeadline: hackathon.registrationDeadline,
      now: new Date(),
      canRegister: hackathon.canRegister()
    });

    if (!hackathon.canRegister()) {
      return res.status(400).json({ message: 'Registration is closed for this hackathon', debug: {
        status: hackathon.status,
        registrationDeadline: hackathon.registrationDeadline,
        now: new Date(),
        canRegister: hackathon.canRegister()
      }});
    }

    // Prevent duplicate registration
    const existing = await Registration.findOne({ userId: req.user.id, hackathonId });
    if (existing) return res.status(200).json(existing); // idempotent

  const registration = new Registration({
      userId: req.user.id,
      hackathonId,
      motivation,
      skillsAndExperience,
      teamPreferences,
      specialRequirements
    });
    await registration.save();
    // Emit socket.io event to hackathon creator/organizer rooms
    emitRegistrationCreated(hackathonId, registration);
    res.status(201).json(registration);
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH /api/registrations/:id/status - approve or reject (owner/organizer)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved','rejected','cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status transition' });
    }
    const registration = await Registration.findById(id);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    const hackathon = await Hackathon.findById(registration.hackathonId);
    if (!hackathon) return res.status(404).json({ message: 'Related hackathon not found' });
    const canModerate = await isHackathonOwnerOrOrganizer(req.user, hackathon);
    if (!canModerate) return res.status(403).json({ message: 'Not authorized to manage registrations' });
    registration.status = status;
    if (status === 'approved') {
      registration.approvedBy = req.user.id;
      registration.approvedAt = new Date();
    }
    await registration.save();
    // Emit socket.io event to hackathon creator/organizer and affected user
    emitRegistrationUpdated(registration.hackathonId, registration.userId, registration);
    res.json(registration);
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/registrations/me/:hackathonId - get current user's registration for hackathon
router.get('/me/:hackathonId', authenticateToken, async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const registration = await Registration.findOne({ userId: req.user.id, hackathonId });
    if (!registration) return res.status(404).json({ message: 'No registration found' });
    res.json(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;