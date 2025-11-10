import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Static credentials check
        if (username === 'Test' && password === 'Manju') {
            // Store admin session in localStorage
            localStorage.setItem('adminAuth', 'true');
            localStorage.setItem('adminUser', JSON.stringify({ username: 'Test', role: 'admin' }));
            // Store API token (could later be fetched from server)
            localStorage.setItem('adminApiToken', 'admin-token');
            
            // Navigate to admin page
            navigate('/admin');
        } else {
            setError('Invalid username or password');
        }
        
        setLoading(false);
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md p-6 sm:p-8 md:p-10" padding="lg">
                <Card.Header>
                    <Card.Title className="text-center">Admin Login</Card.Title>
                    <p className="text-center text-text-muted mt-2">
                        Enter your admin credentials
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
                    <div className="text-center">
                        <Button 
                            variant="link"
                            onClick={handleBackToLogin}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                            Back to User Login
                        </Button>
                    </div>
                </Card.Footer>
            </Card>
        </div>
    );
}