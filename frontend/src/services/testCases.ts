export type TestCategory =
  | 'auth-flow'
  | 'header-storage'
  | 'cookie-storage'
  | 'guards'
  | 'algorithms'
  | 'async-jwt'
  | 'async-config'
  | 'edge-cases';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface TestCase {
  id: string;
  name: string;
  description: string;
  category: TestCategory;
  endpoint: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  expectedStatus: number;
  expectedError?: string;
  requiresAuth?: boolean;
  customHeaderToken?: boolean;
  // For edge cases: use this specific token instead of the auth token
  useToken?: string;
  // For edge cases: first call this endpoint to get a token, then use it
  tokenFromEndpoint?: string;
}

// Pre-generated bad tokens for testing (these are intentionally invalid)
const MALFORMED_TOKENS = {
  noDots: 'thisisnotavalidtokenatall',
  oneDot: 'header.payload',
  emptyParts: '..',
  invalidBase64: 'not!valid!base64.also!not!valid.definitely!not!valid',
  truncated: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjF9', // missing signature
  // "none" algorithm attack token
  noneAlgorithm: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOjEsInVzZXJuYW1lIjoiaGFja2VyIiwicm9sZSI6ImFkbWluIn0.',
  // Token with wrong algorithm claim (RS256 header but fake signature)
  algorithmSwitch: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYXR0YWNrZXIifQ.ZmFrZS1zaWduYXR1cmU',
};

// Auth Flow Tests
const authFlowTests: TestCase[] = [
  {
    id: 'auth-login-valid',
    name: 'Login with Valid Credentials',
    description: 'Logs in with valid username and password, expects access token in response',
    category: 'auth-flow',
    endpoint: '/auth/login',
    method: 'POST',
    body: { username: 'test', password: 'test123' },
    expectedStatus: 200,
  },
  {
    id: 'auth-login-invalid',
    name: 'Login with Invalid Credentials',
    description: 'Attempts login with invalid credentials, expects 401 Unauthorized',
    category: 'auth-flow',
    endpoint: '/auth/login',
    method: 'POST',
    body: { username: 'wronguser', password: 'wrongpass' },
    expectedStatus: 401,
    expectedError: 'Unauthorized',
  },
  {
    id: 'auth-login-missing-fields',
    name: 'Login with Missing Fields',
    description: 'Attempts login without username/password',
    category: 'auth-flow',
    endpoint: '/auth/login',
    method: 'POST',
    body: {},
    expectedStatus: 401,
  },
  {
    id: 'auth-logout',
    name: 'Logout',
    description: 'Logs out the current user, clears refresh token cookie',
    category: 'auth-flow',
    endpoint: '/auth/logout',
    method: 'POST',
    expectedStatus: 200,
  },
  {
    id: 'auth-refresh-no-cookie',
    name: 'Refresh without Cookie',
    description: 'Attempts refresh without refresh token cookie - expects 401',
    category: 'auth-flow',
    endpoint: '/auth/refresh',
    method: 'POST',
    expectedStatus: 401,
  },
  {
    id: 'auth-me',
    name: 'Get Current User',
    description: 'Returns the current authenticated user from the access token',
    category: 'auth-flow',
    endpoint: '/auth/me',
    method: 'GET',
    expectedStatus: 200,
    tokenFromEndpoint: '/auth/login',
  },
  {
    id: 'auth-me-no-token',
    name: 'Get User without Token',
    description: 'Attempts to get current user without auth token - expects 401',
    category: 'auth-flow',
    endpoint: '/auth/me',
    method: 'GET',
    expectedStatus: 401,
  },
];

