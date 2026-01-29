import { useState } from 'react';
import { getTestsByCategory } from '../services/testCases';
import { TestCard } from '../components/TestCard';
import { Button, ErrorMessage } from '../components';
import { useTestRunner } from '../hooks/useTestRunner';
import { useAuth } from '../hooks/useAuth';

export function AuthFlow() {
  const authFlowTests = getTestsByCategory('auth-flow');
  const { runTest, runCategory, results, isRunning, runningTestId } = useTestRunner();
  const { accessToken, setAccessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const handleRunTest = async (id: string) => {
    setError(null);
    try {
      const result = await runTest(id, accessToken || undefined);

      // If login test succeeded, update auth context with the new token
      if (id === 'auth-login-valid' && result.passed && result.response.data) {
        const data = result.response.data as { accessToken?: string };
        if (data.accessToken) {
          setAccessToken(data.accessToken);
        }
      }

      // If logout test succeeded, clear the auth context
      if (id === 'auth-logout' && result.passed) {
        setAccessToken(null);
      }

      // If refresh test succeeded, update auth context with the new token
      if (id === 'auth-refresh' && result.passed && result.response.data) {
        const data = result.response.data as { accessToken?: string };
        if (data.accessToken) {
          setAccessToken(data.accessToken);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test execution failed');
    }
  };

  const handleRunAll = async () => {
    setError(null);
    setIsRunningAll(true);
    try {
      const categoryResults = await runCategory('auth-flow', accessToken || undefined);

      // Update auth context based on results
      for (const result of categoryResults) {
        if (result.testId === 'auth-login-valid' && result.passed && result.response.data) {
          const data = result.response.data as { accessToken?: string };
          if (data.accessToken) {
            setAccessToken(data.accessToken);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test suite execution failed');
    } finally {
      setIsRunningAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auth Flow Tests</h1>
          <p className="text-gray-500 mt-1">
            Test login, logout, refresh, and user retrieval scenarios
          </p>
        </div>
        <Button onClick={handleRunAll} disabled={isRunning} loading={isRunningAll} loadingText="Running...">
          Run All
        </Button>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Test Cards */}
      <div className="space-y-4">
        {authFlowTests.map((testCase) => (
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
