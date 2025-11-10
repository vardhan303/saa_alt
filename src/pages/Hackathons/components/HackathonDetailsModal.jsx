import React, { useEffect, useRef } from 'react';
import { Button, Modal, Pill, Card } from '../../../shared/ui';

/**
 * HackathonDetailsModal
 * Read-only comprehensive details view for participants.
 * Props:
 *  - hackathon: hackathon object
 *  - onClose: function to close modal
 */
const HackathonDetailsModal = ({ hackathon, onClose }) => {
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    // Focus close button when opened
    closeBtnRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Basic focus trap between close button and any links/buttons inside
      if (e.key === 'Tab') {
        const focusable = overlayRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!hackathon) return null;

  const formatDateTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
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

  const sectionClass = 'mt-6';
  const labelClass = 'text-xs font-semibold tracking-wide text-[#565F89] uppercase';

  return (
    <Modal
      open={!!hackathon}
      onClose={onClose}
      title={hackathon.name}
      size="full"
      className="!max-w-[95vw] w-full p-0 overflow-hidden"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="px-6 pt-1 pb-4 max-h-[70vh] overflow-y-auto">
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Pill variant={getStatusVariant(hackathon.status)}>
            {hackathon.status?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Pill>
          {hackathon.theme && (
            <Pill variant="primary">{hackathon.theme}</Pill>
          )}
        </div>
        <Card className="mt-4 p-4">
          <p className="text-[#A9B1D6] leading-relaxed whitespace-pre-line">{hackathon.description}</p>
        </Card>

        <div className={sectionClass}>
          <h3 className={labelClass}>Timeline</h3>
          <Card className="mt-2">
            <Card.Content className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-[#7AA2F7]">Start</div>
                <div className="text-[#A9B1D6]">{formatDateTime(hackathon.startDate)}</div>
              </div>
              <div>
                <div className="font-medium text-[#7AA2F7]">End</div>
                <div className="text-[#A9B1D6]">{formatDateTime(hackathon.endDate)}</div>
              </div>
              {hackathon.registrationDeadline && (
                <div>
                  <div className="font-medium text-[#7AA2F7]">Registration Deadline</div>
                  <div className="text-[#A9B1D6] flex items-center gap-2">
                    {formatDateTime(hackathon.registrationDeadline)}
                    <Pill variant={getRegistrationVariant(hackathon.registrationDeadline)} className="text-xs">
                      {getRegistrationVariant(hackathon.registrationDeadline) === 'danger' ? 'Closed' : 
                       getRegistrationVariant(hackathon.registrationDeadline) === 'warning' ? 'Closing Soon' : 'Open'}
                    </Pill>
                  </div>
                </div>
              )}
              {hackathon.submissionDeadline && (
                <div>
                  <div className="font-medium text-[#7AA2F7]">Submission Deadline</div>
                  <div className="text-[#A9B1D6]">{formatDateTime(hackathon.submissionDeadline)}</div>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {hackathon.location && (
          <div className={sectionClass}>
            <h3 className={labelClass}>Location</h3>
            <Card className="mt-2">
              <Card.Content className="text-sm text-[#A9B1D6] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Type:</span>
                  <Pill variant="info" className="capitalize">{hackathon.location.type}</Pill>
                </div>
                
                {hackathon.location.venue && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Venue:</span>
                    <Pill variant="info">{hackathon.location.venue}</Pill>
                  </div>
                )}
                
                {hackathon.location.meetingUrl && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">Meeting URL:</span>
                    <a href={hackathon.location.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-[#7AA2F7] hover:underline break-all">{hackathon.location.meetingUrl}</a>
                  </div>
                )}
                
                {hackathon.location.timezone && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Timezone:</span>
                    <span>{hackathon.location.timezone}</span>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        )}

        <div className={sectionClass}>
          <h3 className={labelClass}>Participation</h3>
          <Card className="mt-2">
            <Card.Content className="grid md:grid-cols-2 gap-4 text-sm text-[#A9B1D6]">
              <div><span className="font-medium">Max Team Size:</span> {hackathon.maxTeamSize || '—'}</div>
              <div><span className="font-medium">Max Teams:</span> {hackathon.maxTeams || '—'}</div>
              <div><span className="font-medium">Max Participants:</span> {hackathon.maxParticipants || '—'}</div>
              <div>
                <span className="font-medium">Registration Required:</span> 
                <Pill variant={hackathon.registrationRequired ? 'info' : 'default'} className="ml-2 text-xs">
                  {hackathon.registrationRequired ? 'Yes' : 'No'}
                </Pill>
              </div>
              <div>
                <span className="font-medium">Approval Required:</span>
                <Pill variant={hackathon.approvalRequired ? 'warning' : 'default'} className="ml-2 text-xs">
                  {hackathon.approvalRequired ? 'Yes' : 'No'}
                </Pill>
              </div>
              <div>
                <span className="font-medium">Team Formation:</span>
                <Pill variant={hackathon.allowTeamFormation ? 'success' : 'danger'} className="ml-2 text-xs">
                  {hackathon.allowTeamFormation ? 'Enabled' : 'Disabled'}
                </Pill>
              </div>
              <div>
                <span className="font-medium">Late Submissions:</span>
                <Pill variant={hackathon.allowLateSubmissions ? 'warning' : 'danger'} className="ml-2 text-xs">
                  {hackathon.allowLateSubmissions ? 'Allowed' : 'Not Allowed'}
                </Pill>
              </div>
              <div>
                <span className="font-medium">Public Results:</span>
                <Pill variant={hackathon.publicResults ? 'info' : 'default'} className="ml-2 text-xs">
                  {hackathon.publicResults ? 'Yes' : 'No'}
                </Pill>
              </div>
            </Card.Content>
          </Card>
        </div>

        {Array.isArray(hackathon.prizes) && hackathon.prizes.length > 0 && (
          <div className={sectionClass}>
            <h3 className={labelClass}>Prizes</h3>
            <Card className="mt-2 p-0">
              <ul className="divide-y divide-[#3B4252] overflow-hidden">
                {hackathon.prizes.map((p, idx) => (
                  <li key={idx} className="p-3 text-sm">
                    <div className="font-medium text-[#C0CAF5]">
                      <Pill variant={idx === 0 ? 'primary' : idx === 1 ? 'info' : idx === 2 ? 'warning' : 'default'} className="mr-2">
                        {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx+1}`}
                      </Pill>
                      {p.title || 'Prize'}
                    </div>
                    {p.description && <div className="text-[#A9B1D6] mt-1 text-xs">{p.description}</div>}
                    {p.value && <div className="text-[#565F89] mt-1 text-xs">Value: {p.value}</div>}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {Array.isArray(hackathon.schedule) && hackathon.schedule.length > 0 && (
          <div className={sectionClass}>
            <h3 className={labelClass}>Schedule</h3>
            <div className="mt-2 max-h-60 overflow-y-auto pr-1 space-y-2">
              {hackathon.schedule.map((item, idx) => (
                <Card key={idx} className="p-3">
                  <div className="flex justify-between flex-wrap gap-2">
                    <div className="font-medium text-[#C0CAF5]">{item.title}</div>
                    <div className="text-xs text-[#565F89]">{formatDateTime(item.startTime)} → {formatDateTime(item.endTime)}</div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Pill variant="primary" className="text-xs capitalize">{item.type}</Pill>
                    {item.location && <Pill variant="info" className="text-xs">{item.location}</Pill>}
                  </div>
                  {item.description && <div className="mt-2 text-xs text-[#A9B1D6] leading-snug whitespace-pre-line">{item.description}</div>}
                </Card>
              ))}
            </div>
          </div>
        )}

        {hackathon.organizer && (
          <div className={sectionClass}>
            <h3 className={labelClass}>Organizer</h3>
            <Card className="mt-2">
              <Card.Content className="text-sm text-[#A9B1D6] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Name:</span>
                  <Pill variant="primary">{hackathon.organizer.name}</Pill>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <a href={`mailto:${hackathon.organizer.email}`} className="text-[#7AA2F7] hover:underline">{hackathon.organizer.email}</a>
                </div>
                {hackathon.organizer.phone && 
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Phone:</span>
                    <span>{hackathon.organizer.phone}</span>
                  </div>
                }
                {hackathon.organizer.organization && 
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Organization:</span>
                    <Pill variant="info">{hackathon.organizer.organization}</Pill>
                  </div>
                }
              </Card.Content>
            </Card>
          </div>
        )}

        <div className={sectionClass}>
          <h3 className={labelClass}>Metadata</h3>
          <Card className="mt-2">
            <Card.Content className="grid md:grid-cols-2 gap-4 text-xs text-[#565F89]">
              <div>Created: {formatDateTime(hackathon.createdAt)}</div>
              <div>Updated: {formatDateTime(hackathon.updatedAt)}</div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </Modal>
  );
};

export default HackathonDetailsModal;
