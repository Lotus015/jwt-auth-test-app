# @block32/jwt-auth - Test Application Implementation Plan

## Overview

This document outlines the plan to create a full-stack test application (NestJS backend + React frontend) to thoroughly test all features, scenarios, and edge cases of the `@block32/jwt-auth` package through an interactive dashboard.

---

## 1. Project Structure

```
jwt-block32-test-app/
├── backend/                             # NestJS API
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   │
│   │   ├── config/
│   │   │   ├── jwt-hmac.config.ts
│   │   │   ├── jwt-rsa.config.ts
│   │   │   └── jwt-async-provider.config.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   │
│   │   ├── protected/
│   │   │   ├── protected.module.ts
│   │   │   └── protected.controller.ts
│   │   │
│   │   ├── scenarios/
│   │   │   ├── scenarios.module.ts
│   │   │   ├── header-storage/
│   │   │   │   ├── header.module.ts
│   │   │   │   └── header.controller.ts
│   │   │   ├── cookie-storage/
│   │   │   │   ├── cookie.module.ts
│   │   │   │   └── cookie.controller.ts
│   │   │   ├── rsa-keys/
│   │   │   │   ├── rsa.module.ts
│   │   │   │   └── rsa.controller.ts
│   │   │   ├── custom-provider/
│   │   │   │   ├── provider.module.ts
│   │   │   │   └── provider.controller.ts
│   │   │   └── algorithms/
│   │   │       ├── algorithms.module.ts
│   │   │       └── algorithms.controller.ts
│   │   │
│   │   └── test-runner/
│   │       ├── test-runner.module.ts
│   │       ├── test-runner.controller.ts
│   │       └── test-runner.service.ts
│   │
│   ├── test/
│   │   └── (e2e test files)
│   │
│   ├── keys/
│   │   ├── private.pem
│   │   └── public.pem
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── frontend/                            # React + Vite Dashboard
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   │
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   │
│   │   │   ├── TestRunner/
│   │   │   │   ├── TestRunner.tsx
│   │   │   │   ├── TestCard.tsx
│   │   │   │   ├── TestResult.tsx
│   │   │   │   └── TestSuite.tsx
│   │   │   │
│   │   │   ├── TokenInspector/
│   │   │   │   ├── TokenInspector.tsx
│   │   │   │   ├── TokenDecoder.tsx
│   │   │   │   └── PayloadViewer.tsx
│   │   │   │
│   │   │   ├── StateViewer/
│   │   │   │   ├── StateViewer.tsx
│   │   │   │   ├── CookieViewer.tsx
│   │   │   │   └── HeaderViewer.tsx
│   │   │   │
│   │   │   └── common/
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── JsonViewer.tsx
│   │   │       └── StatusIndicator.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx            # Overview & quick tests
│   │   │   ├── AuthFlow.tsx             # Login/logout/refresh tests
│   │   │   ├── HeaderStorage.tsx        # Header-based auth tests
│   │   │   ├── CookieStorage.tsx        # Cookie-based auth tests
│   │   │   ├── Guards.tsx               # Guard testing
│   │   │   ├── Algorithms.tsx           # HMAC/RSA algorithm tests
│   │   │   ├── ErrorScenarios.tsx       # Error handling tests
│   │   │   ├── TokenPlayground.tsx      # Manual token operations
│   │   │   └── AllTests.tsx             # Run all tests at once
│   │   │
│   │   ├── hooks/
│   │   │   ├── useApi.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── useTestRunner.ts
│   │   │   └── useTokenState.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── testCases.ts
│   │   │
│   │   ├── types/
│   │   │   ├── test.types.ts
│   │   │   └── api.types.ts
│   │   │
│   │   └── utils/
│   │       ├── jwt.ts                   # Client-side JWT decode
│   │       └── formatters.ts
│   │
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
│
└── README.md
```

---

## 2. Frontend Dashboard Features

### 2.1 Dashboard Overview Page
- **Auth State Panel**: Shows current tokens, decoded payloads, expiration times
- **Quick Actions**: Login, Logout, Refresh buttons
- **Test Summary**: Pass/fail counts, last run time
- **Cookie Inspector**: Real-time cookie values
- **Header Inspector**: Current Authorization header state

### 2.2 Test Categories (Sidebar Navigation)

