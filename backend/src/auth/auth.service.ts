import { Injectable } from '@nestjs/common';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface UserPayload {
  sub: number;
  username: string;
  email: string;
  role: string;
}

// Mock users for testing
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    role: 'admin',
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    email: 'user@example.com',
    role: 'user',
  },
  {
    id: 3,
    username: 'test',
    password: 'test123',
    email: 'test@example.com',
    role: 'tester',
  },
];

@Injectable()
export class AuthService {
  validateUser(username: string, password: string): User | null {
    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password,
    );

    if (!user) {
      return null;
    }

    // Return user without password
    const { password: _, ...result } = user;
    return result;
  }

  createPayload(user: User): UserPayload {
    return {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  getUserFromPayload(payload: UserPayload): User {
    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  }
}
