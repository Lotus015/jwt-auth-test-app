import { useState } from 'react';
import { TestCase } from '../services/testCases';
import { TestResult } from '../hooks/useTestRunner';
import { Card, CardHeader, CardBody } from './Card';
import { Button } from './Button';
import { StatusIndicator } from './StatusIndicator';

export type TestStatus = 'idle' | 'running' | 'pass' | 'fail';

interface TestCardProps {
  testCase: TestCase;
  result?: TestResult;
  onRun: (id: string) => void;
  isRunning?: boolean;
}

export function TestCard({ testCase, result, onRun, isRunning = false }: TestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatus = (): TestStatus => {
    if (isRunning) return 'running';
    if (!result) return 'idle';
    return result.passed ? 'pass' : 'fail';
  };

  const status = getStatus();

  const getStatusBgColor = () => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleRun = () => {
    onRun(testCase.id);
  };

  const toggleExpand = () => {
    if (result) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card className={`border ${getStatusBgColor()} transition-colors`}>
      <CardHeader className="bg-transparent border-b-0 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === 'running' ? (
              <Spinner />
            ) : status === 'idle' ? (
              <div className="w-5 h-5 rounded-full bg-gray-300" />
            ) : (
              <StatusIndicator status={status} size="md" />
            )}
            <div>
              <h3 className="font-medium text-gray-900">{testCase.name}</h3>
              <p className="text-sm text-gray-500">{testCase.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <span className="text-xs text-gray-500">{result.duration}ms</span>
            )}
            <Button
              variant="secondary"
              onClick={handleRun}
              disabled={isRunning}
              className="text-sm px-3 py-1"
            >
              {isRunning ? 'Running...' : 'Run'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
            {testCase.method}
          </span>
          <span className="font-mono text-gray-500">{testCase.endpoint}</span>
          <span className="text-gray-400">
            Expected: <span className="font-mono">{testCase.expectedStatus}</span>
          </span>
          {testCase.expectedError && (
            <span className="text-orange-600">
              Error: <span className="font-mono">{testCase.expectedError}</span>
            </span>
          )}
        </div>

        {result && (
          <div className="mt-3">
            <button
              onClick={toggleExpand}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </button>

            {isExpanded && (
              <div className="mt-3 space-y-3">
                {/* Request Details */}
                <div className="bg-white rounded border p-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Request
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">URL:</span>{' '}
                      <span className="font-mono">{result.request.url}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Method:</span>{' '}
                      <span className="font-mono">{result.request.method}</span>
                    </div>
                    {result.request.headers && Object.keys(result.request.headers).length > 0 && (
                      <div>
                        <span className="text-gray-500">Headers:</span>
                        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.request.headers, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.request.body && (
                      <div>
                        <span className="text-gray-500">Body:</span>
                        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.request.body, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Response Details */}
                <div className="bg-white rounded border p-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Response
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>{' '}
                      <span
                        className={`font-mono ${
                          result.response.status >= 200 && result.response.status < 300
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {result.response.status}
                      </span>
                    </div>
                    {result.response.data !== undefined && (
                      <div>
                        <span className="text-gray-500">Body:</span>
                        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-48">
                          {JSON.stringify(result.response.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.error && (
                      <div>
                        <span className="text-gray-500">Error:</span>
                        <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-x-auto text-red-600">
                          {result.error}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Result Summary */}
                <div
                  className={`rounded border p-3 ${
                    result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={result.passed ? 'pass' : 'fail'} size="sm" />
                    <span className={`font-medium ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                      {result.passed
                        ? 'Test Passed'
                        : `Test Failed - Expected ${testCase.expectedStatus}, got ${result.response.status}`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function Spinner() {
  return (
    <svg
      className="w-5 h-5 animate-spin text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
