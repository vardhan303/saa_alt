// Static registration data for demo
const getStoredRegistrations = () => {
  const stored = localStorage.getItem('registrations');
  return stored ? JSON.parse(stored) : [];
};

const saveRegistrations = (registrations) => {
  localStorage.setItem('registrations', JSON.stringify(registrations));
};

export const registrationService = {
  request: async (hackathonId, data = {}) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const registrations = getStoredRegistrations();
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    
    const newRegistration = {
      _id: String(Date.now()),
      hackathonId,
      userId: user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...data
    };
    
    registrations.push(newRegistration);
    saveRegistrations(registrations);
    return newRegistration;
  },
  
  getMyForHackathon: async (hackathonId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const registrations = getStoredRegistrations();
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    
    const registration = registrations.find(
      r => r.hackathonId === hackathonId && r.userId === user.id
    );
    
    if (!registration) {
      return { status: 'not-registered' };
    }
    
    return registration;
  },
  
  updateStatus: async (registrationId, status) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const registrations = getStoredRegistrations();
    const index = registrations.findIndex(r => r._id === registrationId);
    
    if (index === -1) throw new Error('Registration not found');
    
    registrations[index].status = status;
    saveRegistrations(registrations);
    return registrations[index];
  }
};

export default registrationService;