```
📊 Dashboard
├── 🔐 Auth Flow
│   ├── Login (HMAC)
│   ├── Login (RSA)
│   ├── Logout
│   └── Refresh Token
│
├── 📋 Header Storage
│   ├── Bearer Token
│   ├── Custom Header Name
│   ├── Custom Prefix
│   └── Missing/Invalid Header
│
├── 🍪 Cookie Storage
│   ├── Access Token Cookie
│   ├── Refresh Token Cookie
│   ├── Cookie Options
│   └── Missing Cookie
│
├── 🛡️ Guards
│   ├── JwtSyncGuard
│   ├── JwtAsyncGuard
│   ├── Valid Token
│   ├── Invalid Token
│   └── Expired Token
│
├── 🔑 Algorithms
│   ├── HS256 / HS384 / HS512
│   └── RS256 / RS384 / RS512
│
├── ⚠️ Error Scenarios
│   ├── SecretKeyError
│   ├── UndefinedTokenError
│   ├── WrongAuthHeaderTypeError
│   └── All Other Errors
│
├── 🧪 Token Playground
│   ├── Sign Token
│   ├── Verify Token
│   ├── Decode Token
│   └── Custom Payload
│
└── 🚀 Run All Tests
```

### 2.3 Test Card UI

Each test scenario displays as a card:

```
┌─────────────────────────────────────────────────────────┐
│  [▶ Run]  Sign Access Token (HMAC HS256)      [✓ Pass] │
├─────────────────────────────────────────────────────────┤
│  Service: JwtAsyncService                               │
│  Method: signAccessAsync()                              │
│  Payload: { sub: "user123", role: "admin" }            │
├─────────────────────────────────────────────────────────┤
│  Result:                                                │
│  ┌────────────────────────────────────────────────────┐│
│  │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiO... ││
│  └────────────────────────────────────────────────────┘│
│                                                         │
│  Decoded:                                               │
│  { "sub": "user123", "role": "admin", "iat": 1706... } │
│                                                         │
│  Duration: 12ms                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.4 State Viewer Panel (Always Visible)

```
┌─────────────────────────────────────────────────────────┐
│  🔐 Current Auth State                                  │
├─────────────────────────────────────────────────────────┤
│  Access Token:  eyJhbGci... (expires in 14:32)         │
│  Refresh Token: eyJhbGci... (expires in 6d 23h)        │
│                                                         │
│  Cookies:                                               │
│  ├── __Host-access-token: ✓ Present                   │
│  └── __Host-refresh-token: ✓ Present (httpOnly)       │
│                                                         │
│  Headers:                                               │
│  └── Authorization: Bearer eyJhbGci...                 │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Test Scenarios to Cover

### 3.1 Token Signing & Verification

| Scenario | Service | Algorithm | Expected Outcome |
|----------|---------|-----------|------------------|
| Sign access token with HMAC | JwtSyncService | HS256 | Valid JWT returned |
| Sign access token with HMAC | JwtAsyncService | HS256 | Valid JWT returned |
| Sign refresh token with HMAC | JwtSyncService | HS256 | Valid JWT returned |
| Sign refresh token with HMAC | JwtAsyncService | HS256 | Valid JWT returned |
| Verify valid access token | JwtSyncService | HS256 | Payload returned |
| Verify valid access token | JwtAsyncService | HS256 | Payload returned |
| Verify expired token | Both | HS256 | TokenExpiredError |
| Verify invalid signature | Both | HS256 | JsonWebTokenError |
| Verify malformed token | Both | HS256 | JsonWebTokenError |
| Sign with RSA private key | JwtAsyncService | RS256 | Valid JWT returned |
| Verify with RSA public key | JwtAsyncService | RS256 | Payload returned |
| Sign with custom provider | JwtAsyncService | Any | Valid JWT returned |
| Decode without verification | Both | Any | Payload returned |

### 3.2 Token Storage (Header)

| Scenario | Expected Outcome |
|----------|------------------|
| Set token to Authorization header | Header set with "Bearer {token}" |
| Get token from Authorization header | Token extracted correctly |
| Custom header name | Uses custom header name |
| Custom prefix (not Bearer) | Uses custom prefix |
| Missing Authorization header | UndefinedTokenError |
| Wrong header format | WrongAuthHeaderTypeError |
| Empty header value | UndefinedTokenError |

