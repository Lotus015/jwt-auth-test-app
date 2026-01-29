import { getTestsByCategory } from '../services/testCases';
import { TestCard } from '../components/TestCard';
import { Button } from '../components';
import { useTestRunner } from '../hooks/useTestRunner';
import { useAuth } from '../hooks/useAuth';

// Edge case information for display
const edgeCaseInfo: Record<string, { description: string; severity: 'high' | 'medium' | 'low' }> = {
  'Malformed Tokens': {
    description: 'Tests that malformed JWT tokens (wrong format, missing parts, invalid base64) are correctly rejected',
    severity: 'high',
  },
  'Algorithm Attacks': {
    description: 'Tests protection against "none" algorithm and algorithm switching attacks',
    severity: 'high',
  },
  'Wrong Secret': {
    description: 'Tests that tokens signed with incorrect secrets are rejected',
    severity: 'high',
  },
  'Expired Tokens': {
    description: 'Tests that expired tokens are correctly rejected by both sync and async guards',
    severity: 'medium',
  },
  'Header Format': {
    description: 'Tests that incorrect Authorization header formats are rejected',
    severity: 'medium',
  },
};

export function EdgeCases() {
  const { accessToken } = useAuth();
  const edgeCaseTests = getTestsByCategory('edge-cases');
  const { runTest, runCategory, results, isRunning, runningTestId } = useTestRunner();

  const handleRunAll = async () => {
    await runCategory('edge-cases', accessToken || undefined);
  };

  // Calculate test statistics
  const completedTests = edgeCaseTests.filter((t) => results[t.id]);
  const passedTests = completedTests.filter((t) => results[t.id]?.passed);
  const failedTests = completedTests.filter((t) => !results[t.id]?.passed);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edge Cases & Security Tests</h1>
          <p className="text-gray-500 mt-1">
            Test security edge cases with real bad requests to real endpoints
          </p>
        </div>
        <Button onClick={handleRunAll} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run All'}
        </Button>
      </div>

      {/* Explanation Panel */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-medium text-red-900 mb-2">About Edge Case Tests</h3>
        <p className="text-sm text-red-800 mb-3">
          These tests send <strong>actual malicious or malformed requests</strong> to real protected endpoints
          (/protected/sync, /protected/async, /auth/me). Unlike simulated error scenarios, these tests verify
          that the JWT guards correctly reject invalid tokens in production-like conditions.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
            Pass = Attack blocked
          </span>
          <span className="text-red-700">
            A passing test means the malicious/malformed request was correctly rejected with 403 or 401.
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
            <div className="text-sm text-green-600">Blocked (Secure)</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{failedTests.length}</div>
            <div className="text-sm text-red-600">Allowed (Vulnerable!)</div>
          </div>
        </div>
      )}

      {/* Edge Case Types Overview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Test Categories</h3>
        <div className="grid gap-3">
          {Object.entries(edgeCaseInfo).map(([name, info]) => (
            <div
              key={name}
              className="flex items-start gap-3 bg-white rounded border border-gray-100 p-3"
            >
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  info.severity === 'high'
                    ? 'bg-red-100 text-red-800'
                    : info.severity === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                }`}
              >
                {info.severity.toUpperCase()}
              </span>
              <div>
                <div className="font-medium text-sm text-gray-900">{name}</div>
                <div className="text-sm text-gray-500">{info.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Security Edge Case Tests</h2>
        <div className="space-y-3">
          {edgeCaseTests.map((testCase) => (
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

      {/* Security Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-900 mb-2">Security Notes</h3>
        <ul className="space-y-1 text-sm text-yellow-800 list-disc pl-5">
          <li>
            <strong>None Algorithm Attack:</strong> Tokens with "alg": "none" must be rejected
          </li>
          <li>
            <strong>Algorithm Switch:</strong> Tokens claiming different algorithms must be verified correctly
          </li>
          <li>
            <strong>Signature Verification:</strong> Tokens with wrong signatures must never be accepted
          </li>
          <li>
            <strong>Expiration:</strong> Expired tokens must be rejected regardless of valid signature
          </li>
        </ul>
      </div>
    </div>
  );
}
