import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardBody, ErrorMessage } from '../components';
import { useAuth } from '../hooks/useAuth';
import { LoginModal } from '../components/LoginModal';

// Helper to decode JWT payload without verification
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

// Helper to truncate token for display
function truncateToken(token: string, maxLength = 50): string {
  if (token.length <= maxLength) return token;
  return `${token.substring(0, maxLength)}...`;
}

// Helper to format remaining time
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { accessToken, user, isAuthenticated, logout, refresh } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Decode token payload
  const decodedPayload = useMemo(() => {
    if (!accessToken) return null;
    return decodeJwtPayload(accessToken);
  }, [accessToken]);

  // Calculate and update expiration countdown
  useEffect(() => {
    if (!decodedPayload || typeof decodedPayload.exp !== 'number') {
      setTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = (decodedPayload.exp as number) - now;
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [decodedPayload]);

  const handleLogout = async () => {
    setError(null);
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRefresh = async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRunAllTests = () => {
    navigate('/all-tests');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Quick Action Buttons */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => setIsLoginModalOpen(true)}
              disabled={isAuthenticated}
            >
              Login
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
              disabled={!isAuthenticated}
              loading={isLoggingOut}
              loadingText="Logging out..."
            >
              Logout
            </Button>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={!isAuthenticated}
              loading={isRefreshing}
              loadingText="Refreshing..."
            >
              Refresh
            </Button>
            <Button variant="primary" onClick={handleRunAllTests}>
              Run All Tests
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Auth State Panel */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Current Auth State</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600 w-32">Status:</span>
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-600 w-32">Access Token:</span>
              <div className="flex-1">
                {accessToken ? (
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
                    {truncateToken(accessToken)}
                  </code>
                ) : (
                  <span className="text-gray-400 italic">No token</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600 w-32">Expiration:</span>
              {timeRemaining !== null ? (
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    timeRemaining <= 0
                      ? 'bg-red-100 text-red-800'
                      : timeRemaining < 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {formatTimeRemaining(timeRemaining)}
                </span>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
            </div>

            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-600 w-32">Decoded User:</span>
              <div className="flex-1">
                {user ? (
                  <pre className="text-xs bg-gray-100 px-3 py-2 rounded overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                ) : (
                  <span className="text-gray-400 italic">No user data</span>
                )}
              </div>
            </div>

            {decodedPayload && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-gray-600 w-32">Token Payload:</span>
                <div className="flex-1">
                  <pre className="text-xs bg-gray-100 px-3 py-2 rounded overflow-auto">
                    {JSON.stringify(decodedPayload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Test Summary Stats (Placeholder) */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Test Summary</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-600">--</div>
              <div className="text-sm text-gray-500">Total Tests</div>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">--</div>
              <div className="text-sm text-gray-500">Passed</div>
            </div>
            <div className="p-4 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">--</div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Recent Test Results (Placeholder) */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Recent Test Results</h2>
        </CardHeader>
        <CardBody>
          <div className="text-gray-400 italic text-center py-4">
            No test results yet. Click "Run All Tests" to start.
          </div>
        </CardBody>
      </Card>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
