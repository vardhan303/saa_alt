// Static dummy data for demo purposes
const DUMMY_USERS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    roles: ['participant'],
    roleRequests: ['organizer']
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    roles: ['participant', 'judge'],
    roleRequests: []
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    roles: ['participant', 'organizer'],
    roleRequests: []
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice.w@example.com',
    roles: ['participant'],
    roleRequests: ['judge', 'organizer']
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie.b@example.com',
    roles: ['participant', 'creator'],
    roleRequests: []
  },
  {
    id: '6',
    name: 'Diana Prince',
    email: 'diana.p@example.com',
    roles: ['participant'],
    roleRequests: ['creator']
  },
  {
    id: '7',
    name: 'Eve Davis',
    email: 'eve.davis@example.com',
    roles: ['participant', 'judge', 'organizer'],
    roleRequests: []
  },
  {
    id: '8',
    name: 'Frank Miller',
    email: 'frank.m@example.com',
    roles: ['participant'],
    roleRequests: []
  }
];

// Store users in localStorage for persistence across sessions
const getStoredUsers = () => {
  const stored = localStorage.getItem('admin_users');
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with dummy data
  localStorage.setItem('admin_users', JSON.stringify(DUMMY_USERS));
  return DUMMY_USERS;
};

const saveUsers = (users) => {
  localStorage.setItem('admin_users', JSON.stringify(users));
};

export const adminService = {
  async getUsers(page = 1, limit = 20) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const allUsers = getStoredUsers();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allUsers.length / limit);
    
    return {
      users: paginatedUsers,
      page,
      limit,
      total: allUsers.length,
      totalPages
    };
  },
  
  async promoteUser(id, role) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const user = users[userIndex];
    
    // Add role if not already present
    if (!user.roles.includes(role)) {
      user.roles.push(role);
    }
    
    // Remove from role requests if present
    if (user.roleRequests.includes(role)) {
      user.roleRequests = user.roleRequests.filter(r => r !== role);
    }
    
    users[userIndex] = user;
    saveUsers(users);
    
    return user;
  },
  
  async removeUserRole(id, role) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (role === 'participant') {
      throw new Error('Cannot remove participant role');
    }
    
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const user = users[userIndex];
    user.roles = user.roles.filter(r => r !== role);
    
    users[userIndex] = user;
    saveUsers(users);
    
    return user.roles;
  }
};