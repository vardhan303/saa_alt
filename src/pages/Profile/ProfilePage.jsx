import React, { useState } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Button, Card, Input, OrbitProgress } from '../../shared/ui';
import { requestRole } from '../../services/userService';
import Navigation from '../../shared/components/Navigation';
import { Avatar } from '../../shared/ui/Avatar.jsx';

export default function ProfilePage() {
  const { user, loading, updateProfile, refreshUser } = useAuth?.() ?? {};

  // ...existing code...
  const [form, setForm] = useState({
    university: user?.university || '',
    currentSem: user?.currentSem || '',
    currentCGPA: user?.currentCGPA ?? '',
    universityEmail: user?.universityEmail || ''
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [roleReqStatus, setRoleReqStatus] = useState(null); // success message
  const [roleReqError, setRoleReqError] = useState(null);
  const [roleReqLoading, setRoleReqLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (form.currentCGPA !== '' && (isNaN(Number(form.currentCGPA)) || Number(form.currentCGPA) < 0 || Number(form.currentCGPA) > 10)) {
      errs.currentCGPA = 'CGPA must be between 0 and 10';
    }
    if (form.universityEmail) {
      const email = form.universityEmail.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        errs.universityEmail = 'Invalid email format';
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    const errs = validate();
    if (Object.keys(errs).length) {
      setSaveError(Object.values(errs)[0]);
      return;
    }
    try {
      setSaving(true);
      await updateProfile({
        university: form.university || undefined,
        currentSem: form.currentSem || undefined,
        currentCGPA: form.currentCGPA === '' ? undefined : Number(form.currentCGPA),
        universityEmail: form.universityEmail || undefined
      });
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <OrbitProgress variant="track-disc" speedPlus="-3" easing="ease-in-out" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Card className="max-w-md">
          <Card.Content>
            <p className="text-center text-text-muted">No user data available</p>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navigation />
      <div className="pt-32 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* New layout: top Account Information, bottom row with Roles & Permissions and Account Settings */}
          <div className="space-y-6">
            {/* Top: Account Information */}
            <Card>
              <Card.Header>
                <Card.Title>Account Information</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <Card.Header>
                    <div className="flex items-center gap-4">
                      <Avatar src={user.photo} name={user.displayName || user.name} size="xl" />
                      <div>
                        <Card.Title>{user.displayName || user.name || 'Unknown User'}</Card.Title>
                        <Card.Content>Google Account</Card.Content>
                      </div>
                    </div>
                  </Card.Header>
                  {/* User Details */}
                  <Card.Content>
                    <div className="grid gap-4">
                      <Input
                        label="Display Name"
                        value={user.displayName || user.name || 'Not provided'}
                        disabled
                      />
                      {user.emails && user.emails.length > 0 && (
                        <Input
                          label="Email Address"
                          value={user.emails[0]?.value || 'Not provided'}
                          disabled
                        />
                      )}
                      <Input
                        label="User ID"
                        value={user.sub || user.googleId || 'Not available'}
                        disabled
                      />
                      {/* Academic Profile Form */}
                      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            label="University"
                            id="university"
                            name="university"
                            value={form.university}
                            onChange={onChange}
                            placeholder="e.g. Stanford University"
                          />
                          <Input
                            label="Current Semester"
                            id="currentSem"
                            name="currentSem"
                            value={form.currentSem}
                            onChange={onChange}
                            placeholder="e.g. 5th"
                          />
                          <Input
                            label="Current CGPA"
                            id="currentCGPA"
                            name="currentCGPA"
                            value={form.currentCGPA}
                            onChange={onChange}
                            placeholder="0 - 10"
                            inputMode="decimal"
                          />
                          <Input
                            label="University Email"
                            id="universityEmail"
                            name="universityEmail"
                            value={form.universityEmail}
                            onChange={onChange}
                            placeholder="name@university.domain"
                            type="email"
                          />
                        </div>
                        {saveError && <p className="text-sm text-danger">{saveError}</p>}
                        {saveSuccess && <p className="text-sm text-success">Profile updated</p>}
                        <div className="flex justify-end">
                          <Button type="submit" variant="primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Academic Profile'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </Card.Content>
                </div>
              </Card.Content>
            </Card>
            {/* Bottom row: Roles & Permissions and Account Settings side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Roles & Permissions */}
              <Card>
                <Card.Header>
                  <Card.Title>Roles & Permissions</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h4 className="font-medium text-text-primary mb-0">Current Roles</h4>
                      <Card.Content>
                        <div className="flex flex-wrap gap-2">
                          {(user.roles || ['participant']).map(r => (
                            <Button key={r} variant="secondary" size="sm" disabled className="cursor-pointer !hover:bg-transparent !hover:opacity-100">
                              {r}
                            </Button>
                          ))}
                        </div>
                      </Card.Content>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Pending Role Requests</h4>
                      {user.roleRequests && user.roleRequests.length ? (
                        <Card.Content>
                          <div className="flex flex-wrap gap-2">
                            {user.roleRequests.map(r => (
                              <span key={r} className="px-2 py-1 text-xs rounded bg-amber-200/40 border border-amber-300 text-amber-800">
                                {r} (pending)
                              </span>
                            ))}
                          </div>
                        </Card.Content>
                      ) : (
                        <p className="text-sm text-text-muted">No pending requests</p>) }
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Request Additional Roles</h4>
                      <p className="text-xs text-text-muted mb-3">Select a role to request. An administrator will review and approve.</p>
                      <Card.Content>
                        <div className="flex flex-wrap gap-2">
                          {['creator', 'judge', 'organizer'].map(role => {
                            const has = (user.roles || []).includes(role);
                            const pending = (user.roleRequests || []).includes(role);
                            return (
                              <Button
                                key={role}
                                size="sm"
                                variant={has ? 'secondary' : 'primary'}
                                disabled={has || pending || roleReqLoading}
                                onClick={async () => {
                                  setRoleReqError(null);
                                  setRoleReqStatus(null);
                                  try {
                                    setRoleReqLoading(true);
                                    await requestRole(role);
                                    setRoleReqStatus(`Requested '${role}' role`);
                                    if (typeof refreshUser === 'function') {
                                      await refreshUser();
                                    }
                                  } catch (e) {
                                    setRoleReqError(e.message);
                                  } finally {
                                    setRoleReqLoading(false);
                                  }
                                }}
                              >
                                {has ? `${role} ✓` : pending ? `${role} (pending)` : `Request ${role}`}
                              </Button>
                            );
                          })}
                        </div>
                      </Card.Content>
                      {roleReqStatus && <p className="text-xs text-success mt-2">{roleReqStatus}</p>}
                      {roleReqError && <p className="text-xs text-danger mt-2">{roleReqError}</p>}
                    </div>
                  </div>
                </Card.Content>
              </Card>
              {/* Account Settings */}
              <Card>
                <Card.Header>
                  <Card.Title>Account Settings</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <Card.Content>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <h4 className="font-medium">Privacy & Security</h4>
                          <p className="text-sm">Manage your privacy settings</p>
                        </div>
                        <Button variant="secondary" size="sm">
                          Manage
                        </Button>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <h4 className="font-medium">Notifications</h4>
                          <p className="text-sm">Configure notification preferences</p>
                        </div>
                        <Button variant="secondary" size="sm">
                          Settings
                        </Button>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <h4 className="font-medium">Data Export</h4>
                          <p className="text-sm">Download your account data</p>
                        </div>
                        <Button variant="secondary" size="sm">
                          Export
                        </Button>
                      </div>
                    </Card.Content>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}