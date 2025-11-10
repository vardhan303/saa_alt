import express from 'express';
import { Team } from '../models/Team.js';
import { Registration } from '../models/Registration.js';
import { Hackathon } from '../models/Hackathon.js';
import jwt from 'jsonwebtoken';

// Helper to resolve organizer id consistently
const getOrganizerId = (hackathon) => {
  if (!hackathon) return undefined;
  return hackathon.organizerId?.toString() || hackathon.createdBy?.toString();
};

const router = express.Router();

// Middleware to authenticate user
const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      ...decoded,
      id: decoded.sub || decoded.googleId || decoded.id || decoded._id
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// GET /api/teams/me - Get all teams for current user (participant view)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const teams = await Team.findByMember(userId);
    res.json({
      success: true,
      data: teams,
      count: teams.length
    });
  } catch (error) {
    console.error('Error fetching my teams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch my teams'
    });
  }
});

// Middleware to check if user is organizer of the hackathon
const checkOrganizerAccess = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }
    const organizerId = getOrganizerId(hackathon);
    if (organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Only hackathon organizers can manage teams' });
    }
    req.hackathon = hackathon;
    next();
  } catch (error) {
    console.error('Error checking organizer access:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/teams/hackathon/:hackathonId - Get all teams for a hackathon
router.get('/hackathon/:hackathonId', authenticateToken, checkOrganizerAccess, async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    const teams = await Team.findByHackathon(hackathonId);
    
    res.json({
      success: true,
      data: teams,
      count: teams.length
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch teams' 
    });
  }
});


// GET /api/teams/hackathon/:hackathonId/participants - Get available participants for team assignment
router.get('/hackathon/:hackathonId/participants', authenticateToken, async (req, res) => {
  try {
    const { hackathonId } = req.params;

    // Inline organizer authorization (replaces checkOrganizerAccess middleware)
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }
    const organizerId = getOrganizerId(hackathon);
    if (organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Only hackathon organizers can view participants' });
    }

    // Get all approved participants
    const participants = await Registration.getParticipants(hackathonId);

    // Get all team members to exclude assigned participants
    const teams = await Team.find({ hackathonId });
    const assignedUserIds = new Set();

    teams.forEach(team => {
      team.members.forEach(member => {
        assignedUserIds.add(member.userId.toString());
      });
    });

    // Filter out already assigned participants
    const availableParticipants = participants.filter(registration =>
      !assignedUserIds.has(registration.userId._id.toString())
    );

    res.json({
      success: true,
      data: {
        available: availableParticipants,
        assigned: participants.length - availableParticipants.length,
        total: participants.length
      }
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch participants'
    });
  }
});

// POST /api/teams/hackathon/:hackathonId/group - Auto-group participants into teams
router.post('/hackathon/:hackathonId/group', authenticateToken, async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }
    const organizerId = getOrganizerId(hackathon);
    if (organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Only hackathon organizers can group participants' });
    }

    const maxTeamSize = hackathon.maxTeamSize;
    const maxTeams = hackathon.maxTeams;

    // Fetch approved participants
    const participants = await Registration.getParticipants(hackathonId);
    if (participants.length === 0) {
      return res.status(400).json({ message: 'No approved participants to group' });
    }

    // Determine participants not already assigned
    const existingTeams = await Team.find({ hackathonId });
    const assignedUserIds = new Set();
    existingTeams.forEach(team => {
      team.members.forEach(m => assignedUserIds.add(m.userId.toString()));
    });

    const unassigned = participants.filter(p => !assignedUserIds.has(p.userId._id.toString()));
    if (unassigned.length === 0) {
      return res.status(200).json({ success: true, message: 'All participants already assigned', data: existingTeams });
    }

    // Shuffle unassigned for fairness
    for (let i = unassigned.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unassigned[i], unassigned[j]] = [unassigned[j], unassigned[i]];
    }

    // Calculate how many new teams we can create without exceeding maxTeams
    const remainingTeamSlots = maxTeams - existingTeams.length;
    if (remainingTeamSlots <= 0) {
      return res.status(400).json({ message: 'Maximum number of teams already created' });
    }

    const newTeams = [];
    let cursor = 0;
    for (let t = 0; t < remainingTeamSlots && cursor < unassigned.length; t++) {
      const slice = unassigned.slice(cursor, cursor + maxTeamSize);
      cursor += slice.length;
      if (slice.length === 0) break;
      const teamDoc = new Team({
        name: `Team ${existingTeams.length + newTeams.length + 1}`,
        description: 'Auto-generated team',
        hackathonId,
        createdBy: organizerId,
        members: slice.map((reg, idx) => ({ userId: reg.userId._id, role: idx === 0 ? 'leader' : 'member' }))
      });
      await teamDoc.save();
      newTeams.push(teamDoc);
    }

    // Populate new teams for response
    await Promise.all(newTeams.map(t => t.populate('members.userId', 'name email displayName university currentSem')));

    res.json({
      success: true,
      message: 'Participants grouped into teams',
      data: {
        created: newTeams.length,
        remainingUnassigned: unassigned.length - (cursor),
        teams: [...existingTeams, ...newTeams]
      }
    });
  } catch (error) {
    console.error('Error grouping participants:', error);
    res.status(500).json({ success: false, message: 'Failed to group participants' });
  }
});

// PUT /api/teams/:teamId/submission - Update team submission
router.put('/:teamId/submission', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, description, repoUrl, demoUrl, technologies } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is a team member
    if (!team.isMember(userId)) {
      return res.status(403).json({ message: 'Only team members can update submissions' });
    }

    // Update submission
    team.submission = {
      title: title?.trim() || '',
      description: description?.trim() || '',
      repoUrl: repoUrl?.trim() || '',
      demoUrl: demoUrl?.trim() || '',
      technologies: technologies || [],
      submittedAt: new Date(),
      isSubmitted: !!(title?.trim() && description?.trim())
    };

    await team.save();

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: team.submission
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission'
    });
  }
});

// GET /api/teams/:teamId/submission - Get team submission
router.get('/:teamId/submission', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is a team member or organizer/judge
    const isTeamMember = team.isMember(userId);
    const hackathon = await Hackathon.findById(team.hackathonId);
    const isOrganizer = hackathon && getOrganizerId(hackathon) === userId;
    // TODO: Add judge check when judge assignments are implemented

    if (!isTeamMember && !isOrganizer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: team.submission || {}
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission'
    });
  }
});

export default router;