import React, { useState } from 'react';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import Dropdown from '../../../shared/ui/Dropdown.jsx';

const HackathonForm = ({ hackathon, onSubmit, onCancel, title, inModal = false }) => {
  const [formData, setFormData] = useState({
    name: hackathon?.name || '',
    description: hackathon?.description || '',
    theme: hackathon?.theme || '',
    startDate: hackathon?.startDate ? new Date(hackathon.startDate).toISOString().slice(0, 16) : '',
    endDate: hackathon?.endDate ? new Date(hackathon.endDate).toISOString().slice(0, 16) : '',
    registrationDeadline: hackathon?.registrationDeadline ? new Date(hackathon.registrationDeadline).toISOString().slice(0, 16) : '',
    submissionDeadline: hackathon?.submissionDeadline ? new Date(hackathon.submissionDeadline).toISOString().slice(0, 16) : '',
    location: {
      type: hackathon?.location?.type || 'onsite',
      venue: hackathon?.location?.venue || '',
      meetingUrl: hackathon?.location?.meetingUrl || '',
      timezone: hackathon?.location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    },
  maxTeamSize: hackathon?.maxTeamSize || 4,
  maxTeams: hackathon?.maxTeams || '',
    organizer: {
      name: hackathon?.organizer?.name || '',
      email: hackathon?.organizer?.email || '',
      phone: hackathon?.organizer?.phone || '',
      organization: hackathon?.organizer?.organization || ''
    },
    registrationRequired: hackathon?.registrationRequired !== false,
    approvalRequired: hackathon?.approvalRequired === true,
    allowTeamFormation: hackathon?.allowTeamFormation !== false,
    allowLateSubmissions: hackathon?.allowLateSubmissions === true,
    publicResults: hackathon?.publicResults !== false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : Number(value)) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!formData.name.trim()) throw new Error('Hackathon name is required');
      if (!formData.description.trim()) throw new Error('Description is required');
      if (!formData.startDate) throw new Error('Start date is required');
      if (!formData.endDate) throw new Error('End date is required');
      if (new Date(formData.endDate) <= new Date(formData.startDate)) throw new Error('End date must be after start date');
      if (!formData.organizer.name.trim()) throw new Error('Organizer name is required');
      if (!formData.organizer.email.trim()) throw new Error('Organizer email is required');
      if (formData.location.type === 'onsite' && !formData.location.venue.trim()) throw new Error('Venue is required for onsite hackathons');
      if (['virtual', 'hybrid'].includes(formData.location.type) && !formData.location.meetingUrl.trim()) throw new Error('Meeting URL is required for virtual/hybrid hackathons');

      const cleanData = {
        ...formData,
        maxTeams: formData.maxTeams === '' ? undefined : formData.maxTeams,
        registrationDeadline: formData.registrationDeadline || undefined,
        submissionDeadline: formData.submissionDeadline || undefined,
        organizer: {
          ...formData.organizer,
          phone: formData.organizer.phone || undefined,
          organization: formData.organizer.organization || undefined
        }
      };
      await onSubmit(cleanData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save hackathon');
    } finally {
      setLoading(false);
    }
  };
  // Shared form JSX once to avoid duplication
  const formBody = (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {!inModal && <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>}
          <Input label="Hackathon Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter hackathon name" />
          <Input
            as="textarea"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe the hackathon..."
          />
          <Input label="Theme (optional)" name="theme" value={formData.theme} onChange={handleChange} placeholder="e.g., AI/ML, Web Development, Mobile Apps" />
        </div>
        <div className="space-y-4">
          {!inModal && <h3 className="text-lg font-semibold text-gray-900">Dates & Schedule</h3>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Start Date & Time" name="startDate" type="datetime-local" value={formData.startDate} onChange={handleChange} required />
            <Input label="End Date & Time" name="endDate" type="datetime-local" value={formData.endDate} onChange={handleChange} required />
            <Input label="Registration Deadline (optional)" name="registrationDeadline" type="datetime-local" value={formData.registrationDeadline} onChange={handleChange} />
            <Input label="Submission Deadline (optional)" name="submissionDeadline" type="datetime-local" value={formData.submissionDeadline} onChange={handleChange} />
          </div>
        </div>
        <div className="space-y-4">
          {!inModal && <h3 className="text-lg font-semibold text-gray-900">Location</h3>}
          <div className="flex flex-col">
            <span className="mb-1 text-sm font-medium text-gray-700">Location Type</span>
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="w-full text-left bg-[#1F2335] border border-[#3B4252] rounded-lg px-3 py-2 text-sm text-[#A9B1D6] hover:border-[#7AA2F7] focus:outline-none focus:ring-2 focus:ring-[#7AA2F7]/40"
                >
                  {formData.location.type === 'onsite' && 'On-site'}
                  {formData.location.type === 'virtual' && 'Virtual'}
                  {formData.location.type === 'hybrid' && 'Hybrid'}
                </button>
              }
            >
              <Dropdown.Item onClick={() => handleChange({ target: { name: 'location.type', value: 'onsite', type: 'text' } })}>On-site</Dropdown.Item>
              <Dropdown.Item onClick={() => handleChange({ target: { name: 'location.type', value: 'virtual', type: 'text' } })}>Virtual</Dropdown.Item>
              <Dropdown.Item onClick={() => handleChange({ target: { name: 'location.type', value: 'hybrid', type: 'text' } })}>Hybrid</Dropdown.Item>
            </Dropdown>
          </div>
          {formData.location.type !== 'virtual' && (
            <Input label="Venue" name="location.venue" value={formData.location.venue} onChange={handleChange} required={formData.location.type === 'onsite'} placeholder="Enter venue address or location" />
          )}
          {formData.location.type !== 'onsite' && (
            <Input label="Meeting URL" name="location.meetingUrl" type="url" value={formData.location.meetingUrl} onChange={handleChange} required={['virtual', 'hybrid'].includes(formData.location.type)} placeholder="https://meet.google.com/... or https://zoom.us/..." />
          )}
          <Input label="Timezone" name="location.timezone" value={formData.location.timezone} onChange={handleChange} placeholder="e.g., America/New_York" />
        </div>
        <div className="space-y-4">
          {!inModal && <h3 className="text-lg font-semibold text-gray-900">Team & Participation</h3>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Max Team Size" name="maxTeamSize" type="number" min="1" max="10" value={formData.maxTeamSize} onChange={handleChange} required />
            <Input label="Max Teams" name="maxTeams" type="number" min="1" value={formData.maxTeams} onChange={handleChange} required placeholder="Enter number of teams" />
            <Input label="Max Participants" name="maxParticipants" type="number" value={formData.maxTeamSize && formData.maxTeams ? formData.maxTeamSize * formData.maxTeams : ''} readOnly disabled placeholder="Calculated automatically" />
          </div>
        </div>
        <div className="space-y-4">
          {!inModal && <h3 className="text-lg font-semibold text-gray-900">Organizer Information</h3>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Organizer Name" name="organizer.name" value={formData.organizer.name} onChange={handleChange} required />
            <Input label="Organizer Email" name="organizer.email" type="email" value={formData.organizer.email} onChange={handleChange} required />
            <Input label="Phone (optional)" name="organizer.phone" type="tel" value={formData.organizer.phone} onChange={handleChange} />
            <Input label="Organization (optional)" name="organizer.organization" value={formData.organizer.organization} onChange={handleChange} />
          </div>
        </div>
        <div className="space-y-4">
          {!inModal && <h3 className="text-lg font-semibold text-gray-900">Settings</h3>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center"><input type="checkbox" name="registrationRequired" checked={formData.registrationRequired} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /><span className="ml-2 text-sm text-[#A9B1D6]">Registration Required</span></label>
            <label className="flex items-center"><input type="checkbox" name="approvalRequired" checked={formData.approvalRequired} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /><span className="ml-2 text-sm text-[#A9B1D6]">Manual Approval Required</span></label>
            <label className="flex items-center"><input type="checkbox" name="allowTeamFormation" checked={formData.allowTeamFormation} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /><span className="ml-2 text-sm text-[#A9B1D6]">Allow Team Formation</span></label>
            <label className="flex items-center"><input type="checkbox" name="allowLateSubmissions" checked={formData.allowLateSubmissions} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /><span className="ml-2 text-sm text-[#A9B1D6]">Allow Late Submissions</span></label>
            <label className="flex items-center"><input type="checkbox" name="publicResults" checked={formData.publicResults} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /><span className="ml-2 text-sm text-[#A9B1D6]">Public Results</span></label>
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">{loading ? 'Saving...' : (hackathon ? 'Update Hackathon' : 'Create Hackathon')}</Button>
        </div>
      </form>
    </>
  );

  if (inModal) {
    return formBody;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Button variant="ghost" onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕</Button>
      </div>
      {formBody}
    </Card>
  );
};

export default HackathonForm;