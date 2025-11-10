import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { useAuth } from '../../../features/auth/hooks/useAuth';

const ParticipantTeamView = ({ hackathon }) => {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      locked: 'bg-blue-100 text-blue-800',
      disbanded: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('registered');
  
  const isTeamLeader = team && user && team.members?.some(member => 
    member.userId?._id === user.id && member.role === 'leader'
  );

  useEffect(() => {
    if (hackathon?._id && user) {
      loadTeamInfo();
    }
  }, [hackathon?._id, user]);

  const loadTeamInfo = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch(`/api/teams/participant/${hackathon._id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
          // User not registered or no team assigned
          setTeam(null);
          setLoading(false);
          return;
        }
        throw new Error('Failed to load team information');
      }
      
      const result = await response.json();
      setTeam(result.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading team info:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading team information...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading team information: {error}</p>
            <Button
              variant="outline"
              onClick={loadTeamInfo}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Tab UI
  const tabClass = (tab) =>
    `px-4 py-2 rounded-t-lg font-medium text-sm focus:outline-none transition-colors ${
      activeTab === tab
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
    }`;

  return (
    <Card>
      <div className="p-6">
        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            className={tabClass('team')}
            onClick={() => setActiveTab('team')}
            type="button"
          >
            Team Assignment
          </button>
          <button
            className={tabClass('registered')}
            onClick={() => setActiveTab('registered')}
            type="button"
          >
            Registered
          </button>
        </div>

        {/* Registered Tab */}
        {activeTab === 'registered' && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Registered Hackathon Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Name</div>
                <div className="font-medium text-gray-900">{hackathon?.name || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Dates</div>
                <div className="font-medium text-gray-900">
                  {hackathon?.startDate ? new Date(hackathon.startDate).toLocaleString() : 'N/A'} - 
                  {hackathon?.endDate ? new Date(hackathon.endDate).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Location</div>
                <div className="font-medium text-gray-900">{hackathon?.location?.type === 'virtual' ? 'Virtual Event' : hackathon?.location?.venue || 'Location information not available'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(hackathon?.status || 'unknown')}`}>
                  {hackathon?.status ? hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1) : 'Unknown'}
                </span>
              </div>
              {hackathon?.maxParticipants && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Max Participants</div>
                  <div className="font-medium text-gray-900">{hackathon.maxParticipants}</div>
                </div>
              )}
              {hackathon?.maxTeamSize && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Team Size</div>
                  <div className="font-medium text-gray-900">{hackathon.maxTeamSize}</div>
                </div>
              )}
              {hackathon?.description && (
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Description</div>
                  <div className="text-gray-800">{hackathon.description}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Team Assignment Tab */}
        {activeTab === 'team' && (
          team ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                  {team.description && (
                    <p className="text-gray-600 mt-1">{team.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(team.status)}`}>
                    {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                  </span>
                  {isTeamLeader && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      You are the Team Leader
                    </span>
                  )}
                </div>
              </div>

              {/* Team Members */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Team Members ({team.members?.length || 0})
                </h4>
                {team.members && team.members.length > 0 ? (
                  <div className="space-y-3">
                    {team.members.map((member) => (
                      <div 
                        key={member.userId._id} 
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          member.userId._id === user.id 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {(member.userId.displayName || member.userId.name || '').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.userId.displayName || member.userId.name}
                              {member.userId._id === user.id && <span className="text-blue-600 ml-2">(You)</span>}
                            </p>
                            <p className="text-sm text-gray-600">{member.userId.email}</p>
                            {member.userId.university && (
                              <p className="text-xs text-gray-500">{member.userId.university}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {member.role === 'leader' && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full mb-1">
                              Leader
                            </span>
                          )}
                          {member.userId.currentSem && (
                            <span className="text-xs text-gray-500">
                              Sem {member.userId.currentSem}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No team members assigned yet.</p>
                )}
              </div>

              {/* Team Status Information */}
              <div className="border-t pt-4 mt-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Team Status Information</h5>
                  <div className="text-sm text-blue-800">
                    {team.status === 'draft' && (
                      <p>🔄 Your team is in draft mode. The organizer is still finalizing the team composition.</p>
                    )}
                    {team.status === 'active' && (
                      <p>✅ Your team is active and ready for the hackathon! Start collaborating with your teammates.</p>
                    )}
                    {team.status === 'locked' && (
                      <p>🔒 Your team composition is locked. No changes can be made to team membership.</p>
                    )}
                    {team.status === 'disbanded' && (
                      <p>❌ This team has been disbanded. Please contact the organizer for more information.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {isTeamLeader && team.status === 'active' && (
                <div className="border-t pt-4 mt-4">
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-900 mb-2">💡 Team Leader Tips</h5>
                    <div className="text-sm text-yellow-800 space-y-1">
                      <p>• Coordinate with your team members before the hackathon starts</p>
                      <p>• Plan your project idea and divide responsibilities</p>
                      <p>• Exchange contact information for better communication</p>
                      <p>• Make sure everyone understands the hackathon rules and timeline</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 text-center">
              <div className="text-gray-500">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Assigned Yet</h3>
                <p className="text-gray-600">
                  You haven&apos;t been assigned to a team for this hackathon yet. 
                  The organizer will assign teams before the event starts.
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </Card>
  );
};

export default ParticipantTeamView;