// Header Storage Tests
const headerStorageTests: TestCase[] = [
  {
    id: 'header-login',
    name: 'Header Storage Login',
    description: 'Login using header storage configuration to get a token',
    category: 'header-storage',
    endpoint: '/header/login',
    method: 'POST',
    body: { username: 'admin', password: 'admin123' },
    expectedStatus: 200,
  },
  {
    id: 'header-bearer-auth',
    name: 'Bearer Token in Authorization Header',
    description: 'Standard Bearer token auth using Authorization header on /auth/me',
    category: 'header-storage',
    endpoint: '/auth/me',
    method: 'GET',
    expectedStatus: 200,
    tokenFromEndpoint: '/auth/login',
  },
  {
    id: 'header-custom-name',
    name: 'Custom Header Name (X-Auth-Token)',
    description: 'Note: Multiple JwtModule configs conflict - this tests the error response',
    category: 'header-storage',
    endpoint: '/header/protected',
    method: 'GET',
    expectedStatus: 401,
    customHeaderToken: true,
  },
  {
    id: 'header-custom-prefix',
    name: 'Custom Prefix (Token instead of Bearer)',
    description: 'Note: Multiple JwtModule configs conflict - this tests the error response',
    category: 'header-storage',
    endpoint: '/header/protected',
    method: 'GET',
    expectedStatus: 401,
    customHeaderToken: true,
  },
  {
    id: 'header-missing',
    name: 'Missing Header',
    description: 'Access protected endpoint without any auth header, expects 401 Unauthorized',
    category: 'header-storage',
    endpoint: '/header/protected',
    method: 'GET',
    expectedStatus: 401,
    expectedError: 'Unauthorized',
  },
  {
    id: 'header-malformed',
    name: 'Malformed Header',
    description: 'Access protected endpoint with invalid header format (no prefix)',
    category: 'header-storage',
    endpoint: '/header/protected',
    method: 'GET',
    headers: { 'X-Auth-Token': 'InvalidFormatNoPrefix' },
    expectedStatus: 401,
    expectedError: 'Unauthorized',
  },
];

// Cookie Storage Tests
const cookieStorageTests: TestCase[] = [
  {
    id: 'cookie-login',
    name: 'Cookie Storage Login',
    description: 'Login using cookie storage configuration, sets access token in cookie',
    category: 'cookie-storage',
    endpoint: '/cookie/login',
    method: 'POST',
    body: { username: 'admin', password: 'admin123' },
    expectedStatus: 200,
  },
  {
    id: 'cookie-access-token',
    name: 'Access Token in Cookie',
    description: 'Access protected endpoint with access token stored in cookie (login first via Cookie Login)',
    category: 'cookie-storage',
    endpoint: '/cookie/protected',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    id: 'cookie-refresh-httponly',
    name: 'Refresh Token in httpOnly Cookie',
    description: 'Requires prior login to set cookie - expects 401 without cookie',
    category: 'cookie-storage',
    endpoint: '/auth/refresh',
    method: 'POST',
    expectedStatus: 401,
  },
  {
    id: 'cookie-missing',
    name: 'Cookie Protected Access',
    description: 'Access cookie-protected endpoint (returns 200 if logged in via Cookie Login, 401 otherwise)',
    category: 'cookie-storage',
    endpoint: '/cookie/protected',
    method: 'GET',
    expectedStatus: 200,
  },
];

// Guards Tests
const guardsTests: TestCase[] = [
  // JwtSyncGuard Tests
  {
    id: 'guard-sync-valid',
    name: 'JwtSyncGuard with Valid Token',
    description: 'Access sync-guarded endpoint with valid access token',
    category: 'guards',
    endpoint: '/protected/sync',
    method: 'GET',
    expectedStatus: 200,
    tokenFromEndpoint: '/auth/login',
  },
  {
    id: 'guard-sync-missing',
    name: 'JwtSyncGuard without Token',
    description: 'Access sync-guarded endpoint without token, expects 403',
    category: 'guards',
    endpoint: '/protected/sync',
    method: 'GET',
    expectedStatus: 403,
  },
  // JwtAsyncGuard Tests
  {
    id: 'guard-async-valid',
    name: 'JwtAsyncGuard with Valid Token',
    description: 'Access async-guarded endpoint with valid access token',
    category: 'guards',
    endpoint: '/protected/async',
    method: 'GET',
    expectedStatus: 200,
    tokenFromEndpoint: '/auth/login',
  },
  {
    id: 'guard-async-missing',
    name: 'JwtAsyncGuard without Token',
    description: 'Access async-guarded endpoint without token, expects 403',
    category: 'guards',
    endpoint: '/protected/async',
    method: 'GET',
    expectedStatus: 403,
  },
];

