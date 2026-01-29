# JWT Auth Test App

A full-stack test application for thoroughly testing the `@block32/jwt-auth` NestJS package.

## Overview

This project provides:
- **Backend** (NestJS): API endpoints exposing all JWT scenarios
- **Frontend** (React + Vite): Interactive dashboard to run tests and view results

## Structure

```
jwt-auth-test-app/
├── backend/              # NestJS API (port 3000)
│   ├── src/
│   │   ├── auth/         # Main auth module
│   │   ├── protected/    # Guard-protected routes
│   │   ├── scenarios/    # Test scenario modules
│   │   │   ├── header/   # Header storage tests
│   │   │   ├── cookie/   # Cookie storage tests
│   │   │   ├── rsa/      # RSA algorithm tests
│   │   │   ├── algorithms/ # All algorithms
│   │   │   └── errors/   # Error trigger endpoints
│   │   └── util/         # Token utilities
│   └── keys/             # RSA keys for testing
│
├── frontend/             # React + Vite (port 5173)
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # Test pages
│       ├── hooks/        # Custom hooks
│       ├── services/     # API services
│       └── context/      # Auth context
│
├── prd.json              # Ralph user stories
├── prompt.md             # Ralph prompt template
├── progress.txt          # Ralph progress log
└── IMPLEMENTATION_PLAN.md # Detailed plan
```

## Development

### Prerequisites
- Node.js 18+
- npm or pnpm
- `@block32/jwt-auth` package at `../jwt-block32`

### Running with Ralph (Autonomous)

```bash
# From this directory, run Ralph
/path/to/ralph-system/ralph.sh

# Or with max iterations
/path/to/ralph-system/ralph.sh 50
```

### Manual Development

```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Run both servers
npm run dev
```

## Test Scenarios

The app tests all `@block32/jwt-auth` features:

- **Auth Flow**: Login, logout, refresh tokens
- **Header Storage**: Bearer token, custom headers
- **Cookie Storage**: Access/refresh in cookies
- **Guards**: JwtSyncGuard, JwtAsyncGuard
- **Algorithms**: HS256/384/512, RS256/384/512
- **Error Handling**: All custom error types
- **Token Playground**: Manual sign/verify/decode

## User Stories (20 total)

See `prd.json` for the complete list of stories:

1. S1: Monorepo setup
2. S2: Tailwind + Layout components
3. S3: Backend auth module
4. S4: Protected routes with guards
5. S5: Header/Cookie storage modules
6. S6: RSA and algorithms module
7. S7: Error trigger endpoints
8. S8: Utility endpoints
9. S9: Frontend API service
10. S10: Dashboard page
11. S11: Test runner infrastructure
12. S12: Auth Flow page
13. S13: Header Storage page
14. S14: Cookie Storage page
15. S15: Guards page
16. S16: Algorithms page
17. S17: Error Scenarios page
18. S18: Token Playground page
19. S19: Run All Tests page
20. S20: State viewer + polish

## License

MIT
