import { getTestsByCategory } from '../services/testCases';
import { TestCard } from '../components/TestCard';
import { Button } from '../components';
import { useTestRunner } from '../hooks/useTestRunner';

// Error type information for display
const errorInfo: Record<string, { description: string; statusCode: number; color: string }> = {
  SecretKeyError: {
    description: 'Thrown when neither secret nor private/public key is configured',
    statusCode: 500,
    color: 'purple',
  },
  UndefinedTokenError: {
    description: 'Thrown when the token is undefined or missing from the request',
    statusCode: 401,
    color: 'orange',
  },
  WrongAuthHeaderTypeError: {
    description: 'Thrown when the authorization header format is invalid or missing prefix',
    statusCode: 400,
    color: 'yellow',
  },
  EmptyCookieError: {
    description: 'Thrown when the expected cookie is empty or not present',
    statusCode: 401,
    color: 'blue',
  },
  RefreshTokenError: {
    description: 'Thrown when refresh token options are misconfigured or missing',
    statusCode: 500,
    color: 'red',
  },
};

export function ErrorScenarios() {
  const errorTests = getTestsByCategory('error-scenarios');
  const { runTest, runCategory, results, isRunning, runningTestId } = useTestRunner();

  const handleRunAll = async () => {
    await runCategory('error-scenarios');
  };

  // Calculate test statistics
  const completedTests = errorTests.filter((t) => results[t.id]);
  const passedTests = completedTests.filter((t) => results[t.id]?.passed);
  const failedTests = completedTests.filter((t) => !results[t.id]?.passed);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Scenarios Tests</h1>
          <p className="text-gray-500 mt-1">
            Test all custom error types from @block32/jwt-auth package
          </p>
        </div>
        <Button onClick={handleRunAll} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run All'}
        </Button>
      </div>

      {/* Explanation Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">About Error Scenario Tests</h3>
        <p className="text-sm text-blue-800 mb-3">
          These tests verify that the @block32/jwt-auth package correctly throws and handles custom
          error types. Each test intentionally triggers a specific error condition to ensure proper
          error handling.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
            Pass = Error triggered correctly
          </span>
          <span className="text-blue-700">
            A passing test means the expected error was thrown with the correct status code.
          </span>
        </div>
      </div>

      {/* Test Statistics */}
      {completedTests.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-700">{completedTests.length}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{passedTests.length}</div>
            <div className="text-sm text-green-600">Passed</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{failedTests.length}</div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
        </div>
      )}

      {/* Error Types Overview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Custom Error Types</h3>
        <div className="grid gap-3">
          {Object.entries(errorInfo).map(([errorName, info]) => (
            <div
              key={errorName}
              className="flex items-start gap-3 bg-white rounded border border-gray-100 p-3"
            >
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${
                  info.color === 'purple'
                    ? 'bg-purple-100 text-purple-800'
                    : info.color === 'orange'
                      ? 'bg-orange-100 text-orange-800'
                      : info.color === 'yellow'
                        ? 'bg-yellow-100 text-yellow-800'
                        : info.color === 'blue'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                }`}
              >
                {info.statusCode}
              </span>
              <div>
                <div className="font-mono text-sm font-medium text-gray-900">{errorName}</div>
                <div className="text-sm text-gray-500">{info.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Error Trigger Tests</h2>
        <div className="space-y-3">
          {errorTests.map((testCase) => (
            <TestCard
              key={testCase.id}
              testCase={testCase}
              result={results[testCase.id]}
              onRun={runTest}
              isRunning={runningTestId === testCase.id}
            />
          ))}
        </div>
      </div>

      {/* Endpoint Reference */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-900 mb-2">Backend Endpoints</h3>
        <div className="space-y-1 text-sm text-yellow-800">
          <div>
            <span className="font-mono bg-yellow-100 px-1 rounded">GET /error/secret-key</span> -
            Triggers SecretKeyError
          </div>
          <div>
            <span className="font-mono bg-yellow-100 px-1 rounded">GET /error/undefined-token</span>{' '}
            - Triggers UndefinedTokenError
          </div>
          <div>
            <span className="font-mono bg-yellow-100 px-1 rounded">GET /error/wrong-header</span> -
            Triggers WrongAuthHeaderTypeError
          </div>
          <div>
            <span className="font-mono bg-yellow-100 px-1 rounded">GET /error/empty-cookie</span> -
            Triggers EmptyCookieError
          </div>
          <div>
            <span className="font-mono bg-yellow-100 px-1 rounded">GET /error/refresh-token</span> -
            Triggers RefreshTokenError
          </div>
        </div>
      </div>
    </div>
  );
}
