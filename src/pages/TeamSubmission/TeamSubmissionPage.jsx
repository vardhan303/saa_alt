import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import Navigation from '../../shared/components/Navigation';
import TeamSubmission from '../Hackathons/components/TeamSubmission';
import { Card, Button, OrbitProgress } from '../../shared/ui';
import teamService from '../../services/teamService';

const TeamSubmissionPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth?.() ?? {};
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && teamId) {
      loadTeam();
    }
  }, [user, teamId]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      // Get user's teams and find the specific team
      const teams = await teamService.getMyTeams();
      const foundTeam = teams.find(t => t._id === teamId);
      
      if (!foundTeam) {
        setError('Team not found or you do not have access to this team');
        return;
      }
      
      setTeam(foundTeam);
    } catch (err) {
      setError('Failed to load team information');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <OrbitProgress variant="track-disc" speedPlus="-3" easing="ease-in-out" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Card className="max-w-md">
          <Card.Content>
            <p className="text-center text-text-muted">Please log in to access team submissions</p>
          </Card.Content>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg">
        <Navigation />
        <div className="pt-20 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <Card.Content>
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => navigate('/profile')}>
                    Back to Profile
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-bg">
        <Navigation />
        <div className="pt-20 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <Card.Content>
                <p className="text-center text-text-muted">Team not found</p>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navigation />
      <div className="pt-20 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/profile')}
              className="mb-4"
            >
              ← Back to Profile
            </Button>
          </div>
          
          <TeamSubmission 
            team={team} 
            onClose={() => navigate('/profile')}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamSubmissionPage;