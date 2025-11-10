import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Team } from '../models/Team.js';
import { Hackathon } from '../models/Hackathon.js';

dotenv.config();

// Usage: node server/scripts/backfill-team-createdBy.js
(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/hackathon';
    await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB || undefined });
    console.log('Connected to MongoDB');

    const teams = await Team.find({ $or: [ { createdBy: { $exists: false } }, { createdBy: null } ] });
    if (teams.length === 0) {
      console.log('No teams need backfilling.');
      process.exit(0);
    }

    let updated = 0;
    for (const team of teams) {
      try {
        const hackathon = await Hackathon.findById(team.hackathonId).select('organizerId createdBy');
        if (!hackathon) {
          console.warn(`Hackathon ${team.hackathonId} not found for team ${team._id}`);
          continue;
        }
        const organizerId = hackathon.organizerId?.toString() || hackathon.createdBy?.toString();
        if (!organizerId) {
          console.warn(`No organizer resolvable for hackathon ${hackathon._id}; skipping team ${team._id}`);
          continue;
        }
        team.createdBy = organizerId;
        await team.save();
        updated++;
        console.log(`Updated team ${team._id} with createdBy ${organizerId}`);
      } catch (err) {
        console.error('Error updating team', team._id, err.message);
      }
    }

    console.log(`Backfill complete. Updated ${updated} / ${teams.length} teams.`);
    process.exit(0);
  } catch (error) {
    console.error('Backfill script failed:', error);
    process.exit(1);
  }
})();
