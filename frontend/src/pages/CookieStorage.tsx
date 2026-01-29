import { useState } from 'react';
import { getTestsByCategory } from '../services/testCases';
import { TestCard } from '../components/TestCard';
import { Button } from '../components';
import { useTestRunner } from '../hooks/useTestRunner';
import { CookieViewer } from '../components/CookieViewer';
import { api } from '../services/api';

export function CookieStorage() {
  const cookieTests = getTestsByCategory('cookie-storage');
  const { runTest, results, isRunning, runningTestId } = useTestRunner();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastSetCookieHeader, setLastSetCookieHeader] = useState<string | null>(null);

  const handleRunTest = async (id: string) => {
    // For the login test, capture the Set-Cookie header
    if (id === 'cookie-login') {
      const result = await runTest(id);
      if (result.passed) {
        setIsLoggedIn(true);
        // Note: Set-Cookie headers are not accessible via JavaScript due to browser security
        // but we can indicate that cookies were set
        setLastSetCookieHeader('Set-Cookie headers were sent (not accessible via JS)');
      }
      return;
    }

    // For access token test, ensure user is logged in first
    if (id === 'cookie-access-token') {
      if (!isLoggedIn) {
        // Login first via cookie endpoint
        try {
          await api.post('/cookie/login', {
            username: 'admin',
            password: 'admin123',
          });
          setIsLoggedIn(true);
        } catch {
          // Continue anyway, test will fail
        }
      }
      await runTest(id);
      return;
    }

    // For refresh token test, ensure user is logged in with main auth
    if (id === 'cookie-refresh-httponly') {
      // First login via main auth to set refresh cookie
      try {
        await api.post('/auth/login', {
          username: 'testuser',
          password: 'password123',
        });
      } catch {
        // Continue anyway
      }
      await runTest(id);
      return;
    }

    // For missing cookie test, clear cookies first by logging out
    if (id === 'cookie-missing') {
      // Clear cookies by logging out
      try {
        await api.post('/auth/logout');
      } catch {
        // Ignore logout errors
      }
      setIsLoggedIn(false);
      await runTest(id);
      return;
    }

    await runTest(id);
  };

  const handleRunAll = async () => {
    // Run login test first
    const loginResult = await runTest('cookie-login');
    if (loginResult.passed) {
      setIsLoggedIn(true);
      setLastSetCookieHeader('Set-Cookie headers were sent (not accessible via JS)');
    }

    // Run access token test
    await runTest('cookie-access-token');

    // Login via main auth for refresh test
    try {
      await api.post('/auth/login', {
        username: 'testuser',
        password: 'password123',
      });
    } catch {
      // Continue
    }

    // Run refresh token test
    await runTest('cookie-refresh-httponly');

    // Clear cookies for missing cookie test
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    }
    setIsLoggedIn(false);

    // Run missing cookie test
    await runTest('cookie-missing');
  };

  const handleClearCookies = async () => {
    try {
      await api.post('/auth/logout');
      setIsLoggedIn(false);
      setLastSetCookieHeader(null);
    } catch {
      // Ignore errors
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cookie Storage Tests</h1>
          <p className="text-gray-500 mt-1">
            Test cookie-based authentication scenarios including access tokens, refresh tokens, and error cases
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleClearCookies} disabled={isRunning}>
            Clear Cookies
          </Button>
          <Button onClick={handleRunAll} disabled={isRunning}>
            {isRunning ? 'Running...' : 'Run All'}
          </Button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Cookie Authentication Scenarios</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <span className="font-mono bg-blue-100 px-1 rounded">access_token</span> - Stored in regular cookie, accessible via JavaScript
          </li>
          <li>
            <span className="font-mono bg-blue-100 px-1 rounded">refresh_token</span> - Stored in httpOnly cookie, not visible in JavaScript
          </li>
          <li>
            Cookies are automatically sent with requests when <code className="bg-blue-100 px-1 rounded">withCredentials: true</code>
          </li>
          <li>
            Server sets cookies via <code className="bg-blue-100 px-1 rounded">Set-Cookie</code> response headers
          </li>
        </ul>
      </div>

      {/* Cookie Viewer */}
      <CookieViewer />

      {/* Set-Cookie Header Info */}
      {lastSetCookieHeader && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">Set-Cookie Headers</h3>
          <p className="text-sm text-green-800">
            {lastSetCookieHeader}
          </p>
          <p className="text-xs text-green-600 mt-2">
            Note: Browsers block JavaScript access to Set-Cookie headers for security.
            The cookies are set automatically by the browser.
          </p>
        </div>
      )}

      {/* Login State */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Cookie Session State</h3>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isLoggedIn
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isLoggedIn ? 'Logged In (cookies set)' : 'Logged Out (no cookies)'}
          </span>
          <span className="text-sm text-gray-500">
            Cookies are sent automatically with each request
          </span>
        </div>
      </div>

      {/* Test Cards */}
      <div className="space-y-4">
        {cookieTests.map((testCase) => (
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
  );
}
