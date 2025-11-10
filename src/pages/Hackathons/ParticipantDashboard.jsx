import React, { useState, useEffect } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { hackathonService } from '../../services/hackathonService';
import { useAuth } from '../../features/auth/hooks/useAuth';
import Navigation from '../../shared/components/Navigation';
import ParticipantTeamView from './components/ParticipantTeamView';
import HackathonDetailsModal from './components/HackathonDetailsModal';
import { isParticipantOnly } from '../../shared/utils/roles';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHackathon, setSelectedHackathon] = useState(null); // for team view
  const [detailHackathon, setDetailHackathon] = useState(null); // for read-only details modal

  useEffect(() => {
    if (user) {
      loadHackathons();
    }
  }, [user]);

  const loadHackathons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all hackathons where the user might be registered
      const response = await hackathonService.getAll();
      setHackathons(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading hackathons:', err);
      setError('Failed to load hackathons');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      upcoming: 'bg-blue-100 text-blue-800',
      'registration-open': 'bg-green-100 text-green-800',
      active: 'bg-yellow-100 text-yellow-800',
      judging: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLocationTypeIcon = (type) => {
    const icons = {
      onsite: '📍',
      virtual: '💻',
      hybrid: '🌐'
    };
    return icons[type] || '📍';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
                <p className="text-gray-600 mb-6">
                  Please sign in to view your hackathon registrations and team assignments.
                </p>
                <Button>Sign In</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your hackathons...</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Hackathons</h1>
            <p className="text-gray-600 mt-2">
              View your hackathon registrations and team assignments
            </p>
          </div>

          {error && (
            <Card className="mb-6">
              <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <Button
                  variant="outline"
                  onClick={loadHackathons}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {/* Selected Hackathon Team View */}
          {selectedHackathon && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Team Assignment - {selectedHackathon.name}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedHackathon(null)}
                >
                  Back to Hackathons
                </Button>
              </div>
              <ParticipantTeamView hackathon={selectedHackathon} />
            </div>
          )}

          {/* Hackathons List */}
          {!selectedHackathon && (
            <div>
              {hackathons.length === 0 ? (
                <Card>
                  <div className="p-8 text-center text-gray-500">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Hackathons Available</h3>
                    <p className="text-gray-600">
                      There are no hackathons available at the moment. Check back later!
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {hackathons.map((hackathon) => (
                    <Card key={hackathon._id} className="h-full flex flex-col">
                      <div className="flex-1 p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                            {hackathon.name}
                          </h3>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hackathon.status)}`}
                          >
                            {hackathon.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>

                        {/* Description */}
                        {hackathon.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {hackathon.description}
                          </p>
                        )}

                        {/* Event Details */}
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <span className="w-4 text-center mr-2">📅</span>
                            <span>
                              {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                            </span>
                          </div>
                          
                          {hackathon.location && (
                            <div className="flex items-center">
                              <span className="w-4 text-center mr-2">
                                {getLocationTypeIcon(hackathon.location?.type)}
                              </span>
                              <span className="capitalize">
                                {hackathon.location?.type === 'virtual' ? 'Virtual Event' : hackathon.location?.venue || hackathon.location?.type}
                              </span>
                            </div>
                          )}

                          {hackathon.maxParticipants && (
                            <div className="flex items-center">
                              <span className="w-4 text-center mr-2">👥</span>
                              <span>Max {hackathon.maxParticipants} participants</span>
                            </div>
                          )}

                          {hackathon.maxTeamSize && (
                            <div className="flex items-center">
                              <span className="w-4 text-center mr-2">🏷️</span>
                              <span>Team size: {hackathon.maxTeamSize}</span>
                            </div>
                          )}
                        </div>

                        {/* Registration Info */}
                        {hackathon.registrationDeadline && (
                          <div className="text-xs text-gray-500 mb-3">
                            Registration deadline: {formatDate(hackathon.registrationDeadline)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="border-t p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            {hackathon.status === 'registration-open' && (
                              <span className="text-green-600 font-medium">Registration Open</span>
                            )}
                            {['active', 'judging'].includes(hackathon.status) && (
                              <span className="text-blue-600 font-medium">Event In Progress</span>
                            )}
                            {hackathon.status === 'completed' && (
                              <span className="text-gray-600 font-medium">Event Completed</span>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedHackathon(hackathon)}
                          >
                            Team Info
                          </Button>
                        </div>
                        {isParticipantOnly(user) && (
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => setDetailHackathon(hackathon)}
                            >
                              View Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {detailHackathon && (
        <HackathonDetailsModal
          hackathon={detailHackathon}
          onClose={() => setDetailHackathon(null)}
        />
      )}
    </div>
  );
};

export default ParticipantDashboard;