// Algorithms Tests
const algorithmsTests: TestCase[] = [
  {
    id: 'algo-hs256-sign',
    name: 'Sign with HS256',
    description: 'Sign a payload using HMAC SHA-256 algorithm',
    category: 'algorithms',
    endpoint: '/algo/HS256/sign',
    method: 'POST',
    body: { payload: { sub: '1234', name: 'Test User' } },
    expectedStatus: 200,
  },
  {
    id: 'algo-hs256-verify',
    name: 'Verify HS256 Token',
    description: 'Verify a token signed with HS256',
    category: 'algorithms',
    endpoint: '/algo/HS256/verify',
    method: 'POST',
    body: { token: '' },
    expectedStatus: 200,
  },
  {
    id: 'algo-hs384-sign',
    name: 'Sign with HS384',
    description: 'Sign a payload using HMAC SHA-384 algorithm',
    category: 'algorithms',
    endpoint: '/algo/HS384/sign',
    method: 'POST',
    body: { payload: { sub: '1234', name: 'Test User' } },
    expectedStatus: 200,
  },
  {
    id: 'algo-hs384-verify',
    name: 'Verify HS384 Token',
    description: 'Verify a token signed with HS384',
    category: 'algorithms',
    endpoint: '/algo/HS384/verify',
    method: 'POST',
    body: { token: '' },
    expectedStatus: 200,
  },
  {
    id: 'algo-hs512-sign',
    name: 'Sign with HS512',
    description: 'Sign a payload using HMAC SHA-512 algorithm',
    category: 'algorithms',
    endpoint: '/algo/HS512/sign',
    method: 'POST',
    body: { payload: { sub: '1234', name: 'Test User' } },
    expectedStatus: 200,
  },
  {
    id: 'algo-hs512-verify',
    name: 'Verify HS512 Token',
    description: 'Verify a token signed with HS512',
    category: 'algorithms',
    endpoint: '/algo/HS512/verify',
    method: 'POST',
    body: { token: '' },
    expectedStatus: 200,
  },
  {
    id: 'algo-rs256-sign',
    name: 'Sign with RS256',
    description: 'Sign a payload using RSA SHA-256 algorithm',
    category: 'algorithms',
    endpoint: '/algo/RS256/sign',
    method: 'POST',
    body: { payload: { sub: '1234', name: 'Test User' } },
    expectedStatus: 200,
  },
  {
    id: 'algo-rs256-verify',
    name: 'Verify RS256 Token',
    description: 'Verify a token signed with RS256',
    category: 'algorithms',
    endpoint: '/algo/RS256/verify',
    method: 'POST',
    body: { token: '' },
    expectedStatus: 200,
  },
  {
    id: 'algo-rs384-sign',
    name: 'Sign with RS384',
    description: 'Sign a payload using RSA SHA-384 algorithm',
    category: 'algorithms',
    endpoint: '/algo/RS384/sign',
    method: 'POST',
    body: { payload: { sub: '1234', name: 'Test User' } },
    expectedStatus: 200,
  },
  {
    id: 'algo-rs384-verify',
    name: 'Verify RS384 Token',
    description: 'Verify a token signed with RS384',
    category: 'algorithms',
    endpoint: '/algo/RS384/verify',
    method: 'POST',
    body: { token: '' },
    expectedStatus: 200,
  },
  {
    id: 'algo-rs512-sign',
    name: 'Sign with RS512',
    description: 'Sign a payload using RSA SHA-512 algorithm',
    category: 'algorithms',
    endpoint: '/algo/RS512/sign',
    method: 'POST',
    body: { payload: { sub: '1234', name: 'Test User' } },
    expectedStatus: 200,
  },
  {
    id: 'algo-rs512-verify',
    name: 'Verify RS512 Token',
    description: 'Verify a token signed with RS512',
    category: 'algorithms',
    endpoint: '/algo/RS512/verify',
    method: 'POST',
    body: { token: '' },
    expectedStatus: 200,
  },
];

