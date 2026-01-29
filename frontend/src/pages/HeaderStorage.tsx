import { useState } from 'react';
import { getTestsByCategory } from '../services/testCases';
import { TestCard } from '../components/TestCard';
import { Button } from '../components';
import { useTestRunner } from '../hooks/useTestRunner';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export function HeaderStorage() {
  const headerTests = getTestsByCategory('header-storage');
  const { runTest, results, isRunning, runningTestId } = useTestRunner();
  const { accessToken, setAccessToken } = useAuth();
  const [headerToken, setHeaderToken] = useState<string | null>(null);

  const handleRunTest = async (id: string) => {
    // For the login test, we need to get a header-specific token
    if (id === 'header-login') {
      const result = await runTest(id);
      if (result.passed && result.response.data) {
        const data = result.response.data as { accessToken?: string };
        if (data.accessToken) {
          setHeaderToken(data.accessToken);
        }
      }
      return;
    }

    // For bearer auth test, use the main auth token
    if (id === 'header-bearer-auth') {
      // Ensure we have an access token for this test
      if (!accessToken) {
        // Login first to get a token
        try {
          const response = await api.post('/auth/login', {
            username: 'testuser',
            password: 'password123',
          });
          if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
            await runTest(id, response.data.accessToken);
          }
        } catch {
          await runTest(id);
        }
      } else {
        await runTest(id, accessToken);
      }
      return;
    }

    // For custom header tests, use the header-specific token
    if (id === 'header-custom-name' || id === 'header-custom-prefix') {
      // Ensure we have a header token
      if (!headerToken) {
        // Login first via header endpoint
        try {
          const response = await api.post('/header/login', {
            username: 'admin',
            password: 'admin123',
          });
          if (response.data.accessToken) {
            setHeaderToken(response.data.accessToken);
            await runTest(id, undefined, response.data.accessToken);
          }
        } catch {
          await runTest(id);
        }
      } else {
        await runTest(id, undefined, headerToken);
      }
      return;
    }

    // For missing/malformed tests, run without any token
    await runTest(id);
  };

  const handleRunAll = async () => {
    // First, login via auth endpoint for bearer test
    let authAccessToken = accessToken;
    if (!authAccessToken) {
      try {
        const authResponse = await api.post('/auth/login', {
          username: 'testuser',
          password: 'password123',
        });
        if (authResponse.data.accessToken) {
          authAccessToken = authResponse.data.accessToken;
          setAccessToken(authResponse.data.accessToken);
        }
      } catch {
        // Continue without auth token
      }
    }

    // Then login via header endpoint for custom header tests
    let customToken = headerToken;
    try {
      const headerResponse = await api.post('/header/login', {
        username: 'admin',
        password: 'admin123',
      });
      if (headerResponse.data.accessToken) {
        customToken = headerResponse.data.accessToken;
        setHeaderToken(headerResponse.data.accessToken);
      }
    } catch {
      // Continue without header token
    }

    // Run all tests in sequence with appropriate tokens
    for (const testCase of headerTests) {
      if (testCase.id === 'header-bearer-auth') {
        await runTest(testCase.id, authAccessToken || undefined);
      } else if (testCase.id === 'header-custom-name' || testCase.id === 'header-custom-prefix') {
        await runTest(testCase.id, undefined, customToken || undefined);
      } else {
        await runTest(testCase.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Header Storage Tests</h1>
          <p className="text-gray-500 mt-1">
            Test header-based authentication scenarios including Bearer tokens, custom headers, and error cases
          </p>
        </div>
        <Button onClick={handleRunAll} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run All'}
        </Button>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Header Authentication Scenarios</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><span className="font-mono bg-blue-100 px-1 rounded">Authorization: Bearer &lt;token&gt;</span> - Standard Bearer token in Authorization header</li>
          <li><span className="font-mono bg-blue-100 px-1 rounded">X-Auth-Token: Token &lt;token&gt;</span> - Custom header name with custom prefix</li>
          <li>Missing and malformed headers trigger specific error types</li>
        </ul>
      </div>

      {/* Token State Panel */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Current Token State</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Main Auth Token:</span>
            <div className="font-mono text-xs mt-1 bg-white p-2 rounded border truncate">
              {accessToken ? `${accessToken.substring(0, 50)}...` : 'Not set'}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Header Scenario Token:</span>
            <div className="font-mono text-xs mt-1 bg-white p-2 rounded border truncate">
              {headerToken ? `${headerToken.substring(0, 50)}...` : 'Not set'}
            </div>
          </div>
        </div>
      </div>

      {/* Test Cards */}
      <div className="space-y-4">
        {headerTests.map((testCase) => (
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
