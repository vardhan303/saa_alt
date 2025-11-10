// Static team data for demo
const DUMMY_TEAMS = [
  {
    _id: '1',
    name: 'Team Alpha',
    hackathonId: '1',
    members: [
      { userId: 'user', role: 'leader', name: 'Demo User' },
      { userId: '2', role: 'member', name: 'John Doe' }
    ],
    submission: {
      projectName: 'AI Assistant',
      description: 'An intelligent assistant powered by ML',
      githubUrl: 'https://github.com/team/ai-assistant',
      demoUrl: 'https://demo.ai-assistant.com'
    }
  }
];

const getStoredTeams = () => {
  const stored = localStorage.getItem('teams');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('teams', JSON.stringify(DUMMY_TEAMS));
  return DUMMY_TEAMS;
};

const saveTeams = (teams) => {
  localStorage.setItem('teams', JSON.stringify(teams));
};

export const teamService = {
  getTeamsForHackathon: async (hackathonId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const teams = getStoredTeams();
    return teams.filter(t => t.hackathonId === hackathonId);
  },
  
  getMyTeams: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const teams = getStoredTeams();
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    return teams.filter(t => 
      t.members.some(m => m.userId === user.id || m.userId === user.username)
    );
  },
  
  updateSubmission: async (teamId, submissionData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const teams = getStoredTeams();
    const index = teams.findIndex(t => t._id === teamId);
    
    if (index === -1) throw new Error('Team not found');
    
    teams[index].submission = { ...teams[index].submission, ...submissionData };
    saveTeams(teams);
    return teams[index];
  },
  
  getSubmission: async (teamId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const teams = getStoredTeams();
    const team = teams.find(t => t._id === teamId);
    
    if (!team) throw new Error('Team not found');
    
    return team.submission || {};
  }
};

export default teamService;
