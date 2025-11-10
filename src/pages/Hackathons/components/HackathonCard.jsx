import React from 'react';
import { Card, Button, Pill } from '../../../shared/ui';

const HackathonCard = ({ 
  hackathon, 
  canEdit, 
  canDelete, 
  onEdit, 
  onDelete, 
  onStatusUpdate,
  onManageTeams,
  onManageApprovals,
  onViewDetails,
  onRegister,
  registrationStatus,
  registering,
  onCancelRegistration
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'upcoming':
      case 'registration-open':
      case 'active':
        return 'success';
      case 'judging':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getLocationTypeLabel = (type) => {
    const labels = {
      onsite: 'On-site',
      virtual: 'Virtual',
      hybrid: 'Hybrid'
    };
    return labels[type] || 'Location';
  };

  const getEndDate = () => {
    if (!hackathon?.endDate) return 'End date not set';
    return formatDate(hackathon.endDate);
  };
  
  const getRegistrationVariant = (deadline) => {
    if (!deadline) return 'default';
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeRemaining = deadlineDate - now;
    
    // Registration already closed
    if (timeRemaining < 0) return 'danger';
    
    // Less than 24 hours remaining
    if (timeRemaining < 24 * 60 * 60 * 1000) return 'warning';
    
    // More than 24 hours remaining
    return 'success';
  };

  const getAvailableStatuses = () => {
    if (!hackathon || !hackathon.status) return [];
    
    const currentStatus = hackathon.status;
    const now = new Date();
    const startDate = hackathon.startDate ? new Date(hackathon.startDate) : null;
    const endDate = hackathon.endDate ? new Date(hackathon.endDate) : null;

    // Status transitions based on current state and timing
    switch (currentStatus) {
      case 'draft':
        return ['upcoming', 'registration-open', 'cancelled'];
      case 'upcoming':
        return ['registration-open', 'cancelled'];
      case 'registration-open':
        if (now >= startDate) {
          return ['active', 'cancelled'];
        }
        return ['upcoming', 'active', 'cancelled'];
      case 'active':
        if (now >= endDate) {
          return ['judging', 'completed'];
        }
        return ['judging', 'cancelled'];
      case 'judging':
        return ['completed', 'active']; // Can go back to active if needed
      case 'completed':
        return []; // Final state
      case 'cancelled':
        return ['draft', 'upcoming']; // Can reactivate
      default:
        return [];
    }
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <Card className="h-full flex flex-col w-full min-w-[300px] max-w-[400px]">
      <Card.Header>
        <div className="flex justify-between items-start">
          <Card.Title className="line-clamp-2">
            {hackathon?.name || 'Unnamed Hackathon'}
          </Card.Title>
          <Pill 
            variant={getStatusVariant(hackathon?.status || 'draft')}
          >
            {hackathon?.status ? hackathon.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
          </Pill>
        </div>
      </Card.Header>

      <Card.Content className="flex-1">
        {/* Description */}
        <p className="text-[#A9B1D6] text-sm mb-4 line-clamp-2">
          {hackathon?.description || 'No description provided'}
        </p>

        {/* Theme */}
        {hackathon?.theme && (
          <div className="mb-3">
            <Pill variant="primary">
              {hackathon.theme}
            </Pill>
          </div>
        )}

        {/* Key Details */}
        <div className="space-y-2 text-sm text-[#A9B1D6] mb-4">
          <div className="flex items-center">
            <span className="font-medium mr-2">Date:</span>
            <span>{hackathon?.startDate ? formatDate(hackathon.startDate) : 'Date not set'}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium mr-2">End date:</span>
            <span>{getEndDate()}</span>
          </div>
          
          <div className="flex items-center flex-wrap gap-1">
            <span className="font-medium mr-2">Location:</span>
            <span className="capitalize">{getLocationTypeLabel(hackathon?.location?.type)}</span>
            {hackathon?.location?.venue && (
              <Pill variant="info" className="ml-1">
                {hackathon.location.venue}
              </Pill>
            )}
          </div>
          
          <div className="flex items-center">
            <span>Max team size: {hackathon?.maxTeamSize || 'Not specified'}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium mr-2">Organizer:</span>
            <span className="text-xs">{hackathon?.organizer?.name || 'Organizer not specified'}</span>
          </div>
        </div>
        {/* Registration Info */}
        {hackathon?.registrationDeadline && (
          <div className="mb-3">
            <Pill 
              variant={getRegistrationVariant(hackathon.registrationDeadline)}
              title={
                getRegistrationVariant(hackathon.registrationDeadline) === 'danger' ? 
                  'Registration deadline has passed' : 
                getRegistrationVariant(hackathon.registrationDeadline) === 'warning' ?
                  'Registration deadline is less than 24 hours away' :
                  'Registration is open'
              }
            >
              Registration: {formatDate(hackathon.registrationDeadline)}
            </Pill>
          </div>
        )}
      </Card.Content>
      
      <Card.Footer>
        {canEdit && (
          <div className="space-y-2">
            {/* Status Update */}
            {availableStatuses.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-[#565F89] mr-2">Update status:</span>
                {availableStatuses.map(status => (
                  <Pill
                    key={status}
                    variant={getStatusVariant(status)}
                    onClick={() => onStatusUpdate(status)}
                  >
                    {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Pill>
                ))}
              </div>
            )}
            
            {/* Edit/Delete/Team Actions */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onManageTeams(hackathon)}
                >
                  Teams
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onManageApprovals(hackathon._id)}
                >
                  Approvals
                </Button>
              </div>
              {canDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onDelete}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}
        
        {!canEdit && (
          <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewDetails}
              >
                View Details
              </Button>
              {onRegister && hackathon?.status === 'registration-open' && registrationStatus !== 'approved' && registrationStatus !== 'pending' && registrationStatus !== 'cancelled' && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={registering}
                  loading={registering}
                  onClick={onRegister}
                >
                  Register
                </Button>
              )}
              {/* Cancel button for pending registration */}
              {registrationStatus === 'pending' && typeof onCancelRegistration === 'function' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onCancelRegistration}
                >
                  Cancel
                </Button>
              )}
            </div>
            {/* Status help text */}
            {['pending','approved','rejected','cancelled'].includes(registrationStatus) && (
              <Pill
                variant={
                  registrationStatus === 'approved' ? 'success' :
                  registrationStatus === 'pending' ? 'warning' :
                  registrationStatus === 'rejected' || registrationStatus === 'cancelled' ? 'danger' : 'default'
                }
                title={
                  registrationStatus === 'pending' ? 'Your registration is awaiting approval from the organizer.' :
                  registrationStatus === 'approved' ? 'You are registered and can participate.' :
                  registrationStatus === 'rejected' ? 'Your registration was rejected by the organizer.' :
                  registrationStatus === 'cancelled' ? 'You cancelled your registration.' : ''
                }
              >
                {registrationStatus === 'pending' && 'Awaiting organizer approval'}
                {registrationStatus === 'approved' && 'You are registered'}
                {registrationStatus === 'rejected' && 'Rejected by organizer'}
                {registrationStatus === 'cancelled' && 'Registration cancelled'}
              </Pill>
            )}
          </div>
        )}
      </Card.Footer>
    </Card>
  );
};

export default HackathonCard;