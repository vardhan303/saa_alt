import express from 'express';
import { Hackathon } from '../models/Hackathon.js';
import { verifyJwt } from '../utils/jwt.js';

const router = express.Router();

// Middleware to verify JWT token (reusing the same logic as auth routes)
const authenticateToken = (req, res, next) => {
  const token = req.cookies?.auth_token;
  
  if (!token) {
    console.log('No auth_token cookie found');
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyJwt(token);
  if (!decoded) {
    console.log('JWT verification failed');
    return res.status(403).json({ message: 'Invalid token' });
  }

  // Ensure req.user.id is set, mimicking the frontend's approach
  req.user = {
    ...decoded,
    id: decoded.sub || decoded.googleId || decoded.id || decoded._id
  };
  
  console.log('Authenticated user:', req.user.id);
  next();
};

// GET /api/hackathons - Get all hackathons (public)
router.get('/', async (req, res) => {
  try {
    const { status, location_type, upcoming, active } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by location type
    if (location_type) {
      query['location.type'] = location_type;
    }
    
    // Convenience filters
    if (upcoming === 'true') {
      query.status = { $in: ['upcoming', 'registration-open'] };
      query.startDate = { $gt: new Date() };
    }
    
    if (active === 'true') {
      query.status = 'active';
    }
    
    const hackathons = await Hackathon.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 })
      .lean();
    
    res.json(hackathons);
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    
    // If it's a MongoDB connection error, return empty array instead of error
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      console.warn('MongoDB not available, returning empty hackathons array');
      return res.json([]);
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/hackathons/:id - Get single hackathon (public)
router.get('/:id', async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }
    
    res.json(hackathon);
  } catch (error) {
    console.error('Error fetching hackathon:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid hackathon ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper: check if user has any role in list
function userHasAnyRole(user, roles) {
  if (!user) return false;
  const userRoles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some(r => userRoles.includes(r));
}

// POST /api/hackathons - Create new hackathon (authenticated, role: creator|organizer)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!userHasAnyRole(req.user, ['creator','organizer'])) {
      return res.status(403).json({ message: 'Requires creator or organizer role to create hackathon' });
    }
    const {
      name,
      description,
      theme,
      startDate,
      endDate,
      registrationDeadline,
      submissionDeadline,
      location,
      maxTeamSize,
      maxTeams,
      maxParticipants,
      registrationRequired,
      approvalRequired,
      organizer,
      schedule,
      allowTeamFormation,
      allowLateSubmissions,
      publicResults,
      prizes
    } = req.body;
    
    // Validation
    if (!name || !description || !startDate || !endDate || !location || !organizer) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, description, startDate, endDate, location, organizer' 
      });
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    if (start <= new Date()) {
      return res.status(400).json({ message: 'Start date must be in the future' });
    }
    
    // Create hackathon
    const hackathon = new Hackathon({
      name: name.trim(),
      description: description.trim(),
      theme,
      startDate: start,
      endDate: end,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : null,
      location,
      maxTeamSize: maxTeamSize || 4,
      maxTeams,
      maxParticipants,
      registrationRequired: registrationRequired !== false,
      approvalRequired: approvalRequired === true,
      organizer,
      schedule: schedule || [],
      allowTeamFormation: allowTeamFormation !== false,
      allowLateSubmissions: allowLateSubmissions === true,
      publicResults: publicResults !== false,
      prizes: prizes || [],
      createdBy: req.user.id
    });
    
    await hackathon.save();
    
    // Populate createdBy for response
    await hackathon.populate('createdBy', 'name email');
    
    res.status(201).json(hackathon);
  } catch (error) {
    console.error('Error creating hackathon:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/hackathons/:id - Update hackathon (authenticated, owner only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }
    
    // Authorization: owner OR organizer role
    const isOwner = hackathon.createdBy.toString() === req.user.id;
    const isOrganizer = userHasAnyRole(req.user, ['organizer']);
    if (!isOwner && !isOrganizer) {
      return res.status(403).json({ message: 'Not authorized to update this hackathon (owner or organizer required)' });
    }
    
    // Prevent updating certain fields if hackathon is active or completed
    if (['active', 'judging', 'completed'].includes(hackathon.status)) {
      const restrictedFields = ['startDate', 'endDate', 'maxTeamSize', 'maxTeams', 'maxParticipants'];
      const hasRestrictedUpdates = restrictedFields.some(field => Object.prototype.hasOwnProperty.call(req.body, field));
      
      if (hasRestrictedUpdates) {
        return res.status(400).json({ 
          message: 'Cannot modify core settings for active, judging, or completed hackathons' 
        });
      }
    }
    
    // Update fields
    const updateFields = [
      'name', 'description', 'theme', 'startDate', 'endDate', 
      'registrationDeadline', 'submissionDeadline', 'status',
      'location', 'maxTeamSize', 'maxTeams', 'maxParticipants',
      'registrationRequired', 'approvalRequired', 'organizer',
      'schedule', 'allowTeamFormation', 'allowLateSubmissions',
      'publicResults', 'prizes'
    ];
    
    updateFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        hackathon[field] = req.body[field];
      }
    });
    
    // Validate dates if updated
    if (hackathon.startDate && hackathon.endDate) {
      if (hackathon.endDate <= hackathon.startDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }
    
    await hackathon.save();
    await hackathon.populate('createdBy', 'name email');
    
    res.json(hackathon);
  } catch (error) {
    console.error('Error updating hackathon:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid hackathon ID format' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/hackathons/:id - Delete hackathon (authenticated, owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }
    
    // Authorization: owner OR organizer
    const isOwner = hackathon.createdBy.toString() === req.user.id;
    const isOrganizer = userHasAnyRole(req.user, ['organizer']);
    if (!isOwner && !isOrganizer) {
      return res.status(403).json({ message: 'Not authorized to delete this hackathon (owner or organizer required)' });
    }
    
    // Prevent deletion of active hackathons
    if (['active', 'judging'].includes(hackathon.status)) {
      return res.status(400).json({ 
        message: 'Cannot delete active or judging hackathons. Cancel them first.' 
      });
    }
    
    await Hackathon.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Hackathon deleted successfully' });
  } catch (error) {
    console.error('Error deleting hackathon:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid hackathon ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/hackathons/my/created - Get hackathons created by current user
router.get('/my/created', authenticateToken, async (req, res) => {
  try {
    const hackathons = await Hackathon.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(hackathons);
  } catch (error) {
    console.error('Error fetching user hackathons:', error);
    
    // If it's a MongoDB connection error, return empty array instead of error
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      console.warn('MongoDB not available, returning empty hackathons array');
      return res.json([]);
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH /api/hackathons/:id/status - Update hackathon status (authenticated, owner only)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['draft', 'upcoming', 'registration-open', 'active', 'judging', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const hackathon = await Hackathon.findById(req.params.id);
    
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }
    
    // Authorization: owner OR organizer
    const isOwner = hackathon.createdBy.toString() === req.user.id;
    const isOrganizer = userHasAnyRole(req.user, ['organizer']);
    if (!isOwner && !isOrganizer) {
      return res.status(403).json({ message: 'Not authorized to change status (owner or organizer required)' });
    }
    
    hackathon.status = status;
    await hackathon.save();
    
    res.json({ message: 'Status updated successfully', status: hackathon.status });
  } catch (error) {
    console.error('Error updating hackathon status:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid hackathon ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;