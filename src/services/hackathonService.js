// Static dummy hackathons for demo
const DUMMY_HACKATHONS = [
  {
    _id: '1',
    name: 'AI Innovation Challenge 2024',
    description: 'Build innovative AI solutions to solve real-world problems',
    startDate: '2024-12-15T09:00:00Z',
    endDate: '2024-12-17T18:00:00Z',
    registrationDeadline: '2024-12-10T23:59:59Z',
    maxParticipants: 100,
    status: 'upcoming',
    location: 'Tech Hub, Silicon Valley',
    locationType: 'in-person',
    createdBy: 'admin',
    registeredCount: 45
  },
  {
    _id: '2',
    name: 'Web3 Hackathon',
    description: 'Create decentralized applications for the future',
    startDate: '2024-11-20T10:00:00Z',
    endDate: '2024-11-22T20:00:00Z',
    registrationDeadline: '2024-11-18T23:59:59Z',
    maxParticipants: 150,
    status: 'registration-open',
    location: 'Online',
    locationType: 'virtual',
    createdBy: 'admin',
    registeredCount: 78
  },
  {
    _id: '3',
    name: 'Green Tech Summit',
    description: 'Develop sustainable technology solutions',
    startDate: '2024-11-25T08:00:00Z',
    endDate: '2024-11-26T17:00:00Z',
    registrationDeadline: '2024-11-23T23:59:59Z',
    maxParticipants: 80,
    status: 'active',
    location: 'Innovation Center, Austin',
    locationType: 'hybrid',
    createdBy: 'user',
    registeredCount: 65
  }
];

const getStoredHackathons = () => {
  const stored = localStorage.getItem('hackathons');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('hackathons', JSON.stringify(DUMMY_HACKATHONS));
  return DUMMY_HACKATHONS;
};

const saveHackathons = (hackathons) => {
  localStorage.setItem('hackathons', JSON.stringify(hackathons));
};

export const hackathonService = {
  // Get all hackathons with optional filters
  getAll: async (filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let hackathons = getStoredHackathons();
    
    // Apply filters
    if (filters.status) {
      hackathons = hackathons.filter(h => h.status === filters.status);
    }
    if (filters.locationType) {
      hackathons = hackathons.filter(h => h.locationType === filters.locationType);
    }
    if (filters.upcoming) {
      hackathons = hackathons.filter(h => h.status === 'upcoming' || h.status === 'registration-open');
    }
    if (filters.active) {
      hackathons = hackathons.filter(h => h.status === 'active');
    }
    
    return hackathons;
  },

  // Get single hackathon by ID
  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const hackathons = getStoredHackathons();
    const hackathon = hackathons.find(h => h._id === id);
    if (!hackathon) throw new Error('Hackathon not found');
    return hackathon;
  },

  // Create new hackathon
  create: async (hackathonData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const hackathons = getStoredHackathons();
    const newHackathon = {
      _id: String(Date.now()),
      ...hackathonData,
      createdBy: 'admin',
      registeredCount: 0,
      status: 'draft'
    };
    hackathons.push(newHackathon);
    saveHackathons(hackathons);
    return newHackathon;
  },

  // Update existing hackathon
  update: async (id, hackathonData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const hackathons = getStoredHackathons();
    const index = hackathons.findIndex(h => h._id === id);
    if (index === -1) throw new Error('Hackathon not found');
    
    hackathons[index] = { ...hackathons[index], ...hackathonData };
    saveHackathons(hackathons);
    return hackathons[index];
  },

  // Delete hackathon
  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const hackathons = getStoredHackathons();
    const filtered = hackathons.filter(h => h._id !== id);
    saveHackathons(filtered);
    return { success: true };
  },

  // Get hackathons created by current user
  getMyHackathons: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    const hackathons = getStoredHackathons();
    return hackathons.filter(h => h.createdBy === user.username);
  },

  // Update hackathon status
  updateStatus: async (id, status) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const hackathons = getStoredHackathons();
    const index = hackathons.findIndex(h => h._id === id);
    if (index === -1) throw new Error('Hackathon not found');
    
    hackathons[index].status = status;
    saveHackathons(hackathons);
    return hackathons[index];
  },

  // Convenience methods for common filters
  getUpcoming: async () => {
    return hackathonService.getAll({ upcoming: true });
  },

  getActive: async () => {
    return hackathonService.getAll({ active: true });
  },

  getByStatus: async (status) => {
    return hackathonService.getAll({ status });
  },

  getByLocationType: async (locationType) => {
    return hackathonService.getAll({ locationType });
  }
};

export default hackathonService;