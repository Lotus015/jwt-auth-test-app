import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { testCases, TestCase, TestCategory, getTestById, getTestsByCategory } from '../services/testCases';
import { AxiosError, AxiosRequestConfig, Method } from 'axios';

export interface TestResult {
  testId: string;
  passed: boolean;
  duration: number;
  request: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
  };
  response: {
    status: number;
    data?: unknown;
  };
  error?: string;
}

interface UseTestRunnerReturn {
  runTest: (id: string, accessToken?: string, customToken?: string) => Promise<TestResult>;
  runCategory: (category: TestCategory, accessToken?: string) => Promise<TestResult[]>;
  runAll: (accessToken?: string) => Promise<TestResult[]>;
  results: Record<string, TestResult>;
  isRunning: boolean;
  runningTestId: string | null;
  clearResults: () => void;
}

export function useTestRunner(): UseTestRunnerReturn {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);

  const executeTest = useCallback(
    async (testCase: TestCase, accessToken?: string, customToken?: string): Promise<TestResult> => {
      const startTime = performance.now();

      const config: AxiosRequestConfig = {
        url: testCase.endpoint,
        method: testCase.method as Method,
        headers: { ...testCase.headers },
        data: testCase.body,
      };

      // Add Authorization header if test requires auth
      if (testCase.requiresAuth && accessToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }

      // Add custom header token for header storage tests
      if (testCase.customHeaderToken && customToken) {
        config.headers = {
          ...config.headers,
          'X-Auth-Token': `Token ${customToken}`,
        };
      }

      try {
        const response = await api.request(config);
        const duration = Math.round(performance.now() - startTime);

        const passed = response.status === testCase.expectedStatus;

        return {
          testId: testCase.id,
          passed,
          duration,
          request: {
            url: testCase.endpoint,
            method: testCase.method,
            headers: config.headers as Record<string, string>,
            body: testCase.body,
          },
          response: {
            status: response.status,
            data: response.data,
          },
        };
      } catch (err) {
        const duration = Math.round(performance.now() - startTime);
        const axiosError = err as AxiosError;

        const status = axiosError.response?.status || 0;
        const responseData = axiosError.response?.data;

        // Check if the error status matches expected status (for error scenario tests)
        const passed = status === testCase.expectedStatus;

        return {
          testId: testCase.id,
          passed,
          duration,
          request: {
            url: testCase.endpoint,
            method: testCase.method,
            headers: config.headers as Record<string, string>,
            body: testCase.body,
          },
          response: {
            status,
            data: responseData,
          },
          error: axiosError.message,
        };
      }
    },
    []
  );

  const runTest = useCallback(
    async (id: string, accessToken?: string, customToken?: string): Promise<TestResult> => {
      const testCase = getTestById(id);
      if (!testCase) {
        throw new Error(`Test case not found: ${id}`);
      }

      setIsRunning(true);
      setRunningTestId(id);

      try {
        const result = await executeTest(testCase, accessToken, customToken);
        setResults((prev) => ({ ...prev, [id]: result }));
        return result;
      } finally {
        setIsRunning(false);
        setRunningTestId(null);
      }
    },
    [executeTest]
  );

  const runCategory = useCallback(
    async (category: TestCategory, accessToken?: string): Promise<TestResult[]> => {
      const categoryTests = getTestsByCategory(category);
      const categoryResults: TestResult[] = [];

      setIsRunning(true);

      for (const testCase of categoryTests) {
        setRunningTestId(testCase.id);
        const result = await executeTest(testCase, accessToken);
        setResults((prev) => ({ ...prev, [testCase.id]: result }));
        categoryResults.push(result);
      }

      setIsRunning(false);
      setRunningTestId(null);

      return categoryResults;
    },
    [executeTest]
  );

  const runAll = useCallback(
    async (accessToken?: string): Promise<TestResult[]> => {
      const allResults: TestResult[] = [];

      setIsRunning(true);

      for (const testCase of testCases) {
        setRunningTestId(testCase.id);
        const result = await executeTest(testCase, accessToken);
        setResults((prev) => ({ ...prev, [testCase.id]: result }));
        allResults.push(result);
      }

      setIsRunning(false);
      setRunningTestId(null);

      return allResults;
    },
    [executeTest]
  );

  const clearResults = useCallback(() => {
    setResults({});
  }, []);

  return {
    runTest,
    runCategory,
    runAll,
    results,
    isRunning,
    runningTestId,
    clearResults,
  };
}