### 3.3 Token Storage (Cookie)

| Scenario | Expected Outcome |
|----------|------------------|
| Set access token to cookie | Cookie set with correct options |
| Set refresh token to cookie | Cookie set with httpOnly=true, sameSite=strict |
| Get access token from cookie | Token extracted correctly |
| Get refresh token from cookie | Token extracted correctly |
| Missing cookie | EmptyCookieError |
| Custom cookie name | Uses custom cookie name |
| Cookie options (secure, path, maxAge) | All options applied |

### 3.4 Guards

| Scenario | Guard | Expected Outcome |
|----------|-------|------------------|
| Valid token in header | JwtSyncGuard | Request passes (true) |
| Valid token in header | JwtAsyncGuard | Request passes (true) |
| Valid token in cookie | JwtSyncGuard | Request passes (true) |
| Valid token in cookie | JwtAsyncGuard | Request passes (true) |
| No token provided | Both | 401 Unauthorized |
| Expired token | Both | 401 Unauthorized |
| Invalid token | Both | 401 Unauthorized |
| Token from wrong secret | Both | 401 Unauthorized |

### 3.5 Refresh Token Flow

| Scenario | Expected Outcome |
|----------|------------------|
| Generate refresh token on login | Refresh token in httpOnly cookie |
| Use refresh token to get new access token | New access token returned |
| Use expired refresh token | 401 Unauthorized |
| Use invalid refresh token | 401 Unauthorized |
| Refresh token rotation | Old token invalidated (if implemented) |

### 3.6 Module Configuration

| Scenario | Expected Outcome |
|----------|------------------|
| forRoot() with minimal config | Module initializes |
| forRoot() with full config | Module initializes |
| forRootAsync() with useFactory | Module initializes |
| forRootAsync() with useClass | Module initializes |
| forRootAsync() with useExisting | Module initializes |
| Missing required options | Configuration error |
| Invalid algorithm | SecretKeyError |
| HMAC without secret | SecretKeyError |
| RSA without keys | SecretKeyError |

### 3.7 Error Handling

| Scenario | Error Type |
|----------|------------|
| Sign without secret | SecretKeyError |
| Verify without secret | SecretKeyError |
| Async provider in sync service | AsyncSecretOrKeyProviderError |
| Invalid header format | WrongAuthHeaderTypeError |
| No token in request | UndefinedTokenError |
| Empty cookie | EmptyCookieError |
| Undefined cookie request | UndefinedCookieRequestError |

---

## 4. Implementation Steps

### Phase 1: Backend Setup

1. **Create NestJS backend project**
   ```bash
   mkdir jwt-block32-test-app && cd jwt-block32-test-app
   mkdir backend && cd backend
   npm init -y
   npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
   npm install cookie-parser cors
   npm install -D typescript @types/node @types/cookie-parser ts-node
   ```

2. **Link local jwt-block32 package**
   ```bash
   npm install ../../jwt-block32
   # OR
   npm link @block32/jwt-auth
   ```

3. **Generate RSA keys for testing**
   ```bash
   mkdir keys
   openssl genrsa -out keys/private.pem 2048
   openssl rsa -in keys/private.pem -pubout -out keys/public.pem
   ```

4. **Create main.ts with CORS and cookie-parser**
   ```typescript
   import { NestFactory } from '@nestjs/core';
   import { AppModule } from './app.module';
   import * as cookieParser from 'cookie-parser';

   async function bootstrap() {
     const app = await NestFactory.create(AppModule);
     app.use(cookieParser());
     app.enableCors({
       origin: 'http://localhost:5173',  // Vite dev server
       credentials: true,
     });
     await app.listen(3000);
   }
   bootstrap();
   ```

5. **Create AppModule with multiple JWT configurations**

6. **Create scenario controllers**
   - AuthController: login, logout, refresh
   - ProtectedController: guarded endpoints
   - HeaderController: header storage tests
   - CookieController: cookie storage tests
   - RsaController: RSA algorithm tests
   - AlgorithmsController: all algorithm variants
   - ErrorController: error scenario triggers

