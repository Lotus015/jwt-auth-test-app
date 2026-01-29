export type TestCategory =
  | 'auth-flow'
  | 'header-storage'
  | 'cookie-storage'
  | 'guards'
  | 'algorithms'
  | 'error-scenarios';

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
}

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
    expectedStatus: 201,
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
    id: 'auth-logout',
    name: 'Logout',
    description: 'Logs out the current user, clears refresh token cookie',
    category: 'auth-flow',
    endpoint: '/auth/logout',
    method: 'POST',
    expectedStatus: 200,
  },
  {
    id: 'auth-refresh',
    name: 'Refresh Token',
    description: 'Gets a new access token using the refresh token cookie',
    category: 'auth-flow',
    endpoint: '/auth/refresh',
    method: 'POST',
    expectedStatus: 201,
  },
  {
    id: 'auth-me',
    name: 'Get Current User',
    description: 'Returns the current authenticated user from the access token',
    category: 'auth-flow',
    endpoint: '/auth/me',
    method: 'GET',
    expectedStatus: 200,
    requiresAuth: true,
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
    requiresAuth: true,
  },
  {
    id: 'header-custom-name',
    name: 'Custom Header Name (X-Auth-Token)',
    description: 'Access protected endpoint using X-Auth-Token custom header name',
    category: 'header-storage',
    endpoint: '/header/protected',
    method: 'GET',
    expectedStatus: 200,
    customHeaderToken: true,
  },
  {
    id: 'header-custom-prefix',
    name: 'Custom Prefix (Token instead of Bearer)',
    description: 'Token sent with "Token" prefix instead of "Bearer" prefix',
    category: 'header-storage',
    endpoint: '/header/protected',
    method: 'GET',
    expectedStatus: 200,
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
    description: 'Access protected endpoint with access token stored in cookie',
    category: 'cookie-storage',
    endpoint: '/cookie/protected',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    id: 'cookie-refresh-httponly',
    name: 'Refresh Token in httpOnly Cookie',
    description: 'Refresh endpoint using httpOnly cookie (not visible in JS but sent automatically)',
    category: 'cookie-storage',
    endpoint: '/auth/refresh',
    method: 'POST',
    expectedStatus: 201,
  },
  {
    id: 'cookie-missing',
    name: 'Missing Cookie Error',
    description: 'Access protected endpoint without cookie, expects 401 Unauthorized',
    category: 'cookie-storage',
    endpoint: '/cookie/protected',
    method: 'GET',
    expectedStatus: 401,
    expectedError: 'Unauthorized',
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
    requiresAuth: true,
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
  {
    id: 'guard-sync-expired',
    name: 'JwtSyncGuard with Expired Token',
    description: 'Access sync-guarded endpoint with expired token, expects 403',
    category: 'guards',
    endpoint: '/protected/sync',
    method: 'GET',
    expectedStatus: 403,
  },
  {
    id: 'guard-sync-invalid-signature',
    name: 'JwtSyncGuard with Invalid Signature',
    description: 'Access sync-guarded endpoint with token signed by wrong secret, expects 403',
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
    requiresAuth: true,
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
  {
    id: 'guard-async-expired',
    name: 'JwtAsyncGuard with Expired Token',
    description: 'Access async-guarded endpoint with expired token, expects 403',
    category: 'guards',
    endpoint: '/protected/async',
    method: 'GET',
    expectedStatus: 403,
  },
  {
    id: 'guard-async-invalid-signature',
    name: 'JwtAsyncGuard with Invalid Signature',
    description: 'Access async-guarded endpoint with token signed by wrong secret, expects 403',
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

// Error Scenarios Tests
const errorScenariosTests: TestCase[] = [
  {
    id: 'error-secret-key',
    name: 'SecretKeyError',
    description: 'Triggers SecretKeyError when secret key is misconfigured',
    category: 'error-scenarios',
    endpoint: '/error/secret-key',
    method: 'GET',
    expectedStatus: 500,
    expectedError: 'SecretKeyError',
  },
  {
    id: 'error-undefined-token',
    name: 'UndefinedTokenError',
    description: 'Triggers UndefinedTokenError when token is missing',
    category: 'error-scenarios',
    endpoint: '/error/undefined-token',
    method: 'GET',
    expectedStatus: 401,
    expectedError: 'UndefinedTokenError',
  },
  {
    id: 'error-wrong-header',
    name: 'WrongAuthHeaderTypeError',
    description: 'Triggers WrongAuthHeaderTypeError when header format is invalid',
    category: 'error-scenarios',
    endpoint: '/error/wrong-header',
    method: 'GET',
    expectedStatus: 400,
    expectedError: 'WrongAuthHeaderTypeError',
  },
  {
    id: 'error-empty-cookie',
    name: 'EmptyCookieError',
    description: 'Triggers EmptyCookieError when cookie is empty or missing',
    category: 'error-scenarios',
    endpoint: '/error/empty-cookie',
    method: 'GET',
    expectedStatus: 401,
    expectedError: 'EmptyCookieError',
  },
  {
    id: 'error-refresh-token',
    name: 'RefreshTokenError',
    description: 'Triggers RefreshTokenError when refresh token is invalid',
    category: 'error-scenarios',
    endpoint: '/error/refresh-token',
    method: 'GET',
    expectedStatus: 500,
    expectedError: 'RefreshTokenError',
  },
];

// All test cases combined
export const testCases: TestCase[] = [
  ...authFlowTests,
  ...headerStorageTests,
  ...cookieStorageTests,
  ...guardsTests,
  ...algorithmsTests,
  ...errorScenariosTests,
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
  'error-scenarios': 'Error Scenarios',
};

// Get all categories
export function getAllCategories(): TestCategory[] {
  return Object.keys(categoryLabels) as TestCategory[];
}
