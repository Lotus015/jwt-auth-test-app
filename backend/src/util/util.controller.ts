import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

type SupportedAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';

interface DecodeDto {
  token: string;
}

interface SignDto {
  payload: Record<string, unknown>;
  algorithm?: SupportedAlgorithm;
  tokenType?: 'access' | 'refresh';
}

interface VerifyDto {
  token: string;
}

// Default secret for utility signing (HS256)
const DEFAULT_SECRET = 'util-secret-key-for-testing-purposes-only-32chars';

// HMAC secrets for each algorithm
const HMAC_SECRETS: Record<string, string> = {
  HS256: DEFAULT_SECRET,
  HS384: 'util-hs384-secret-key-for-testing-must-be-at-least-48-characters-long',
  HS512: 'util-hs512-secret-key-for-testing-must-be-at-least-64-characters-long-to-be-secure',
};

// RSA keys
const keysPath = path.join(process.cwd(), 'keys');
const privateKey = fs.readFileSync(path.join(keysPath, 'private.pem'), 'utf8');
const publicKey = fs.readFileSync(path.join(keysPath, 'public.pem'), 'utf8');

const SUPPORTED_ALGORITHMS: SupportedAlgorithm[] = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'];

// Configuration used by the main auth module (sanitized, no actual secrets)
const JWT_CONFIG = {
  accessToken: {
    storage: 'header',
    headerOptions: {
      headerName: 'authorization',
      prefix: 'Bearer',
    },
    algorithm: 'HS256',
    expiresIn: '15m',
  },
  refreshToken: {
    storage: 'cookie',
    cookieOptions: {
      cookieName: 'refresh_token',
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
      maxAge: '7 days',
    },
    algorithm: 'HS256',
    expiresIn: '7d',
  },
  supportedAlgorithms: SUPPORTED_ALGORITHMS,
};

@Controller('util')
export class UtilController {
  @Post('decode')
  @HttpCode(HttpStatus.OK)
  decode(@Body() decodeDto: DecodeDto): {
    header: Record<string, unknown> | null;
    payload: Record<string, unknown> | null;
    signature: string | null;
  } {
    const decoded = jwt.decode(decodeDto.token, { complete: true });

    if (!decoded) {
      return {
        header: null,
        payload: null,
        signature: null,
      };
    }

    return {
      header: decoded.header as unknown as Record<string, unknown>,
      payload: decoded.payload as unknown as Record<string, unknown>,
      signature: decoded.signature,
    };
  }

  @Post('sign')
  @HttpCode(HttpStatus.OK)
  sign(@Body() signDto: SignDto): { token: string; algorithm: string; tokenType: string } {
    const algorithm = signDto.algorithm || 'HS256';
    const tokenType = signDto.tokenType || 'access';

    if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
      return {
        token: '',
        algorithm,
        tokenType,
      };
    }

    const secret = this.getSigningKey(algorithm);
    const expiresIn = tokenType === 'refresh' ? '7d' : '15m';

    const token = jwt.sign(signDto.payload, secret, {
      algorithm,
      expiresIn,
    });

    return { token, algorithm, tokenType };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verify(@Body() verifyDto: VerifyDto): {
    valid: boolean;
    payload?: Record<string, unknown>;
    error?: string;
  } {
    // First decode to get the algorithm from the header
    const decoded = jwt.decode(verifyDto.token, { complete: true });

    if (!decoded) {
      return {
        valid: false,
        error: 'Invalid token format',
      };
    }

    const algorithm = decoded.header.alg as SupportedAlgorithm;

    if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
      return {
        valid: false,
        error: `Unsupported algorithm: ${algorithm}`,
      };
    }

    try {
      const secret = this.getVerifyingKey(algorithm);
      const payload = jwt.verify(verifyDto.token, secret, {
        algorithms: [algorithm],
      }) as Record<string, unknown>;

      return { valid: true, payload };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      return { valid: false, error };
    }
  }

  @Get('config')
  getConfig(): typeof JWT_CONFIG {
    return JWT_CONFIG;
  }

  private getSigningKey(algorithm: SupportedAlgorithm): jwt.Secret {
    if (algorithm.startsWith('HS')) {
      return HMAC_SECRETS[algorithm];
    }
    // RSA algorithms use private key for signing
    return privateKey;
  }

  private getVerifyingKey(algorithm: SupportedAlgorithm): jwt.Secret {
    if (algorithm.startsWith('HS')) {
      return HMAC_SECRETS[algorithm];
    }
    // RSA algorithms use public key for verification
    return publicKey;
  }
}
