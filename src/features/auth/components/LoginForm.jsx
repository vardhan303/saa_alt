import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../../../shared/ui';

// Static credentials for easy demo setup
const DEMO_USERS = [
    { username: 'user', password: 'password', role: 'participant', displayName: 'Demo User' },
    { username: 'admin', password: 'admin123', role: 'admin', displayName: 'Admin User' }
];

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Check against static credentials
        const user = DEMO_USERS.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Store user session in localStorage
            const userSession = {
                id: user.username,
                sub: user.username,
                displayName: user.displayName,
                name: user.displayName,
                roles: [user.role],
                username: user.username
            };
            
            localStorage.setItem('auth_user', JSON.stringify(userSession));
            localStorage.setItem('auth_token', 'demo-token-' + Date.now());
            
            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
            
            // Trigger page reload to update auth context
            window.location.reload();
        } else {
            setError('Invalid username or password');
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md p-6 sm:p-8 md:p-10" padding="lg">
                <Card.Header>
                    <Card.Title className="text-center">Welcome</Card.Title>
                    <p className="text-center text-text-muted mt-2">
                        Sign in to your account to continue
                    </p>
                </Card.Header>
                
                <Card.Content>
                    <form onSubmit={handleSubmit} className="space-y-6 py-2">
                        {error && (
                            <Card className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-2">
                                <Card.Content>{error}</Card.Content>
                            </Card>
                        )}
                        <div className="space-y-4">
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                label="Username"
                                className="w-full px-3 py-2"
                            />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                label="Password"
                                className="w-full px-3 py-2"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </Card.Content>

                <Card.Footer>
                    <p className="text-xs text-text-muted text-center">
                        Demo credentials: user/password or admin/admin123
                    </p>
                </Card.Footer>
            </Card>
        </div>
    );
}
