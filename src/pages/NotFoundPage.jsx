import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../shared/ui';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <Card className="max-w-md text-center">
        <Card.Content>
          <div className="mb-6">
            <div className="text-6xl font-bold text-text-muted mb-4">404</div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Page Not Found
            </h1>
            <p className="text-text-muted">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link to="/" className="block">
              <Button variant="primary" className="w-full">
                {/* Go to Dashboard removed */}
              </Button>
            </Link>
            <Link to="/profile" className="block">
              <Button variant="secondary" className="w-full">
                View Profile
              </Button>
            </Link>
          </div>
        </Card.Content>
        
        <Card.Footer>
          <p className="text-sm text-text-muted">
            If you believe this is an error, please contact support.
          </p>
        </Card.Footer>
      </Card>
    </div>
  );
}
