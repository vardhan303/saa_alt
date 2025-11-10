const BASE_URL = '/api/users';

export async function requestRole(role) {
  const res = await fetch(`${BASE_URL}/request-role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ role })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to request role');
  }
  return res.json();
}
