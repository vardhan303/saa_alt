import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Pill } from '../../shared/ui';
import Table from '../../shared/ui/Table';
import { adminService } from '../../services/adminService';

const AdminPage = () => {
    const [adminUser, setAdminUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [showUsers] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if admin is authenticated
        const isAdminAuth = localStorage.getItem('adminAuth');
        const adminUserData = localStorage.getItem('adminUser');

        if (!isAdminAuth || isAdminAuth !== 'true') {
            // Redirect to admin login if not authenticated
            navigate('/admin/login');
            return;
        }

        if (adminUserData) {
            setAdminUser(JSON.parse(adminUserData));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminUser');
        navigate('/login');
    };

    const fetchUsers = async (targetPage = 1) => {
        setLoading(true);
        try {
            const data = await adminService.getUsers(targetPage, limit);
            setUsers(data.users || []);
            setPage(data.page || targetPage);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            alert('Failed to fetch users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Directly load users on mount
    useEffect(() => {
        if (showUsers) {
            fetchUsers(1);
        }
    }, [showUsers]);

    const handlePromote = async (user, role) => {
        // If already assigned, no action
        if (user.roles && user.roles.includes(role)) return;
        const pending = (user.roleRequests || []).includes(role);
        // Optimistic: add to roles, remove from roleRequests if pending
        setUsers(prev => prev.map(u => {
            if (u.id !== user.id) return u;
            return {
                ...u,
                roles: [...(u.roles || []), role],
                roleRequests: pending ? (u.roleRequests || []).filter(r => r !== role) : u.roleRequests
            };
        }));
        try {
            const updated = await adminService.promoteUser(user.id, role);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, roles: updated.roles, roleRequests: updated.roleRequests || [] } : u));
        } catch (e) {
            console.error('Promote failed, reverting', e);
            // Revert optimistic change
            setUsers(prev => prev.map(u => {
                if (u.id !== user.id) return u;
                return {
                    ...u,
                    roles: (u.roles || []).filter(r => r !== role),
                    // If it was pending originally, re-add to roleRequests
                    roleRequests: pending ? ([...(u.roleRequests || []), role].filter((v, i, arr) => arr.indexOf(v) === i)) : u.roleRequests
                };
            }));
            alert('Failed to promote user');
        }
    };

    const handleRemoveRole = async (user, role) => {
        if (role === 'participant') return; // safety
        if (!user.roles || !user.roles.includes(role)) return;
        // Optimistic removal
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, roles: u.roles.filter(r => r !== role) } : u));
        try {
            const roles = await adminService.removeUserRole(user.id, role);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, roles } : u));
        } catch (e) {
            console.error('Remove role failed, reverting', e);
            // Re-add role
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, roles: [...(u.roles||[]), role] } : u));
            alert('Failed to remove role');
        }
    };

    if (!adminUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <Card className="max-w-md mx-auto">
                    <Card.Content>
                        <div className="flex flex-col items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-center text-text-muted">Loading admin dashboard...</p>
                        </div>
                    </Card.Content>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Card className="mb-8">
                    <Card.Header>
                    <div className="flex justify-between items-center">
                        <Card.Title>Admin Dashboard</Card.Title>
                        <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="text-danger border-danger hover:bg-danger/10"
                            >
                                Logout
                            </Button>
                    </div>
                    </Card.Header>
                </Card>
                {/* ...existing code... */}
                {/* Users Table Modal */}
                {showUsers && (
                    <Card className="mt-8">
                        <Card.Content>
                                <Card.Title>All Users</Card.Title>

                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <>
                                    <Table
                                        columns={[
                                            { header: 'Name', accessor: 'name' },
                                            { header: 'Email', accessor: 'email' },
                                            { header: 'Requested For', accessor: 'requestedFor' },
                                            { header: 'Promote', accessor: 'promote' },
                                        ]}
                                        data={users.length === 0 ? [] : users.map((user) => ({
                                            name: <>
                                                <div className="text-sm font-medium text-text-primary">{user.name}</div>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {(user.roles || []).map(role => (
                                                        <Pill 
                                                            key={role} 
                                                            variant={role === 'organizer' ? 'success' : 
                                                                    role === 'judge' ? 'warning' : 'default'}
                                                            onRemove={role !== 'participant' ? () => handleRemoveRole(user, role) : undefined}
                                                        >
                                                            {role}
                                                        </Pill>
                                                    ))}
                                                </div>
                                            </>,
                                            email: <div className="text-sm text-text-primary">{user.email}</div>,
                                            requestedFor: <div className="text-sm text-text-muted flex flex-col gap-1">
                                                {(user.roleRequests && user.roleRequests.length) ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roleRequests.map(r => (
                                                            <Pill 
                                                                key={r} 
                                                                variant="warning"
                                                            >
                                                                {r}
                                                            </Pill>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-text-muted">—</span>
                                                )}
                                            </div>,
                                            promote: <div className="flex gap-2">
                                                {['creator','judge','organizer'].map(role => {
                                                    const assigned = (user.roles || []).includes(role);
                                                    const pending = (user.roleRequests || []).includes(role);
                                                    // Map role to variant
                                                    const getVariant = () => {
                                                        if (role === 'organizer') return 'success';
                                                        if (role === 'judge') return 'warning';
                                                        return 'default';
                                                    };
                                                    return (
                                                        <Pill
                                                            key={role}
                                                            variant={getVariant()}
                                                            onClick={!assigned ? () => handlePromote(user, role) : undefined}
                                                            className={`${(assigned || pending) ? 'opacity-50' : ''}`}
                                                        >
                                                            {pending && !assigned ? `Approve ${role}` : role.charAt(0).toUpperCase() + role.slice(1)}
                                                        </Pill>
                                                    );
                                                })}
                                            </div>
                                        }))}
                                        striped
                                        hoverable
                                        className="mb-0"
                                    />
                                    <div className="mt-4 flex items-center justify-between gap-4">
                                        <div className="text-xs text-text-muted">Page {page} of {totalPages}</div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                disabled={page <= 1 || loading}
                                                onClick={() => fetchUsers(page - 1)}
                                                className="text-sm px-3 py-1 disabled:opacity-50"
                                            >
                                                Prev
                                            </Button>
                                            <Button
                                                variant="outline"
                                                disabled={page >= totalPages || loading}
                                                onClick={() => fetchUsers(page + 1)}
                                                className="text-sm px-3 py-1 disabled:opacity-50"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card.Content>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminPage;