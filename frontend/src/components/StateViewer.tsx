import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';

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
function truncateToken(token: string, maxLength = 30): string {
  if (token.length <= maxLength) return token;
  return `${token.substring(0, maxLength)}...`;
}

// Helper to format remaining time
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

interface StateViewerProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function StateViewer({ collapsed = false, onToggle }: StateViewerProps) {
  const { accessToken, user, isAuthenticated } = useAuth();
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

  // Get expiration color based on time remaining
  const getExpirationColor = () => {
    if (timeRemaining === null) return 'text-gray-400';
    if (timeRemaining <= 0) return 'text-red-600';
    if (timeRemaining < 300) return 'text-yellow-600'; // < 5 minutes
    return 'text-green-600';
  };

  if (collapsed) {
    return (
      <div className="bg-gray-800 text-white p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isAuthenticated ? 'bg-green-500' : 'bg-gray-500'
            }`}
          />
          <span className="text-xs">
            {isAuthenticated ? 'Authenticated' : 'Not Auth'}
          </span>
          {timeRemaining !== null && timeRemaining > 0 && (
            <span className={`text-xs ${getExpirationColor()}`}>
              {formatTimeRemaining(timeRemaining)}
            </span>
          )}
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white p-1"
            aria-label="Expand state viewer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white h-full overflow-auto">
      {/* Header */}
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Auth State</h3>
        {onToggle && (
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white p-1 lg:hidden"
            aria-label="Collapse state viewer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-4 text-sm">
        {/* Status */}
        <div>
          <div className="text-gray-400 text-xs uppercase mb-1">Status</div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isAuthenticated ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />
            <span className={isAuthenticated ? 'text-green-400' : 'text-gray-400'}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
        </div>

        {/* Access Token */}
        <div>
          <div className="text-gray-400 text-xs uppercase mb-1">Access Token</div>
          {accessToken ? (
            <code className="text-xs bg-gray-900 px-2 py-1 rounded block break-all text-blue-400">
              {truncateToken(accessToken)}
            </code>
          ) : (
            <span className="text-gray-500 italic text-xs">No token</span>
          )}
        </div>

        {/* Refresh Token Status */}
        <div>
          <div className="text-gray-400 text-xs uppercase mb-1">Refresh Token</div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isAuthenticated ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />
            <span className={isAuthenticated ? 'text-green-400' : 'text-gray-500'}>
              {isAuthenticated ? 'Available (httpOnly)' : 'Not set'}
            </span>
          </div>
        </div>

        {/* Expiration Countdown */}
        <div>
          <div className="text-gray-400 text-xs uppercase mb-1">Token Expiration</div>
          {timeRemaining !== null ? (
            <div className={`font-mono ${getExpirationColor()}`}>
              {timeRemaining <= 0 ? (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Expired
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTimeRemaining(timeRemaining)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-500 italic text-xs">N/A</span>
          )}
        </div>

        {/* Decoded User */}
        <div>
          <div className="text-gray-400 text-xs uppercase mb-1">Decoded User</div>
          {user ? (
            <pre className="text-xs bg-gray-900 px-2 py-2 rounded overflow-auto text-green-400 max-h-32">
              {JSON.stringify(user, null, 2)}
            </pre>
          ) : (
            <span className="text-gray-500 italic text-xs">No user data</span>
          )}
        </div>

        {/* Token Payload */}
        {decodedPayload && (
          <div>
            <div className="text-gray-400 text-xs uppercase mb-1">Token Payload</div>
            <pre className="text-xs bg-gray-900 px-2 py-2 rounded overflow-auto text-purple-400 max-h-40">
              {JSON.stringify(decodedPayload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
