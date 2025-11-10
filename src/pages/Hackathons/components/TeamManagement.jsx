import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';

const TeamManagement = ({ hackathon, onClose }) => {
  const [teams, setTeams] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Remove manual team creation/member assignment state

  useEffect(() => {
    if (hackathon?._id) {
      loadTeams();
      loadParticipants();
    }
  }, [hackathon?._id]);

  const loadTeams = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/teams/hackathon/${hackathon._id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load teams');
      }
      
      const result = await response.json();
      setTeams(result.data || []);
    } catch (err) {
      console.error('Error loading teams:', err);
      setError('Failed to load teams');
    }
  };

  const loadParticipants = async () => {
    try {
      const response = await fetch(`/api/teams/hackathon/${hackathon._id}/participants`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load participants');
      }
      
      const result = await response.json();
      setParticipants(result.data || { available: [], assigned: 0, total: 0 });
      setLoading(false);
    } catch (err) {
      console.error('Error loading participants:', err);
      setError('Failed to load participants');
      setLoading(false);
    }
  };

  // Remove manual team creation/member assignment handlers
  // New: Group Participants handler
  const [grouping, setGrouping] = useState(false);
  const handleGroupParticipants = async () => {
    setGrouping(true);
    setError(null);
    try {
      const response = await fetch(`/api/teams/hackathon/${hackathon._id}/group`, {
        method: 'POST',
        credentials: 'include'
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to group participants');
      }
      await loadTeams();
      await loadParticipants();
    } catch (err) {
      setError(err.message);
    } finally {
      setGrouping(false);
    }
  };
// ...existing code...

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading team information...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
              <p className="text-gray-600">{hackathon?.name}</p>
            </div>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Participants Summary */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <Card>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{participants.total || 0}</div>
                <div className="text-sm text-gray-600">Total Participants</div>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{participants.assigned || 0}</div>
                <div className="text-sm text-gray-600">Assigned to Teams</div>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{participants.available?.length || 0}</div>
                <div className="text-sm text-gray-600">Available for Assignment</div>
              </div>
            </Card>
          </div>

          {/* Group Participants Button */}
          <div className="mb-6 flex justify-end">
            <Button onClick={handleGroupParticipants} disabled={grouping}>
              {grouping ? 'Grouping...' : 'Group Participants'}
            </Button>
          </div>

          {/* Teams List */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Teams ({teams.length})</h3>
          {teams.length === 0 ? (
            <div>No teams created yet.</div>
          ) : (
            teams.map(team => (
              <Card key={team._id} className="mb-4">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-blue-700 text-lg">{team.name}</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        team.submission?.isSubmitted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {team.submission?.isSubmitted ? 'Submitted' : 'No Submission'}
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-600 mb-2">{team.description}</div>
                  {team.submission?.title && (
                    <div className="mb-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                      <div className="font-medium text-blue-800">Project: {team.submission.title}</div>
                      {team.submission.description && (
                        <div className="text-sm text-blue-600 mt-1">
                          {team.submission.description.substring(0, 150)}
                          {team.submission.description.length > 150 && '...'}
                        </div>
                      )}
                      <div className="flex gap-4 mt-2 text-xs">
                        {team.submission.repoUrl && (
                          <a 
                            href={team.submission.repoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Repository
                          </a>
                        )}
                        {team.submission.demoUrl && (
                          <a 
                            href={team.submission.demoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Demo
                          </a>
                        )}
                      </div>
                      {team.submission.technologies?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {team.submission.technologies.map((tech, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="font-medium mb-2">Members:</div>
                  <ul className="list-disc ml-6">
                    {team.members.map(member => (
                      <li key={member.userId._id}>
                        {member.userId.displayName || member.userId.name} ({member.role})
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default TeamManagement;