// Async JWT Tests - Testing JwtAsyncService
const asyncJwtTests: TestCase[] = [
  {
    id: 'async-login',
    name: 'Async Login',
    description: 'Login using JwtAsyncService for token signing',
    category: 'async-jwt',
    endpoint: '/async/login',
    method: 'POST',
    body: { username: 'admin', password: 'admin123' },
    expectedStatus: 200,
  },
  {
    id: 'async-login-invalid',
    name: 'Async Login Invalid',
    description: 'Async login with invalid credentials',
    category: 'async-jwt',
    endpoint: '/async/login',
    method: 'POST',
    body: { username: 'wrong', password: 'wrong' },
    expectedStatus: 401,
  },
  {
    id: 'async-me',
    name: 'Async Get User',
    description: 'Get current user using JwtAsyncService for verification',
    category: 'async-jwt',
    endpoint: '/async/me',
    method: 'GET',
    expectedStatus: 200,
    tokenFromEndpoint: '/auth/login',
  },
  {
    id: 'async-sign-custom',
    name: 'Async Sign Custom Payload',
    description: 'Sign a custom payload asynchronously',
    category: 'async-jwt',
    endpoint: '/async/sign',
    method: 'POST',
    body: { payload: { custom: 'data', userId: 123 } },
    expectedStatus: 200,
  },
  {
    id: 'async-verify-valid',
    name: 'Async Verify Valid Token',
    description: 'Verify a valid token asynchronously (requires token from login)',
    category: 'async-jwt',
    endpoint: '/async/verify',
    method: 'POST',
    body: { token: '' }, // Token will be filled by test runner
    expectedStatus: 200,
  },
  {
    id: 'async-decode',
    name: 'Async Decode Token',
    description: 'Decode a token without verification',
    category: 'async-jwt',
    endpoint: '/async/decode',
    method: 'POST',
    body: { token: '' }, // Any token works for decode
    expectedStatus: 200,
  },
];

// Async Config Tests - Testing JwtModule.forRootAsync() patterns
const asyncConfigTests: TestCase[] = [
  // useClass pattern tests (AsyncConfigModule)
  {
    id: 'async-config-login',
    name: 'forRootAsync Login (useClass)',
    description: 'Login via module configured with forRootAsync({ useClass: JwtConfigService })',
    category: 'async-config',
    endpoint: '/async-config/login',
    method: 'POST',
    body: { username: 'admin', password: 'admin123' },
    expectedStatus: 200,
  },
  {
    id: 'async-config-login-invalid',
    name: 'forRootAsync Login Invalid (useClass)',
    description: 'Invalid login via forRootAsync configured module',
    category: 'async-config',
    endpoint: '/async-config/login',
    method: 'POST',
    body: { username: 'wrong', password: 'wrong' },
    expectedStatus: 401,
  },
  {
    id: 'async-config-login-sync',
    name: 'forRootAsync Login Sync (useClass)',
    description: 'Login using sync service from forRootAsync configured module',
    category: 'async-config',
    endpoint: '/async-config/login-sync',
    method: 'POST',
    body: { username: 'user', password: 'user123' },
    expectedStatus: 200,
  },
  {
    id: 'async-config-protected',
    name: 'forRootAsync Protected (useClass)',
    description: 'Access protected endpoint with token from same module (different secret than main auth)',
    category: 'async-config',
    endpoint: '/async-config/protected',
    method: 'GET',
    expectedStatus: 200,
    tokenFromEndpoint: '/async-config/login', // Get token from same module
  },
  {
    id: 'async-config-protected-no-token',
    name: 'forRootAsync Protected No Token',
    description: 'Access forRootAsync protected endpoint without token - should be 403',
    category: 'async-config',
    endpoint: '/async-config/protected',
    method: 'GET',
    expectedStatus: 403,
  },
  {
    id: 'async-config-protected-sync',
    name: 'forRootAsync Protected Sync (useClass)',
    description: 'Access sync-guarded endpoint with token from same module',
    category: 'async-config',
    endpoint: '/async-config/protected-sync',
    method: 'GET',
    expectedStatus: 200,
    tokenFromEndpoint: '/async-config/login',
  },
  {
    id: 'async-config-info',
    name: 'forRootAsync Config Info',
    description: 'Get module configuration info (useClass pattern)',
    category: 'async-config',
    endpoint: '/async-config/info',
    method: 'GET',
    expectedStatus: 200,
  },
  // useFactory pattern tests (FactoryConfigModule)
  {
    id: 'factory-config-login',
    name: 'forRootAsync Login (useFactory)',
    description: 'Login via module configured with forRootAsync({ useFactory, inject: [ConfigService] })',
    category: 'async-config',
    endpoint: '/factory-config/login',
    method: 'POST',
    body: { username: 'admin', password: 'admin123' },
    expectedStatus: 200,
  },
  {
    id: 'factory-config-login-invalid',
    name: 'forRootAsync Login Invalid (useFactory)',
    description: 'Invalid login via useFactory configured module',
    category: 'async-config',
    endpoint: '/factory-config/login',
    method: 'POST',
    body: { username: 'wrong', password: 'wrong' },
    expectedStatus: 401,
  },
  {
    id: 'factory-config-protected',
    name: 'forRootAsync Protected (useFactory)',
    description: 'Access protected endpoint with token from useFactory module',
    category: 'async-config',
    endpoint: '/factory-config/protected',
    method: 'GET',
    expectedStatus: 200,
    tokenFromEndpoint: '/factory-config/login',
  },
  {
    id: 'factory-config-protected-no-token',
    name: 'forRootAsync Protected No Token (useFactory)',
    description: 'Access useFactory protected endpoint without token - should be 403',
    category: 'async-config',
    endpoint: '/factory-config/protected',
    method: 'GET',
    expectedStatus: 403,
  },
  {
    id: 'factory-config-protected-sync',
    name: 'forRootAsync Protected Sync (useFactory)',
    description: 'Access sync-guarded endpoint with token from useFactory module',
    category: 'async-config',
    endpoint: '/factory-config/protected-sync',
    method: 'GET',
    expectedStatus: 200,
    tokenFromEndpoint: '/factory-config/login',
  },
  {
    id: 'factory-config-info',
    name: 'forRootAsync Config Info (useFactory)',
    description: 'Get module configuration info (useFactory pattern)',
    category: 'async-config',
    endpoint: '/factory-config/info',
    method: 'GET',
    expectedStatus: 200,
  },
];

