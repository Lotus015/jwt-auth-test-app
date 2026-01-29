import { useState } from 'react';
import { getTestsByCategory } from '../services/testCases';
import { TestCard } from '../components/TestCard';
import { Button } from '../components';
import { useTestRunner } from '../hooks/useTestRunner';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

// Pre-generated expired token (HS256 with "your-secret-key" secret, exp: 1609459200 = 2021-01-01)
const EXPIRED_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTYwOTQ1NTYwMCwiZXhwIjoxNjA5NDU5MjAwfQ.Qf5FeZ1R9qqJWHJYX0gRz8G0tSEoiZN2CkT2fVj7mCQ';

// Pre-generated token with invalid signature (signed with different secret)
const INVALID_SIGNATURE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTYwOTQ1NTYwMH0.wrong_signature_here';

export function Guards() {
  const guardsTests = getTestsByCategory('guards');
  const { runTest, results, isRunning, runningTestId } = useTestRunner();
  const { accessToken, setAccessToken } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Separate tests by guard type
  const syncGuardTests = guardsTests.filter((t) => t.id.includes('sync'));
  const asyncGuardTests = guardsTests.filter((t) => t.id.includes('async'));

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const response = await api.post('/auth/login', {
        username: 'testuser',
        password: 'password123',
      });
      setAccessToken(response.data.accessToken);
    } catch {
      // Ignore errors
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRunTest = async (id: string) => {
    // For valid token tests, use the current access token
    if (id.includes('valid')) {
      // Ensure logged in first
      let token = accessToken;
      if (!token) {
        try {
          const response = await api.post('/auth/login', {
            username: 'testuser',
            password: 'password123',
          });
          token = response.data.accessToken;
          setAccessToken(token);
        } catch {
          await runTest(id);
          return;
        }
      }
      await runTest(id, token || undefined);
      return;
    }

    // For expired token tests, use the pre-generated expired token
    if (id.includes('expired')) {
      await runTest(id, EXPIRED_TOKEN);
      return;
    }

    // For invalid signature tests, use the pre-generated invalid signature token
    if (id.includes('invalid-signature')) {
      await runTest(id, INVALID_SIGNATURE_TOKEN);
      return;
    }

    // For missing token tests, don't send any token
    await runTest(id);
  };

  const handleRunSyncTests = async () => {
    // Login first if needed
    let token = accessToken;
    if (!token) {
      try {
        const response = await api.post('/auth/login', {
          username: 'testuser',
          password: 'password123',
        });
        token = response.data.accessToken;
        setAccessToken(token);
      } catch {
        // Continue without token
      }
    }

    for (const testCase of syncGuardTests) {
      await handleRunTest(testCase.id);
    }
  };

  const handleRunAsyncTests = async () => {
    // Login first if needed
    let token = accessToken;
    if (!token) {
      try {
        const response = await api.post('/auth/login', {
          username: 'testuser',
          password: 'password123',
        });
        token = response.data.accessToken;
        setAccessToken(token);
      } catch {
        // Continue without token
      }
    }

    for (const testCase of asyncGuardTests) {
      await handleRunTest(testCase.id);
    }
  };

  const handleRunAll = async () => {
    await handleRunSyncTests();
    await handleRunAsyncTests();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guards Tests</h1>
          <p className="text-gray-500 mt-1">
            Test JwtSyncGuard and JwtAsyncGuard behavior with valid, missing, expired, and invalid signature tokens
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleLogin}
            disabled={isRunning || isLoggingIn}
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
          <Button onClick={handleRunAll} disabled={isRunning}>
            {isRunning ? 'Running...' : 'Run All'}
          </Button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Guard Authentication Scenarios</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <span className="font-semibold">JwtSyncGuard</span> - Synchronous token verification using HS256
          </li>
          <li>
            <span className="font-semibold">JwtAsyncGuard</span> - Asynchronous token verification (supports async key retrieval)
          </li>
          <li>
            <span className="font-mono bg-blue-100 px-1 rounded">/protected/sync</span> - Protected by JwtSyncGuard
          </li>
          <li>
            <span className="font-mono bg-blue-100 px-1 rounded">/protected/async</span> - Protected by JwtAsyncGuard
          </li>
        </ul>
      </div>

      {/* Token State Panel */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Current Token State</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                accessToken
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {accessToken ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
          {accessToken && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Access Token:</span>{' '}
              <span className="font-mono text-xs">{accessToken.substring(0, 50)}...</span>
            </div>
          )}
        </div>
      </div>

      {/* Test Tokens Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-900 mb-2">Test Tokens</h3>
        <div className="space-y-2 text-sm text-yellow-800">
          <div>
            <span className="font-semibold">Expired Token:</span> Pre-generated JWT that expired on 2021-01-01
          </div>
          <div>
            <span className="font-semibold">Invalid Signature Token:</span> JWT with a tampered/wrong signature
          </div>
        </div>
      </div>

      {/* JwtSyncGuard Tests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">JwtSyncGuard Tests</h2>
          <Button
            variant="secondary"
            onClick={handleRunSyncTests}
            disabled={isRunning}
            className="text-sm"
          >
            Run Sync Tests
          </Button>
        </div>
        <div className="space-y-3">
          {syncGuardTests.map((testCase) => (
            <TestCard
              key={testCase.id}
              testCase={testCase}
              result={results[testCase.id]}
              onRun={handleRunTest}
              isRunning={runningTestId === testCase.id}
            />
          ))}
        </div>
      </div>

      {/* JwtAsyncGuard Tests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">JwtAsyncGuard Tests</h2>
          <Button
            variant="secondary"
            onClick={handleRunAsyncTests}
            disabled={isRunning}
            className="text-sm"
          >
            Run Async Tests
          </Button>
        </div>
        <div className="space-y-3">
          {asyncGuardTests.map((testCase) => (
            <TestCard
              key={testCase.id}
              testCase={testCase}
              result={results[testCase.id]}
              onRun={handleRunTest}
              isRunning={runningTestId === testCase.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
