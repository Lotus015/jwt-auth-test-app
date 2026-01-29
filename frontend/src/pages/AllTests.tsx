import { useState, useMemo } from 'react';
import { testCases, categoryLabels, TestCategory } from '../services/testCases';
import { Button, StatusIndicator, ErrorMessage } from '../components';
import { useTestRunner, TestResult } from '../hooks/useTestRunner';
import { useAuth } from '../hooks/useAuth';

type FilterType = 'all' | 'passed' | 'failed';

export function AllTests() {
  const { accessToken } = useAuth();
  const { runAll, runTest, results, isRunning, runningTestId, clearResults } = useTestRunner();
  const [filter, setFilter] = useState<FilterType>('all');
  const [totalDuration, setTotalDuration] = useState<number | null>(null);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = testCases.length;
    const resultsArray = Object.values(results);
    const completed = resultsArray.length;
    const passed = resultsArray.filter((r) => r.passed).length;
    const failed = resultsArray.filter((r) => !r.passed).length;
    return { total, completed, passed, failed };
  }, [results]);

  // Calculate progress
  const progress = useMemo(() => {
    const currentIndex = Object.keys(results).length;
    const total = testCases.length;
    const percentage = total > 0 ? (currentIndex / total) * 100 : 0;
    return { currentIndex, total, percentage };
  }, [results]);

  // Get current running test name
  const currentTestName = useMemo(() => {
    if (!runningTestId) return null;
    const test = testCases.find((t) => t.id === runningTestId);
    return test?.name || null;
  }, [runningTestId]);

  // Filter and sort results
  const filteredTests = useMemo(() => {
    let filtered = [...testCases];

    // Apply filter
    if (filter === 'passed') {
      filtered = filtered.filter((t) => results[t.id]?.passed === true);
    } else if (filter === 'failed') {
      filtered = filtered.filter((t) => results[t.id]?.passed === false);
    }

    // Sort: failed first, then passed, then not run
    filtered.sort((a, b) => {
      const aResult = results[a.id];
      const bResult = results[b.id];

      // Failed tests first
      if (aResult && !aResult.passed && (!bResult || bResult.passed)) return -1;
      if (bResult && !bResult.passed && (!aResult || aResult.passed)) return 1;

      // Then passed
      if (aResult?.passed && !bResult) return -1;
      if (bResult?.passed && !aResult) return 1;

      return 0;
    });

    return filtered;
  }, [filter, results]);

  // Group tests by category for display
  const testsByCategory = useMemo(() => {
    const grouped: Record<TestCategory, typeof filteredTests> = {
      'auth-flow': [],
      'header-storage': [],
      'cookie-storage': [],
      guards: [],
      algorithms: [],
      'async-jwt': [],
      'async-config': [],
      'edge-cases': [],
    };

    filteredTests.forEach((test) => {
      grouped[test.category].push(test);
    });

    return grouped;
  }, [filteredTests]);

  const handleRunAll = async () => {
    setError(null);
    clearResults();
    setTotalDuration(null);
    const startTime = performance.now();
    try {
      await runAll(accessToken || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test suite execution failed');
    }
    setTotalDuration(Math.round(performance.now() - startTime));
  };

  const handleClearResults = () => {
    clearResults();
    setTotalDuration(null);
    setExpandedTestId(null);
    setError(null);
  };

  const handleRunTest = async (id: string) => {
    setError(null);
    try {
      await runTest(id, accessToken || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test execution failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Run All Tests</h1>
          <p className="text-gray-500 mt-1">
            Execute the entire test suite and view comprehensive results
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats.completed > 0 && (
            <Button variant="secondary" onClick={handleClearResults} disabled={isRunning}>
              Clear Results
            </Button>
          )}
          <Button
            onClick={handleRunAll}
            disabled={isRunning}
            loading={isRunning}
            loadingText="Running..."
            className="px-6 py-3 text-lg"
          >
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Progress Bar - Show when running */}
      {isRunning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-900 font-medium">
              Running test {progress.currentIndex + 1} of {progress.total}...
            </span>
            <span className="text-blue-600 text-sm">{Math.round(progress.percentage)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          {currentTestName && (
            <p className="mt-2 text-sm text-blue-700">
              Currently running: <span className="font-medium">{currentTestName}</span>
            </p>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {stats.completed > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-gray-700">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Tests</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-gray-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-700">{stats.passed}</div>
            <div className="text-sm text-green-600">Passed</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-red-700">{stats.failed}</div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
        </div>
      )}

      {/* Total Duration */}
      {totalDuration !== null && !isRunning && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-gray-700 font-medium">Total Duration</span>
          <span className="text-xl sm:text-2xl font-bold text-gray-800">
            {totalDuration < 1000
              ? `${totalDuration}ms`
              : `${(totalDuration / 1000).toFixed(2)}s`}
          </span>
        </div>
      )}

      {/* Filter Buttons */}
      {stats.completed > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 mr-2">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({testCases.length})
          </button>
          <button
            onClick={() => setFilter('passed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'passed'
                ? 'bg-green-600 text-white'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Passed ({stats.passed})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Failed ({stats.failed})
          </button>
        </div>
      )}

      {/* Info Panel - when no results */}
      {stats.completed === 0 && !isRunning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-blue-900 mb-2">Ready to Run Tests</h3>
          <p className="text-blue-700 mb-4">
            Click the "Run All Tests" button to execute {testCases.length} tests across all categories.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(categoryLabels).map(([category, label]) => {
              const count = testCases.filter((t) => t.category === category).length;
              return (
                <span
                  key={category}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                >
                  {label}: {count}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Results List */}
      {(stats.completed > 0 || isRunning) && (
        <div className="space-y-6">
          {Object.entries(testsByCategory).map(([category, tests]) => {
            if (tests.length === 0) return null;

            const categoryResults = tests.filter((t) => results[t.id]);
            const categoryPassed = categoryResults.filter((t) => results[t.id]?.passed).length;
            const categoryFailed = categoryResults.filter((t) => !results[t.id]?.passed).length;

            return (
              <div key={category} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-2 gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {categoryLabels[category as TestCategory]}
                  </h2>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">{tests.length} tests</span>
                    {categoryResults.length > 0 && (
                      <>
                        <span className="text-green-600 flex items-center gap-1">
                          <StatusIndicator status="pass" size="sm" />
                          {categoryPassed}
                        </span>
                        <span className="text-red-600 flex items-center gap-1">
                          <StatusIndicator status="fail" size="sm" />
                          {categoryFailed}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {tests.map((testCase) => (
                    <TestResultRow
                      key={testCase.id}
                      testCase={testCase}
                      result={results[testCase.id]}
                      isRunning={runningTestId === testCase.id}
                      isExpanded={expandedTestId === testCase.id}
                      onToggleExpand={() =>
                        setExpandedTestId(expandedTestId === testCase.id ? null : testCase.id)
                      }
                      onRun={handleRunTest}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      {stats.completed > 0 && !isRunning && (
        <div
          className={`rounded-lg p-4 ${
            stats.failed === 0
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <StatusIndicator status={stats.failed === 0 ? 'pass' : 'fail'} size="lg" />
              <div>
                <h3
                  className={`font-bold text-lg ${
                    stats.failed === 0 ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {stats.failed === 0 ? 'All Tests Passed!' : `${stats.failed} Test(s) Failed`}
                </h3>
                <p className={stats.failed === 0 ? 'text-green-600' : 'text-red-600'}>
                  {stats.passed} of {stats.completed} tests passed
                  {totalDuration !== null && (
                    <span className="ml-2">
                      • Duration:{' '}
                      {totalDuration < 1000
                        ? `${totalDuration}ms`
                        : `${(totalDuration / 1000).toFixed(2)}s`}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button variant={stats.failed === 0 ? 'secondary' : 'primary'} onClick={handleRunAll}>
              Run Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact test result row component
interface TestResultRowProps {
  testCase: (typeof testCases)[number];
  result?: TestResult;
  isRunning: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRun: (id: string) => void;
}

function TestResultRow({
  testCase,
  result,
  isRunning,
  isExpanded,
  onToggleExpand,
  onRun,
}: TestResultRowProps) {
  const getStatusIcon = () => {
    if (isRunning) {
      return (
        <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
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
    if (!result) {
      return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
    return <StatusIndicator status={result.passed ? 'pass' : 'fail'} size="md" />;
  };

  const bgColor = result
    ? result.passed
      ? 'bg-green-50 hover:bg-green-100'
      : 'bg-red-50 hover:bg-red-100'
    : 'bg-gray-50 hover:bg-gray-100';

  return (
    <div className={`rounded-lg border ${result?.passed === false ? 'border-red-300' : 'border-gray-200'}`}>
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 ${bgColor} rounded-t-lg ${
          !isExpanded ? 'rounded-b-lg' : ''
        } cursor-pointer transition-colors gap-2`}
        onClick={result ? onToggleExpand : undefined}
      >
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <span className="font-medium text-gray-900">{testCase.name}</span>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded">{testCase.method}</span>
              <span className="font-mono truncate max-w-[200px] sm:max-w-none">{testCase.endpoint}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-8 sm:ml-0">
          {result && <span className="text-sm text-gray-500">{result.duration}ms</span>}
          {result && (
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onRun(testCase.id);
            }}
            disabled={isRunning}
            loading={isRunning}
            className="text-xs px-2 py-1"
          >
            Run
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && result && (
        <div className="p-3 bg-white border-t border-gray-200 rounded-b-lg space-y-3">
          {/* Request Details */}
          <div className="bg-gray-50 rounded border p-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Request</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-gray-500">URL:</span>{' '}
                <span className="font-mono break-all">{result.request.url}</span>
              </div>
              <div>
                <span className="text-gray-500">Method:</span>{' '}
                <span className="font-mono">{result.request.method}</span>
              </div>
              {result.request.headers && Object.keys(result.request.headers).length > 0 && (
                <div>
                  <span className="text-gray-500">Headers:</span>
                  <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(result.request.headers, null, 2)}
                  </pre>
                </div>
              )}
              {result.request.body && (
                <div>
                  <span className="text-gray-500">Body:</span>
                  <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(result.request.body, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Response Details */}
          <div className="bg-gray-50 rounded border p-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Response</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>{' '}
                <span
                  className={`font-mono font-medium ${
                    result.response.status >= 200 && result.response.status < 300
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {result.response.status}
                </span>
                <span className="text-gray-400 ml-2">
                  (Expected: {testCase.expectedStatus})
                </span>
              </div>
              {result.response.data !== undefined && (
                <div>
                  <span className="text-gray-500">Body:</span>
                  <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                    {JSON.stringify(result.response.data, null, 2)}
                  </pre>
                </div>
              )}
              {result.error && (
                <div>
                  <span className="text-gray-500">Error:</span>
                  <pre className="mt-1 text-xs bg-red-50 p-2 rounded border border-red-200 overflow-x-auto whitespace-pre-wrap break-all text-red-600">
                    {result.error}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Result Summary */}
          <div
            className={`rounded p-3 ${
              result.passed ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <StatusIndicator status={result.passed ? 'pass' : 'fail'} size="sm" />
              <span className={`font-medium ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
                {result.passed
                  ? 'Test Passed'
                  : `Test Failed - Expected ${testCase.expectedStatus}, got ${result.response.status}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
