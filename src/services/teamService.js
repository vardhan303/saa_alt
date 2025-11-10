
export const teamService = {
  getTeamsForHackathon: async (hackathonId) => {
    const response = await fetch(`/api/teams/hackathon/${hackathonId}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch teams');
    const result = await response.json();
    return result.data || [];
  },
  getMyTeams: async () => {
    const response = await fetch('/api/teams/me', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch my teams');
    const result = await response.json();
    return result.data || [];
  },
  updateSubmission: async (teamId, submissionData) => {
    const response = await fetch(`/api/teams/${teamId}/submission`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(submissionData)
    });
    if (!response.ok) throw new Error('Failed to update submission');
    const result = await response.json();
    return result.data;
  },
  getSubmission: async (teamId) => {
    const response = await fetch(`/api/teams/${teamId}/submission`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch submission');
    const result = await response.json();
    return result.data || {};
  }
};export default teamService;
