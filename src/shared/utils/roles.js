/**
 * Role utility helpers
 * A user object is expected to have a `roles` array (defaults to ['participant']).
 */

/** Return a normalized roles array (never empty). */
export function getRoles(user) {
  if (!user) return ['participant'];
  const arr = Array.isArray(user.roles) ? user.roles : [];
  return arr.length ? arr : ['participant'];
}

/** Check for a single role. */
export function hasRole(user, role) {
  return getRoles(user).includes(role);
}

/** Check if user has ANY of the provided roles. */
export function hasAnyRole(user, roles) {
  const userRoles = getRoles(user);
  return roles.some(r => userRoles.includes(r));
}

/** Check if user has ALL provided roles. */
export function hasAllRoles(user, roles) {
  const userRoles = getRoles(user);
  return roles.every(r => userRoles.includes(r));
}

/** Business capability: can manage (create/edit) hackathons. */
export function canManageHackathons(user) {
  return hasAnyRole(user, ['creator','organizer']);
}

/** Participant-only (no elevated roles). */
export function isParticipantOnly(user) {
  const roles = getRoles(user);
  return roles.length === 1 && roles[0] === 'participant';
}

export default {
  getRoles,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  canManageHackathons,
  isParticipantOnly
};