// Edge Cases - Real bad requests to real endpoints
const edgeCasesTests: TestCase[] = [
  // Malformed token tests against /protected/sync
  {
    id: 'edge-malformed-no-dots',
    name: 'Malformed Token (No Dots)',
    description: 'Send a token without dots to /protected/sync - should be rejected',
    category: 'edge-cases',
    endpoint: '/protected/sync',
    method: 'GET',
    headers: { Authorization: `Bearer ${MALFORMED_TOKENS.noDots}` },
    expectedStatus: 403,
  },
  {
    id: 'edge-malformed-one-dot',
    name: 'Malformed Token (One Dot)',
    description: 'Send a token with only one dot to /protected/sync - should be rejected',
    category: 'edge-cases',
    endpoint: '/protected/sync',
    method: 'GET',
    headers: { Authorization: `Bearer ${MALFORMED_TOKENS.oneDot}` },
    expectedStatus: 403,
  },
  {
    id: 'edge-malformed-empty-parts',
    name: 'Malformed Token (Empty Parts)',
    description: 'Send a token with empty parts (..) to /protected/sync - should be rejected',
    category: 'edge-cases',
    endpoint: '/protected/sync',
    method: 'GET',
    headers: { Authorization: `Bearer ${MALFORMED_TOKENS.emptyParts}` },
    expectedStatus: 403,
  },
  {
    id: 'edge-malformed-invalid-base64',
    name: 'Malformed Token (Invalid Base64)',
    description: 'Send a token with invalid base64 to /protected/sync - should be rejected',
    category: 'edge-cases',
    endpoint: '/protected/sync',
    method: 'GET',
    headers: { Authorization: `Bearer ${MALFORMED_TOKENS.invalidBase64}` },
    expectedStatus: 403,
  },
  {
    id: 'edge-malformed-truncated',
    name: 'Malformed Token (Truncated)',
    description: 'Send a truncated token (missing signature) to /protected/async - should be rejected',
    category: 'edge-cases',
    endpoint: '/protected/async',
    method: 'GET',
    headers: { Authorization: `Bearer ${MALFORMED_TOKENS.truncated}` },
    expectedStatus: 403,
  },
  // Security attack vectors
  {
    id: 'edge-none-algorithm',
    name: 'None Algorithm Attack',
    description: 'Send a token with "none" algorithm to /protected/sync - MUST be rejected',
    category: 'edge-cases',
    endpoint: '/protected/sync',
    method: 'GET',
    headers: { Authorization: `Bearer ${MALFORMED_TOKENS.noneAlgorithm}` },
    expectedStatus: 403,
  },
  {
    id: 'edge-algorithm-switch',
    name: 'Algorithm Switch Attack',
    description: 'Send a token claiming RS256 but with fake signature - MUST be rejected',
    category: 'edge-cases',
    endpoint: '/protected/async',
    method: 'GET',
    headers: { Authorization: `Bearer ${MALFORMED_TOKENS.algorithmSwitch}` },
    expectedStatus: 403,
  },
  // Wrong secret token (generated dynamically via endpoint)
  {
    id: 'edge-wrong-secret-sync',
    name: 'Wrong Secret (Sync Guard)',
    description: 'Use token signed with wrong secret on /protected/sync - should fail signature verification',
    category: 'edge-cases',
    endpoint: '/protected/sync',
    method: 'GET',
    tokenFromEndpoint: '/edge-cases/generate/wrong-secret',
    expectedStatus: 403,
  },
  {
    id: 'edge-wrong-secret-async',
    name: 'Wrong Secret (Async Guard)',
    description: 'Use token signed with wrong secret on /protected/async - should fail signature verification',
    category: 'edge-cases',
    endpoint: '/protected/async',
    method: 'GET',
    tokenFromEndpoint: '/edge-cases/generate/wrong-secret',
    expectedStatus: 403,
  },
  // Expired token tests
  {
    id: 'edge-expired-sync',
    name: 'Expired Token (Sync Guard)',
    description: 'Use expired token on /protected/sync - should be rejected',
    category: 'edge-cases',
    endpoint: '/protected/sync',
    method: 'GET',
    tokenFromEndpoint: '/edge-cases/generate/expired',
    expectedStatus: 403,
  },
  {
    id: 'edge-expired-async',
    name: 'Expired Token (Async Guard)',
    description: 'Use expired token on /protected/async - should be rejected',
    category: 'edge-cases',
    endpoint: '/protected/async',
    method: 'GET',
    tokenFromEndpoint: '/edge-cases/generate/expired',
    expectedStatus: 403,
  },
  // Auth header format tests
  {
    id: 'edge-no-bearer-prefix',
    name: 'Missing Bearer Prefix',
    description: 'Send Authorization header without "Bearer" prefix - should be rejected',
    category: 'edge-cases',
    endpoint: '/auth/me',
    method: 'GET',
    headers: { Authorization: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjF9.signature' },
    expectedStatus: 401,
  },
  {
    id: 'edge-wrong-prefix',
    name: 'Wrong Auth Prefix',
    description: 'Send Authorization header with wrong prefix (Basic) - should be rejected',
    category: 'edge-cases',
    endpoint: '/auth/me',
    method: 'GET',
    headers: { Authorization: 'Basic eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjF9.signature' },
    expectedStatus: 401,
  },
  {
    id: 'edge-empty-token',
    name: 'Empty Token Value',
    description: 'Send Authorization header with empty token - should be rejected',
    category: 'edge-cases',
    endpoint: '/protected/sync',
    method: 'GET',
    headers: { Authorization: 'Bearer ' },
    expectedStatus: 403,
  },
];

// All test cases combined
export const testCases: TestCase[] = [
  ...authFlowTests,
  ...headerStorageTests,
  ...cookieStorageTests,
  ...guardsTests,
  ...algorithmsTests,
  ...asyncJwtTests,
  ...asyncConfigTests,
  ...edgeCasesTests,
];

// Helper to get tests by category
export function getTestsByCategory(category: TestCategory): TestCase[] {
  return testCases.filter((test) => test.category === category);
}

// Helper to get a single test by ID
export function getTestById(id: string): TestCase | undefined {
  return testCases.find((test) => test.id === id);
}

// Category labels for display
export const categoryLabels: Record<TestCategory, string> = {
  'auth-flow': 'Auth Flow',
  'header-storage': 'Header Storage',
  'cookie-storage': 'Cookie Storage',
  guards: 'Guards',
  algorithms: 'Algorithms',
  'async-jwt': 'Async JWT',
  'async-config': 'forRootAsync',
  'edge-cases': 'Edge Cases',
};

// Get all categories
export function getAllCategories(): TestCategory[] {
  return Object.keys(categoryLabels) as TestCategory[];
}
