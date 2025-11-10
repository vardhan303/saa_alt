import React from 'react';
import { Button, Card, GoogleIcon } from '../../../shared/ui';

// With Vite proxy configured, we can use relative URLs
const API_BASE = '';

export default function LoginForm() {
    const handleGoogle = () => {
        // Store the intended redirect URL before OAuth
        const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/';
        sessionStorage.setItem('authReturnTo', returnTo);
        window.location.href = `${API_BASE}/auth/google`;
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
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-3"
                    >
                        <GoogleIcon className="w-5 h-5" />
                        Continue With Google
                    </Button>
                </Card.Content>

                <Card.Footer>
                    <p className="text-xs text-text-muted text-center">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                    <div className="text-center mt-3">
                        <a 
                            href="/admin/login" 
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                            Admin Login
                        </a>
                    </div>
                </Card.Footer>
            </Card>
        </div>
    );
}
