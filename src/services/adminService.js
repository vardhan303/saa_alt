const BASE_URL = 'http://localhost:5000/api/admin';

function authHeaders() {
  const token = (typeof localStorage !== 'undefined' && localStorage.getItem('adminApiToken')) || 'admin-token';
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

export const adminService = {
  async getUsers(page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const response = await fetch(`${BASE_URL}/users?${params.toString()}`, {
        mode: 'cors',
        method: 'GET',
        headers: authHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      return data; // now returns {users, page, limit, total, totalPages}
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  async promoteUser(id, role) {
    try {
      const response = await fetch(`${BASE_URL}/users/${id}/role`, {
        mode: 'cors',
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      if (!response.ok) {
        throw new Error(`Failed to promote user: ${response.status}`);
      }
  const data = await response.json();
  return data.user; // user now includes roleRequests as well
    } catch (error) {
      console.error('Error promoting user:', error);
      throw error;
    }
  },
  async removeUserRole(id, role) {
    try {
      const response = await fetch(`${BASE_URL}/users/${id}/role`, {
        mode: 'cors',
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      if (!response.ok) {
        throw new Error(`Failed to remove role: ${response.status}`);
      }
      const data = await response.json();
      return data.roles;
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  }
};