7. **Create TestRunnerController**
   - POST /test/run/:testId - Run single test
   - POST /test/run-suite/:suiteId - Run test suite
   - POST /test/run-all - Run all tests
   - GET /test/results - Get all results

### Phase 2: Frontend Setup

8. **Create React + Vite frontend**
   ```bash
   cd ..
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install
   npm install axios jwt-decode react-router-dom
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

9. **Configure Tailwind CSS**

10. **Create Layout components**
    - Header with app title
    - Sidebar with test navigation
    - Main content area
    - State viewer panel

11. **Create common components**
    - Button, Card, Badge
    - JsonViewer for payload display
    - StatusIndicator (pass/fail/pending)
    - TestCard for individual tests
    - TestResult for displaying outcomes

### Phase 3: Frontend Pages

12. **Dashboard Page**
    - Quick login/logout buttons
    - Current auth state display
    - Test summary stats
    - Recent test results

13. **Auth Flow Page**
    - Login form with username/password
    - Login button (triggers backend login)
    - Logout button
    - Refresh button
    - Display returned tokens

14. **Header Storage Page**
    - Test cards for each header scenario
    - Input for custom header name
    - Input for custom prefix
    - Run/Reset buttons

15. **Cookie Storage Page**
    - Test cards for each cookie scenario
    - Cookie viewer showing current cookies
    - Cookie options display

16. **Guards Page**
    - JwtSyncGuard test section
    - JwtAsyncGuard test section
    - Toggle for valid/invalid/expired tokens
    - Display guard responses

17. **Algorithms Page**
    - Tabs for HMAC and RSA
    - Sub-tabs for each variant (256/384/512)
    - Sign and verify tests for each

18. **Error Scenarios Page**
    - Card for each error type
    - Trigger button to cause error
    - Display error message and type

19. **Token Playground Page**
    - Manual token input
    - Sign with custom payload
    - Verify any token
    - Decode without verification
    - Real-time payload editor

20. **All Tests Page**
    - "Run All" button
    - Progress indicator
    - Results summary
    - Detailed results expandable

### Phase 4: Integration

21. **API service layer**
    ```typescript
    // frontend/src/services/api.ts
    import axios from 'axios';

    const api = axios.create({
      baseURL: 'http://localhost:3000',
      withCredentials: true,
    });

    export const authApi = {
      login: (username: string, password: string) =>
        api.post('/auth/login', { username, password }),
      logout: () => api.post('/auth/logout'),
      refresh: () => api.post('/auth/refresh'),
      me: () => api.get('/auth/me'),
    };

    export const testApi = {
      runTest: (testId: string) => api.post(`/test/run/${testId}`),
      runSuite: (suiteId: string) => api.post(`/test/run-suite/${suiteId}`),
      runAll: () => api.post('/test/run-all'),
    };
    ```

22. **Test case definitions**
    ```typescript
    // frontend/src/services/testCases.ts
    export const testCases = {
      auth: [
        { id: 'auth-login-hmac', name: 'Login with HMAC', ... },
        { id: 'auth-login-rsa', name: 'Login with RSA', ... },
        { id: 'auth-refresh', name: 'Refresh Token', ... },
        { id: 'auth-logout', name: 'Logout', ... },
      ],
      headerStorage: [
        { id: 'header-bearer', name: 'Bearer Token', ... },
        { id: 'header-custom-name', name: 'Custom Header Name', ... },
        // ...
      ],
      // ... more categories
    };
    ```

23. **Custom hooks**
    - useAuth: manages auth state
    - useTestRunner: runs tests and tracks results
    - useTokenState: tracks current tokens and decoded payloads

### Phase 5: Testing & Polish

24. **E2E tests for backend**
    - Supertest-based tests
    - All scenarios covered

25. **Frontend testing**
    - Verify all buttons work
    - Verify all scenarios display correctly
    - Test edge cases

26. **Polish UI**
    - Loading states
    - Error states
    - Success animations
    - Responsive design

---

## 5. Backend API Endpoints

### Auth Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | Login and get tokens |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Clear tokens |
| GET | /auth/me | Get current user from token |

### Protected Endpoints
| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | /protected/sync | JwtSyncGuard | Sync-guarded route |
| GET | /protected/async | JwtAsyncGuard | Async-guarded route |

### Header Storage Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /header/login | Login with header storage |
| GET | /header/protected | Protected route using header |
| GET | /header/token | Get token from header |
| GET | /header/custom | Test custom header name |
| GET | /header/custom-prefix | Test custom prefix |

### Cookie Storage Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /cookie/login | Login with cookie storage |
| GET | /cookie/protected | Protected route using cookie |
| GET | /cookie/token | Get token from cookie |
| GET | /cookie/options | Return cookie options used |

### RSA Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /rsa/login | Login with RSA tokens |
| GET | /rsa/protected | Protected route with RSA |
| POST | /rsa/sign | Sign with RSA key |
| POST | /rsa/verify | Verify RSA token |

### Algorithm Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /algo/hs256/sign | Sign with HS256 |
| POST | /algo/hs384/sign | Sign with HS384 |
| POST | /algo/hs512/sign | Sign with HS512 |
| POST | /algo/rs256/sign | Sign with RS256 |
| POST | /algo/rs384/sign | Sign with RS384 |
| POST | /algo/rs512/sign | Sign with RS512 |
| POST | /algo/:alg/verify | Verify with algorithm |

### Error Trigger Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /error/secret-key | Trigger SecretKeyError |
| GET | /error/undefined-token | Trigger UndefinedTokenError |
| GET | /error/wrong-header | Trigger WrongAuthHeaderTypeError |
| GET | /error/empty-cookie | Trigger EmptyCookieError |
| GET | /error/async-in-sync | Trigger AsyncSecretOrKeyProviderError |

### Test Runner Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /test/run/:testId | Run single test |
| POST | /test/run-suite/:suiteId | Run test suite |
| POST | /test/run-all | Run all tests |
| GET | /test/results | Get all test results |
| GET | /test/suites | Get available test suites |

### Utility Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /util/decode | Decode token without verification |
| POST | /util/sign | Sign custom payload |
| POST | /util/verify | Verify token manually |
| GET | /util/config | Get current JWT configuration |

---

## 6. Frontend Pages & Interactions

### Dashboard Page
```
┌──────────────────────────────────────────────────────────────────────────┐
│  @block32/jwt-auth Test Dashboard                                        │
├────────────────────┬─────────────────────────────────────────────────────┤
│                    │  Quick Actions                                       │
│  📊 Dashboard      │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  🔐 Auth Flow      │  │  Login  │ │ Logout  │ │ Refresh │ │Run Tests│   │
│  📋 Header Storage │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│  🍪 Cookie Storage │                                                      │
│  🛡️ Guards         │  Test Summary                                        │
│  🔑 Algorithms     │  ┌──────────────────────────────────────────────┐   │
│  ⚠️ Errors         │  │  Total: 47  │  ✓ Passed: 45  │  ✗ Failed: 2 │   │
│  🧪 Playground     │  └──────────────────────────────────────────────┘   │
│  🚀 Run All        │                                                      │
│                    │  Current Auth State                                  │
│                    │  ┌──────────────────────────────────────────────┐   │
│                    │  │  Access Token: eyJhbG... (expires: 14:32)    │   │
│                    │  │  Refresh Token: ✓ Present (httpOnly cookie)  │   │
│                    │  │  User: { sub: "user123", role: "admin" }     │   │
│                    │  └──────────────────────────────────────────────┘   │
│                    │                                                      │
│                    │  Recent Tests                                        │
│                    │  ┌──────────────────────────────────────────────┐   │
│                    │  │  ✓ Sign Access Token (HS256)         12ms    │   │
│                    │  │  ✓ Verify Access Token               8ms     │   │
│                    │  │  ✗ Expired Token Rejected           15ms     │   │
│                    │  │  ✓ Guard Blocks Invalid Token        5ms     │   │
│                    │  └──────────────────────────────────────────────┘   │
└────────────────────┴─────────────────────────────────────────────────────┘
```

### Test Page (e.g., Header Storage)
```
┌──────────────────────────────────────────────────────────────────────────┐
│  Header Storage Tests                                    [Run All] [Reset]│
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  [▶ Run]  Bearer Token in Authorization Header           [✓ Pass]  │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │  Sends: Authorization: Bearer eyJhbGciOiJIUzI1NiI...               │ │
│  │  Expected: 200 OK with user data                                   │ │
│  │  Actual: 200 OK - { sub: "user123", role: "admin" }               │ │
│  │  Duration: 23ms                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  [▶ Run]  Custom Header Name (X-Auth-Token)              [○ Idle]  │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │  Header Name: [ X-Auth-Token        ]                              │ │
│  │  Expected: Token extracted from custom header                      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  [▶ Run]  Missing Authorization Header                   [✓ Pass]  │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │  Sends: No Authorization header                                    │ │
│  │  Expected: 401 Unauthorized with UndefinedTokenError               │ │
│  │  Actual: 401 - { error: "UndefinedTokenError", message: "..." }   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Token Playground Page
```
┌──────────────────────────────────────────────────────────────────────────┐
│  Token Playground                                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Sign Token                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Algorithm: [HS256 ▼]    Token Type: [Access ▼]                    │ │
│  │                                                                    │ │
│  │  Payload (JSON):                                                   │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │ {                                                            │ │ │
│  │  │   "sub": "user123",                                          │ │ │
│  │  │   "role": "admin",                                           │ │ │
│  │  │   "permissions": ["read", "write"]                           │ │ │
│  │  │ }                                                            │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  │                                                                    │ │
│  │  [Sign Token]                                                      │ │
│  │                                                                    │ │
│  │  Result:                                                           │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMT...  │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Verify / Decode Token                                                   │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Token:                                                            │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...                      │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  │                                                                    │ │
│  │  [Verify (checks signature)]   [Decode (no verification)]         │ │
│  │                                                                    │ │
│  │  Header:                      Payload:                             │ │
│  │  ┌─────────────────────┐     ┌─────────────────────────────────┐ │ │
│  │  │ {                   │     │ {                               │ │ │
│  │  │   "alg": "HS256",   │     │   "sub": "user123",             │ │ │
│  │  │   "typ": "JWT"      │     │   "role": "admin",              │ │ │
│  │  │ }                   │     │   "iat": 1706123456,            │ │ │
│  │  │                     │     │   "exp": 1706127056             │ │ │
│  │  │                     │     │ }                               │ │ │
│  │  └─────────────────────┘     └─────────────────────────────────┘ │ │
│  │                                                                    │ │
│  │  Status: ✓ Valid (expires in 14:32)                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Test Result Format

Each test returns a standardized result:

```typescript
interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'error' | 'pending';
  duration: number; // ms
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
  };
  expected: {
    status: number;
    body?: any;
    error?: string;
  };
  actual: {
    status: number;
    body?: any;
    error?: string;
  };
  timestamp: string;
}
```

---

## 8. Success Criteria

The test application is complete when:

1. **All backend endpoints work**
   - Each endpoint returns expected responses
   - Error endpoints trigger correct errors

2. **All frontend pages functional**
   - Each test can be run individually
   - Results display correctly
   - State viewer shows current auth state

3. **All test scenarios covered**
   - Token signing/verification
   - Header storage
   - Cookie storage
   - Guards
   - Refresh flow
   - Error scenarios
   - All algorithms

4. **Interactive testing works**
   - Click to run tests
   - See real-time results
   - Token playground functions
   - Cookie/header inspectors work

5. **Run All Tests works**
   - Runs entire suite
   - Shows progress
   - Summarizes results
   - Highlights failures

---

## 9. Tech Stack Summary

### Backend
- **Runtime**: Node.js
- **Framework**: NestJS
- **JWT Package**: @block32/jwt-auth (local)
- **Middleware**: cookie-parser, cors

### Frontend
- **Build Tool**: Vite
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router
- **JWT Decode**: jwt-decode (client-side only)

### Development
- **Backend Port**: 3000
- **Frontend Port**: 5173
- **CORS**: Enabled for localhost

---

## 10. Quick Start Commands

```bash
# Setup
mkdir jwt-block32-test-app && cd jwt-block32-test-app

# Backend
mkdir backend && cd backend
npm init -y
npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs cookie-parser cors
npm install ../../jwt-block32
npm install -D typescript @types/node @types/cookie-parser ts-node

# Frontend
cd ..
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install axios jwt-decode react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Generate RSA keys
cd ../backend
mkdir keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# Run
# Terminal 1: cd backend && npm run start:dev
# Terminal 2: cd frontend && npm run dev
# Open: http://localhost:5173
```
