import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

/**
 * This controller provides utilities for generating various types of tokens
 * for testing purposes. The actual error testing should be done by sending
 * these tokens to real protected endpoints like /protected/sync, /protected/async, /auth/me
 */

// A wrong secret - NOT the one used by the auth module
const WRONG_SECRET = 'this-is-a-completely-different-secret-key';

// The correct secret used by the auth module (for creating valid but expired tokens)
const AUTH_SECRET = 'your-super-secret-key-for-testing-purposes-only';

@Controller('edge-cases')
export class EdgeCasesController {
  /**
   * Generate a token signed with the WRONG secret
   * Use this token with /protected/sync or /protected/async to test invalid signature rejection
   */
  @Post('generate/wrong-secret')
  @HttpCode(HttpStatus.OK)
  generateWrongSecret(
    @Body() dto: { payload?: Record<string, unknown> },
  ): { token: string; description: string } {
    const payload = dto.payload || { sub: 1, username: 'test', email: 'test@example.com', role: 'user' };

    const token = jwt.sign(payload, WRONG_SECRET, {
      algorithm: 'HS256',
      expiresIn: '15m',
    });

    return {
      token,
      description: 'Token signed with wrong secret - will fail signature verification',
    };
  }

  /**
   * Generate an expired token (signed with correct secret)
   * Use this token to test expiration handling
   */
  @Post('generate/expired')
  @HttpCode(HttpStatus.OK)
  generateExpired(
    @Body() dto: { payload?: Record<string, unknown> },
  ): { token: string; description: string } {
    const payload = dto.payload || { sub: 1, username: 'test', email: 'test@example.com', role: 'user' };

    // Sign with correct secret but already expired
    const token = jwt.sign(
      {
        ...payload,
        iat: Math.floor(Date.now() / 1000) - 7200, // issued 2 hours ago
        exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
      },
      AUTH_SECRET,
      { algorithm: 'HS256' },
    );

    return {
      token,
      description: 'Token that has already expired - will fail expiration check',
    };
  }

  /**
   * Generate a token with "none" algorithm (algorithm confusion attack)
   */
  @Get('generate/none-algorithm')
  @HttpCode(HttpStatus.OK)
  generateNoneAlgorithm(): { token: string; description: string } {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ sub: 1, username: 'hacker', role: 'admin' }),
    ).toString('base64url');
    const token = `${header}.${payload}.`;

    return {
      token,
      description: 'Token with "none" algorithm - security attack vector',
    };
  }

  /**
   * Generate various malformed tokens
   */
  @Get('generate/malformed/:type')
  @HttpCode(HttpStatus.OK)
  generateMalformed(): { tokens: Record<string, { token: string; description: string }> } {
    return {
      tokens: {
        'no-dots': {
          token: 'thisisnotavalidtokenatall',
          description: 'No dots separating parts',
        },
        'one-dot': {
          token: 'header.payload',
          description: 'Only one dot (missing signature)',
        },
        'empty-parts': {
          token: '..',
          description: 'Empty header, payload, and signature',
        },
        'invalid-base64': {
          token: 'not!valid!base64.also!not!valid.definitely!not!valid',
          description: 'Invalid base64 encoding',
        },
        'empty-string': {
          token: '',
          description: 'Empty string',
        },
      },
    };
  }

  /**
   * Generate a token that's not yet valid (nbf in future)
   */
  @Post('generate/not-yet-valid')
  @HttpCode(HttpStatus.OK)
  generateNotYetValid(
    @Body() dto: { payload?: Record<string, unknown> },
  ): { token: string; description: string } {
    const payload = dto.payload || { sub: 1, username: 'test', email: 'test@example.com', role: 'user' };

    const token = jwt.sign(
      {
        ...payload,
        nbf: Math.floor(Date.now() / 1000) + 3600, // not valid for another hour
      },
      AUTH_SECRET,
      { algorithm: 'HS256', expiresIn: '2h' },
    );

    return {
      token,
      description: 'Token with nbf (not before) set in the future',
    };
  }

  /**
   * Tamper with an existing token's payload (keeps original signature)
   */
  @Post('tamper')
  @HttpCode(HttpStatus.OK)
  tamperToken(
    @Body() dto: { token: string; newPayload: Record<string, unknown> },
  ): { originalToken: string; tamperedToken: string; description: string } {
    const decoded = jwt.decode(dto.token, { complete: true });
    if (!decoded || typeof decoded === 'string') {
      return {
        originalToken: dto.token,
        tamperedToken: '',
        description: 'Could not decode original token',
      };
    }

    // Create tampered token with modified payload but original signature
    const header = Buffer.from(JSON.stringify(decoded.header)).toString('base64url');
    const tamperedPayload = {
      ...(decoded.payload as Record<string, unknown>),
      ...dto.newPayload,
    };
    const payload = Buffer.from(JSON.stringify(tamperedPayload)).toString('base64url');
    const tamperedToken = `${header}.${payload}.${(decoded as { signature: string }).signature}`;

    return {
      originalToken: dto.token,
      tamperedToken,
      description: 'Token with modified payload but original signature - will fail verification',
    };
  }

  /**
   * Generate a token claiming RS256 but with fake signature (algorithm switch attack)
   */
  @Get('generate/algorithm-switch')
  @HttpCode(HttpStatus.OK)
  generateAlgorithmSwitch(): { token: string; description: string } {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ sub: 1, username: 'attacker', role: 'admin' }),
    ).toString('base64url');
    const signature = Buffer.from('fake-signature').toString('base64url');
    const token = `${header}.${payload}.${signature}`;

    return {
      token,
      description: 'Token claiming RS256 algorithm but with invalid signature',
    };
  }

  /**
   * Get all malformed token types at once
   */
  @Get('generate/all-malformed')
  @HttpCode(HttpStatus.OK)
  getAllMalformed(): { tokens: Array<{ type: string; token: string; description: string }> } {
    return {
      tokens: [
        { type: 'no-dots', token: 'thisisnotavalidtokenatall', description: 'No dots' },
        { type: 'one-dot', token: 'header.payload', description: 'Missing signature part' },
        { type: 'empty-parts', token: '..', description: 'All parts empty' },
        { type: 'invalid-base64', token: 'not!valid.also!not.valid!', description: 'Invalid base64' },
        { type: 'truncated', token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjF9', description: 'Truncated (no signature)' },
      ],
    };
  }
}
