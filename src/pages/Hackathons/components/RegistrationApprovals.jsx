import React, { useEffect, useState } from 'react';
import { registrationService } from '../../../services/registrationService';
import { Button, Card } from '../../../shared/ui';

export default function RegistrationApprovals({ hackathonId, onClose }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/registrations?hackathonId=${hackathonId}&status=pending`, { credentials: 'include' });
        const data = await res.json();
        setRegistrations(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load registrations');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [hackathonId]);

  const handleAction = async (id, status) => {
    setUpdatingId(id);
    try {
      await registrationService.updateStatus(id, status);
      setRegistrations(registrations.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to update registration');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pending Registrations</h2>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No pending registrations.</div>
        ) : (
          <div className="space-y-4">
            {registrations.map(r => (
              <Card key={r._id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{r.userId?.displayName || r.userId?.name || 'Unknown User'}</div>
                  <div className="text-xs text-gray-500">{r.userId?.email}</div>
                  {r.motivation && <div className="mt-1 text-xs text-gray-700">Motivation: {r.motivation}</div>}
                </div>
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updatingId === r._id}
                    onClick={() => handleAction(r._id, 'approved')}
                  >Approve</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={updatingId === r._id}
                    onClick={() => handleAction(r._id, 'rejected')}
                  >Reject</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
