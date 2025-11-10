import { apiClient } from './apiClient.js';


export const registrationService = {
  request: (hackathonId, data = {}) => apiClient.post(`/api/registrations/${hackathonId}`, data),
  getMyForHackathon: async (hackathonId) => {
    try {
      return await apiClient.get(`/api/registrations/me/${hackathonId}`);
    } catch (err) {
      // If 404, treat as not registered
      if (err.message && err.message.includes('404')) {
        return { status: 'not-registered' };
      }
      throw err;
    }
  },
  updateStatus: (registrationId, status) => apiClient.patch(`/api/registrations/${registrationId}/status`, { status })
};

export default registrationService;
