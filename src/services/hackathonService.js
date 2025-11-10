import { apiClient } from './apiClient.js';

export const hackathonService = {
  // Get all hackathons with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const queryString = params.toString();
    const url = `/api/hackathons${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  },

  // Get single hackathon by ID
  getById: async (id) => {
    return apiClient.get(`/api/hackathons/${id}`);
  },

  // Create new hackathon
  create: async (hackathonData) => {
    return apiClient.post('/api/hackathons', hackathonData);
  },

  // Update existing hackathon
  update: async (id, hackathonData) => {
    return apiClient.put(`/api/hackathons/${id}`, hackathonData);
  },

  // Delete hackathon
  delete: async (id) => {
    return apiClient.delete(`/api/hackathons/${id}`);
  },

  // Get hackathons created by current user
  getMyHackathons: async () => {
    return apiClient.get('/api/hackathons/my/created');
  },

  // Update hackathon status
  updateStatus: async (id, status) => {
    return apiClient.patch(`/api/hackathons/${id}/status`, { status });
  },

  // Convenience methods for common filters
  getUpcoming: async () => {
    return apiClient.get('/api/hackathons?upcoming=true');
  },

  getActive: async () => {
    return apiClient.get('/api/hackathons?active=true');
  },

  getByStatus: async (status) => {
    return apiClient.get(`/api/hackathons?status=${status}`);
  },

  getByLocationType: async (locationType) => {
    return apiClient.get(`/api/hackathons?location_type=${locationType}`);
  }
};

export default hackathonService;