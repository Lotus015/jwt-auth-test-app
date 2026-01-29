import { useState } from 'react';
import { getTestsByCategory } from '../services/testCases';
import { TestCard } from '../components/TestCard';
import { Button } from '../components';
import { useTestRunner, TestResult } from '../hooks/useTestRunner';
import { api } from '../services/api';

type AlgorithmTab = 'hmac' | 'rsa';

// HMAC algorithms
const HMAC_ALGORITHMS = ['HS256', 'HS384', 'HS512'] as const;
// RSA algorithms
const RSA_ALGORITHMS = ['RS256', 'RS384', 'RS512'] as const;

export function Algorithms() {
  const algorithmsTests = getTestsByCategory('algorithms');
  const { runTest, results, isRunning, runningTestId } = useTestRunner();
  const [activeTab, setActiveTab] = useState<AlgorithmTab>('hmac');
  const [signedTokens, setSignedTokens] = useState<Record<string, string>>({});

  // Get tests for a specific algorithm
  const getAlgorithmTests = (alg: string) => {
    return algorithmsTests.filter((t) => t.id.includes(alg.toLowerCase()));
  };

  // Run sign test and store the token
  const handleSignTest = async (alg: string) => {
    const testId = `algo-${alg.toLowerCase()}-sign`;
    const result = await runTest(testId);

    // Store the signed token for verify tests
    if (result.passed && result.response.data) {
      const data = result.response.data as { token?: string };
      if (data.token) {
        setSignedTokens((prev) => ({ ...prev, [alg]: data.token! }));
      }
    }

    return result;
  };

  // Run verify test with the previously signed token
  const handleVerifyTest = async (alg: string) => {
    const token = signedTokens[alg];

    // If no token, first sign one
    if (!token) {
      const signResult = await handleSignTest(alg);
      if (!signResult.passed) {
        return signResult;
      }
    }

    const currentToken = signedTokens[alg] || (await getSignedToken(alg));
    if (!currentToken) {
      return;
    }

    // Make direct API call for verify with the token
    const testId = `algo-${alg.toLowerCase()}-verify`;
    const result = await runVerifyTest(testId, currentToken);
    return result;
  };

  // Get a signed token for an algorithm
  const getSignedToken = async (alg: string): Promise<string | null> => {
    try {
      const response = await api.post(`/algo/${alg}/sign`, {
        payload: { sub: '1234', name: 'Test User' },
      });
      const token = response.data.token;
      setSignedTokens((prev) => ({ ...prev, [alg]: token }));
      return token;
    } catch {
      return null;
    }
  };

  // Custom verify test that uses the token
  const runVerifyTest = async (testId: string, token: string): Promise<TestResult> => {
    const startTime = performance.now();
    const alg = testId.split('-')[1].toUpperCase();

    try {
      const response = await api.post(`/algo/${alg}/verify`, { token });
      const duration = Math.round(performance.now() - startTime);

      return {
        testId,
        passed: response.status === 201,
        duration,
        request: {
          url: `/algo/${alg}/verify`,
          method: 'POST',
          body: { token },
        },
        response: {
          status: response.status,
          data: response.data,
        },
      };
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      const axiosError = err as { response?: { status: number; data: unknown }; message: string };

      return {
        testId,
        passed: false,
        duration,
        request: {
          url: `/algo/${alg}/verify`,
          method: 'POST',
          body: { token },
        },
        response: {
          status: axiosError.response?.status || 0,
          data: axiosError.response?.data,
        },
        error: axiosError.message,
      };
    }
  };

  // Handle running a test (dispatch to sign or verify handler)
  const handleRunTest = async (testId: string) => {
    const alg = testId.split('-')[1].toUpperCase();

    if (testId.includes('-sign')) {
      await handleSignTest(alg);
    } else if (testId.includes('-verify')) {
      await handleVerifyTest(alg);
    }
  };

  // Run all tests for an algorithm (sign then verify)
  const handleRunAlgorithm = async (alg: string) => {
    await handleSignTest(alg);
    await handleVerifyTest(alg);
  };

  // Run all HMAC tests
  const handleRunHmacTests = async () => {
    for (const alg of HMAC_ALGORITHMS) {
      await handleRunAlgorithm(alg);
    }
  };

  // Run all RSA tests
  const handleRunRsaTests = async () => {
    for (const alg of RSA_ALGORITHMS) {
      await handleRunAlgorithm(alg);
    }
  };

  // Run all algorithm tests
  const handleRunAll = async () => {
    if (activeTab === 'hmac') {
      await handleRunHmacTests();
    } else {
      await handleRunRsaTests();
    }
  };

  // Render algorithm section
  const renderAlgorithmSection = (alg: string) => {
    const tests = getAlgorithmTests(alg);
    const signTest = tests.find((t) => t.id.includes('-sign'));
    const verifyTest = tests.find((t) => t.id.includes('-verify'));
    const token = signedTokens[alg];

    return (
      <div key={alg} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{alg}</h3>
          <Button
            variant="secondary"
            onClick={() => handleRunAlgorithm(alg)}
            disabled={isRunning}
            className="text-sm"
          >
            Run {alg} Tests
          </Button>
        </div>

        {/* Token display for this algorithm */}
        {token && (
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <div className="text-xs font-medium text-gray-500 mb-1">Signed Token:</div>
            <div className="font-mono text-xs text-gray-700 break-all">
              {token.substring(0, 80)}...
            </div>
          </div>
        )}

        {/* Test cards */}
        <div className="space-y-2">
          {signTest && (
            <TestCard
              testCase={signTest}
              result={results[signTest.id]}
              onRun={handleRunTest}
              isRunning={runningTestId === signTest.id}
            />
          )}
          {verifyTest && (
            <TestCard
              testCase={verifyTest}
              result={results[verifyTest.id]}
              onRun={handleRunTest}
              isRunning={runningTestId === verifyTest.id}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Algorithms Tests</h1>
          <p className="text-gray-500 mt-1">
            Test JWT signing and verification with all supported algorithms
          </p>
        </div>
        <Button onClick={handleRunAll} disabled={isRunning}>
          {isRunning ? 'Running...' : `Run All ${activeTab === 'hmac' ? 'HMAC' : 'RSA'}`}
        </Button>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Algorithm Types</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <span className="font-semibold">HMAC (HS256, HS384, HS512)</span> - Symmetric algorithms using a shared secret key
          </li>
          <li>
            <span className="font-semibold">RSA (RS256, RS384, RS512)</span> - Asymmetric algorithms using public/private key pairs
          </li>
          <li>
            The number (256, 384, 512) indicates the hash function bit size
          </li>
        </ul>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('hmac')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'hmac'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            HMAC Algorithms
          </button>
          <button
            onClick={() => setActiveTab('rsa')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rsa'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            RSA Algorithms
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'hmac' ? (
          <>
            {/* HMAC Tab Header */}
            <div className="flex items-center justify-between">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex-1">
                <h4 className="font-medium text-yellow-900 text-sm">HMAC (Hash-based Message Authentication Code)</h4>
                <p className="text-xs text-yellow-800 mt-1">
                  Uses a symmetric secret key for both signing and verification.
                  Fast and suitable for trusted environments where the key can be securely shared.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleRunHmacTests}
                disabled={isRunning}
                className="ml-4"
              >
                Run All HMAC
              </Button>
            </div>

            {/* HMAC Algorithm Sections */}
            {HMAC_ALGORITHMS.map((alg) => renderAlgorithmSection(alg))}
          </>
        ) : (
          <>
            {/* RSA Tab Header */}
            <div className="flex items-center justify-between">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex-1">
                <h4 className="font-medium text-purple-900 text-sm">RSA (Rivest-Shamir-Adleman)</h4>
                <p className="text-xs text-purple-800 mt-1">
                  Uses asymmetric cryptography with a private key for signing and public key for verification.
                  Ideal for distributed systems where only verification needs to be public.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleRunRsaTests}
                disabled={isRunning}
                className="ml-4"
              >
                Run All RSA
              </Button>
            </div>

            {/* RSA Algorithm Sections */}
            {RSA_ALGORITHMS.map((alg) => renderAlgorithmSection(alg))}
          </>
        )}
      </div>
    </div>
  );
}
