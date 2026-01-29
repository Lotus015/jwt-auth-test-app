import { useState, useEffect, useMemo } from 'react';
import { Button, Card, CardHeader, CardBody } from '../components';
import { api } from '../services/api';

type SupportedAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
type TokenType = 'access' | 'refresh';

const ALGORITHMS: SupportedAlgorithm[] = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'];
const TOKEN_TYPES: TokenType[] = ['access', 'refresh'];

// Helper to format remaining time
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

// Default payload template
const DEFAULT_PAYLOAD = JSON.stringify(
  {
    sub: '1234567890',
    name: 'John Doe',
    admin: true,
    iat: Math.floor(Date.now() / 1000),
  },
  null,
  2
);

export function TokenPlayground() {
  // Sign Token state
  const [signPayload, setSignPayload] = useState(DEFAULT_PAYLOAD);
  const [signAlgorithm, setSignAlgorithm] = useState<SupportedAlgorithm>('HS256');
  const [signTokenType, setSignTokenType] = useState<TokenType>('access');
  const [signedToken, setSignedToken] = useState<string | null>(null);
  const [signError, setSignError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Verify/Decode state
  const [tokenInput, setTokenInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    payload?: Record<string, unknown>;
    error?: string;
  } | null>(null);
  const [decodeResult, setDecodeResult] = useState<{
    header: Record<string, unknown> | null;
    payload: Record<string, unknown> | null;
    signature: string | null;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);

  // Expiration countdown
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Get expiration from decoded payload
  const expirationTimestamp = useMemo(() => {
    if (decodeResult?.payload && typeof decodeResult.payload.exp === 'number') {
      return decodeResult.payload.exp;
    }
    if (verifyResult?.payload && typeof verifyResult.payload.exp === 'number') {
      return verifyResult.payload.exp;
    }
    return null;
  }, [decodeResult, verifyResult]);

  // Update expiration countdown
  useEffect(() => {
    if (expirationTimestamp === null) {
      setTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = expirationTimestamp - now;
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [expirationTimestamp]);

  // Handle sign token
  const handleSign = async () => {
    setSignError(null);
    setSignedToken(null);

    // Validate JSON payload
    let parsedPayload: Record<string, unknown>;
    try {
      parsedPayload = JSON.parse(signPayload);
    } catch {
      setSignError('Invalid JSON payload');
      return;
    }

    setIsSigning(true);
    try {
      const response = await api.post('/util/sign', {
        payload: parsedPayload,
        algorithm: signAlgorithm,
        tokenType: signTokenType,
      });

      const data = response.data as { token: string; algorithm: string; tokenType: string };
      if (data.token) {
        setSignedToken(data.token);
      } else {
        setSignError('Failed to generate token');
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } }; message: string };
      setSignError(axiosError.response?.data?.message || axiosError.message || 'Sign failed');
    } finally {
      setIsSigning(false);
    }
  };

  // Handle copy token
  const handleCopy = async () => {
    if (signedToken) {
      await navigator.clipboard.writeText(signedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle verify token
  const handleVerify = async () => {
    if (!tokenInput.trim()) {
      setVerifyResult({ valid: false, error: 'Token is required' });
      return;
    }

    setVerifyResult(null);
    setIsVerifying(true);
    try {
      const response = await api.post('/util/verify', { token: tokenInput.trim() });
      setVerifyResult(response.data as typeof verifyResult);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } }; message: string };
      setVerifyResult({
        valid: false,
        error: axiosError.response?.data?.message || axiosError.message || 'Verify failed',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle decode token
  const handleDecode = async () => {
    if (!tokenInput.trim()) {
      setDecodeResult({ header: null, payload: null, signature: null });
      return;
    }

    setDecodeResult(null);
    setIsDecoding(true);
    try {
      const response = await api.post('/util/decode', { token: tokenInput.trim() });
      setDecodeResult(response.data as typeof decodeResult);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } }; message: string };
      setDecodeResult({
        header: null,
        payload: null,
        signature: axiosError.response?.data?.message || axiosError.message || 'Decode failed',
      });
    } finally {
      setIsDecoding(false);
    }
  };

  // Use signed token in verify/decode
  const handleUseSignedToken = () => {
    if (signedToken) {
      setTokenInput(signedToken);
      setVerifyResult(null);
      setDecodeResult(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Token Playground</h1>
        <p className="text-gray-500 mt-1">
          Create, verify, and decode JWT tokens with different algorithms
        </p>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">How to Use</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <span className="font-semibold">Sign Token:</span> Create a new JWT by providing a JSON payload, selecting an algorithm, and token type
          </li>
          <li>
            <span className="font-semibold">Verify Token:</span> Check if a token is valid and cryptographically signed correctly
          </li>
          <li>
            <span className="font-semibold">Decode Token:</span> Extract header and payload from a token without verification
          </li>
          <li>
            The expiration countdown will show if the token has an <code className="bg-blue-100 px-1 rounded">exp</code> claim
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sign Token Section */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Sign Token</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Payload Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payload (JSON)
                </label>
                <textarea
                  value={signPayload}
                  onChange={(e) => setSignPayload(e.target.value)}
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder='{"sub": "1234", "name": "John"}'
                />
              </div>

              {/* Algorithm and Token Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Algorithm
                  </label>
                  <select
                    value={signAlgorithm}
                    onChange={(e) => setSignAlgorithm(e.target.value as SupportedAlgorithm)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ALGORITHMS.map((alg) => (
                      <option key={alg} value={alg}>
                        {alg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token Type
                  </label>
                  <select
                    value={signTokenType}
                    onChange={(e) => setSignTokenType(e.target.value as TokenType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {TOKEN_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type === 'access' ? 'Access Token (15m)' : 'Refresh Token (7d)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sign Button */}
              <Button onClick={handleSign} disabled={isSigning} className="w-full">
                {isSigning ? 'Signing...' : 'Sign Token'}
              </Button>

              {/* Sign Error */}
              {signError && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <div className="text-sm text-red-800">{signError}</div>
                </div>
              )}

              {/* Signed Token Result */}
              {signedToken && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Generated Token
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUseSignedToken}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Use in Verify/Decode
                      </button>
                      <button
                        onClick={handleCopy}
                        className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                      >
                        {copied ? (
                          <>
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <div className="font-mono text-xs text-gray-700 break-all max-h-32 overflow-auto">
                      {signedToken}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Verify/Decode Section */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Verify / Decode Token</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Token Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token Input
                </label>
                <textarea
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paste a JWT token here..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleVerify} disabled={isVerifying} className="flex-1">
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </Button>
                <Button onClick={handleDecode} disabled={isDecoding} variant="secondary" className="flex-1">
                  {isDecoding ? 'Decoding...' : 'Decode'}
                </Button>
              </div>

              {/* Expiration Countdown */}
              {timeRemaining !== null && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Token Expiration:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        timeRemaining <= 0
                          ? 'bg-red-100 text-red-800'
                          : timeRemaining < 300
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {formatTimeRemaining(timeRemaining)}
                    </span>
                  </div>
                </div>
              )}

              {/* Verify Result */}
              {verifyResult && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Verify Result
                  </label>
                  <div
                    className={`border rounded p-3 ${
                      verifyResult.valid
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {verifyResult.valid ? (
                        <>
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-green-800">Valid Token</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-red-800">Invalid Token</span>
                        </>
                      )}
                    </div>
                    {verifyResult.valid && verifyResult.payload && (
                      <pre className="text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(verifyResult.payload, null, 2)}
                      </pre>
                    )}
                    {verifyResult.error && (
                      <div className="text-sm text-red-700">{verifyResult.error}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Decode Result */}
              {decodeResult && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Decode Result
                  </label>

                  {/* Header */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Header</div>
                    <div className="bg-purple-50 border border-purple-200 rounded p-2">
                      {decodeResult.header ? (
                        <pre className="text-xs text-purple-900 overflow-auto">
                          {JSON.stringify(decodeResult.header, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Unable to decode header</span>
                      )}
                    </div>
                  </div>

                  {/* Payload */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Payload</div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      {decodeResult.payload ? (
                        <pre className="text-xs text-blue-900 overflow-auto max-h-40">
                          {JSON.stringify(decodeResult.payload, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Unable to decode payload</span>
                      )}
                    </div>
                  </div>

                  {/* Signature */}
                  {decodeResult.signature && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Signature</div>
                      <div className="bg-gray-50 border border-gray-200 rounded p-2">
                        <span className="text-xs font-mono text-gray-700 break-all">
                          {decodeResult.signature}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* API Reference */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">API Reference</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded p-3">
              <div className="font-medium text-gray-900 mb-1">POST /util/sign</div>
              <div className="text-xs text-gray-600">
                Signs a payload with the specified algorithm and returns a JWT token
              </div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="font-medium text-gray-900 mb-1">POST /util/verify</div>
              <div className="text-xs text-gray-600">
                Verifies a token's signature and returns validity status with payload
              </div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="font-medium text-gray-900 mb-1">POST /util/decode</div>
              <div className="text-xs text-gray-600">
                Decodes a token without verification, returns header and payload
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
