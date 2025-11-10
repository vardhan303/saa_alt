import React, { useState, useEffect } from 'react';
import { useSocket } from '../../features/auth/SocketProvider.jsx';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { hackathonService } from '../../services/hackathonService';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { canManageHackathons } from '../../shared/utils/roles.js';
import Navigation from '../../shared/components/Navigation';
import HackathonForm from './components/HackathonForm';
import Modal from '../../shared/ui/Modal.jsx';
import HackathonCard from './components/HackathonCard';
import TeamManagement from './components/TeamManagement';
import HackathonDetailsModal from './components/HackathonDetailsModal';
import RegistrationApprovals from './components/RegistrationApprovals';
import { registrationService } from '../../services/registrationService';

const HackathonManagement = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [filter, setFilter] = useState('all'); // all, my, upcoming, active
  const canManage = canManageHackathons(user);
  const [managingTeams, setManagingTeams] = useState(null);
  const [detailHackathon, setDetailHackathon] = useState(null);
  const [registrations, setRegistrations] = useState({}); // map hackathonId -> status
  const [registeringId, setRegisteringId] = useState(null);
  const [approvalsHackathon, setApprovalsHackathon] = useState(null);

  // Load hackathons based on current filter
  const loadHackathons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading hackathons with filter:', filter);
      console.log('User authenticated:', !!user, user?.id);
      
      let response;
      switch (filter) {
        case 'my':
          if (!user || !canManage) {
            console.warn('User not permitted to load my hackathons');
            setError(!user ? 'Please sign in to view your hackathons' : 'You need creator or organizer role');
            setHackathons([]);
            return;
          }
          response = await hackathonService.getMyHackathons();
          break;
        case 'upcoming':
          response = await hackathonService.getUpcoming();
          break;
        case 'active':
          response = await hackathonService.getActive();
          break;
        default:
          response = await hackathonService.getAll();
      }
      
      // Handle both wrapped and unwrapped responses
      const hackathonData = response.data || response || [];
      console.log('Raw API response:', response);
      console.log('Extracted hackathon data:', hackathonData);
      const list = Array.isArray(hackathonData) ? hackathonData : [];
      setHackathons(list);
      // Fetch current user's registration status for each hackathon (ignore errors)
      if (user) {
        const results = {};
        await Promise.all(list.map(async h => {
          try {
            const r = await registrationService.getMyForHackathon(h._id);
            results[h._id] = r.status;
          } catch (_) { /* no registration yet */ }
        }));
        setRegistrations(results);
      }
    } catch (err) {
      console.error('Error loading hackathons:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load hackathons');
      setHackathons([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  // Load hackathons when component mounts or filter changes
  useEffect(() => {
    loadHackathons();
  }, [filter]);

  // Socket.io event handling for real-time registration updates
  useEffect(() => {
    if (!socket || !user) return;

    // Registration created (for organizers)
    socket.on('registration:created', ({ registration }) => {
      // Optionally show notification or update approvals dashboard
      // For now, just reload hackathons if user manages this hackathon
      if (canManage && registration.hackathonId) {
        loadHackathons();
      }
    });

    // Registration updated (for participants and organizers)
    socket.on('registration:updated', ({ registration }) => {
      // If this is the current user, update their registration status
      if (registration.userId === user.id) {
        setRegistrations(prev => ({ ...prev, [registration.hackathonId]: registration.status }));
      }
      // If organizer, reload hackathons to update approvals
      if (canManage && registration.hackathonId) {
        loadHackathons();
      }
    });

    return () => {
      socket.off('registration:created');
      socket.off('registration:updated');
    };
  }, [socket, user, canManage]);

  const handleCreateHackathon = async (hackathonData) => {
    if (!user?.id) {
      alert('You must be signed in to create a hackathon.');
      return;
    }
    try {
      // Do NOT send createdBy, backend sets it from req.user.id
      await hackathonService.create(hackathonData);
      setShowCreateForm(false);
      await loadHackathons();
    } catch (err) {
      console.error('Error creating hackathon:', err);
      throw err; // Let form handle the error
    }
  };

  const handleUpdateHackathon = async (id, hackathonData) => {
    try {
      await hackathonService.update(id, hackathonData);
      setEditingHackathon(null);
      await loadHackathons();
    } catch (err) {
      console.error('Error updating hackathon:', err);
      throw err; // Let form handle the error
    }
  };

  const handleDeleteHackathon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hackathon? This action cannot be undone.')) {
      return;
    }

    try {
      await hackathonService.delete(id);
      await loadHackathons();
    } catch (err) {
      console.error('Error deleting hackathon:', err);
      alert(err.response?.data?.message || 'Failed to delete hackathon');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await hackathonService.updateStatus(id, newStatus);
      await loadHackathons(); // Reload from database to ensure consistency
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update hackathon status');
    }
  };

  const handleRegister = async (hackathon) => {
    if (!user) return alert('Sign in required');
    setRegisteringId(hackathon._id);
    try {
      const res = await registrationService.request(hackathon._id, {});
      setRegistrations(prev => ({ ...prev, [hackathon._id]: res.status }));
    } catch (err) {
      console.error('Registration error', err);
      alert(err.message || 'Failed to register');
    } finally {
      setRegisteringId(null);
    }
  };

  const canEdit = (hackathon) => {
    return user && hackathon && hackathon.createdBy && 
           (hackathon.createdBy._id === user.id || hackathon.createdBy === user.id);
  };

  const canDelete = (hackathon) => {
    return user && hackathon && hackathon.createdBy && 
           (hackathon.createdBy._id === user.id || hackathon.createdBy === user.id) && 
           !['active', 'judging'].includes(hackathon?.status || '');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bg">
        <Navigation />
        <div className="pt-20 py-8 px-4">
          <div className="container mx-auto">
            <Card className="text-center">
              <p className="text-gray-600 mb-4">Please sign in to manage hackathons.</p>
              <Button href="/auth/google">Sign In</Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Participant-only users: hide management features (force filter away from 'my')
  if (!canManage && filter === 'my') setFilter('all');

  return (
    <div className="min-h-screen bg-bg">
      <Navigation />
      <div className="pt-20 py-8 px-4">
        <div className="container mx-auto">
          {/* Filter tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {[
          { key: 'all', label: 'All Hackathons' },
          ...(canManage ? [{ key: 'my', label: 'My Hackathons' }] : []),
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'active', label: 'Active' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
              filter === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {/* Create/Edit Form Modal */}
      <Modal
        open={Boolean(showCreateForm || editingHackathon)}
        onClose={() => { setShowCreateForm(false); setEditingHackathon(null); }}
        title={editingHackathon ? 'Edit Hackathon' : 'Create New Hackathon'}
        size="full"
        className="max-h-[90vh] overflow-y-auto"
      >
        {(showCreateForm || editingHackathon) && (
          <HackathonForm
            hackathon={editingHackathon}
            onSubmit={editingHackathon ?
              (data) => handleUpdateHackathon(editingHackathon._id, data) :
              handleCreateHackathon
            }
            onCancel={() => {
              setShowCreateForm(false);
              setEditingHackathon(null);
            }}
            inModal
          />
        )}
      </Modal>

      {/* Hackathons List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading hackathons...</span>
        </div>
      ) : !hackathons || hackathons.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {filter === 'my' ? 'You haven\'t created any hackathons yet.' : 
             filter === 'upcoming' ? 'No upcoming hackathons found.' :
             filter === 'active' ? 'No active hackathons found.' :
             'No hackathons found.'}
          </p>
          {filter === 'my' && canManage && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Your First Hackathon
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hackathons && hackathons
            .filter(h => h && typeof h === 'object' && h._id)
            .map((hackathon) => (
              <div key={hackathon._id}>
                <HackathonCard
                key={hackathon._id}
                hackathon={hackathon}
                canEdit={canManage && canEdit(hackathon)}
                canDelete={canManage && canDelete(hackathon)}
                onEdit={() => setEditingHackathon(hackathon)}
                onDelete={() => handleDeleteHackathon(hackathon._id)}
                onStatusUpdate={(status) => handleStatusUpdate(hackathon._id, status)}
                onManageTeams={(hackathon) => setManagingTeams(hackathon)}
                onManageApprovals={(hackathonId) => setApprovalsHackathon(hackathonId)}
                onViewDetails={() => setDetailHackathon(hackathon)}
                 onRegister={() => handleRegister(hackathon)}
                 registrationStatus={registrations[hackathon._id]}
                 registering={registeringId === hackathon._id}
                 onCancelRegistration={async () => {
                   setRegisteringId(hackathon._id);
                   try {
                     const reg = await registrationService.getMyForHackathon(hackathon._id);
                     await registrationService.updateStatus(reg._id, 'cancelled');
                     setRegistrations(prev => ({ ...prev, [hackathon._id]: 'cancelled' }));
                   } catch (err) {
                     alert('Failed to cancel registration');
                   } finally {
                     setRegisteringId(null);
                   }
                 }}
              />
              </div>
            ))}
        </div>
        )}
      </div>
    </div>

    {/* Team Management Modal */}
    {managingTeams && (
      <TeamManagement
        hackathon={managingTeams}
        onClose={() => setManagingTeams(null)}
      />
    )}
    {detailHackathon && (
      <HackathonDetailsModal
        hackathon={detailHackathon}
        onClose={() => setDetailHackathon(null)}
      />
    )}
    {approvalsHackathon && (
      <RegistrationApprovals
        hackathonId={approvalsHackathon}
        onClose={() => setApprovalsHackathon(null)}
      />
    )}
  </div>
  );
};

export default HackathonManagement;