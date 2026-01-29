import {
  Controller,
  Post,
  Body,
  Param,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

type SupportedAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';

interface SignDto {
  payload: Record<string, unknown>;
}

interface VerifyDto {
  token: string;
}

// HMAC secrets for each algorithm
const HMAC_SECRETS: Record<string, string> = {
  HS256: 'hs256-secret-key-for-testing-must-be-at-least-32-chars',
  HS384: 'hs384-secret-key-for-testing-must-be-at-least-48-characters-long',
  HS512: 'hs512-secret-key-for-testing-must-be-at-least-64-characters-long-to-be-secure',
};

// RSA keys
const keysPath = path.join(process.cwd(), 'keys');
const privateKey = fs.readFileSync(path.join(keysPath, 'private.pem'), 'utf8');
const publicKey = fs.readFileSync(path.join(keysPath, 'public.pem'), 'utf8');

const SUPPORTED_ALGORITHMS: SupportedAlgorithm[] = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'];

@Controller('algo')
export class AlgorithmsController {
  @Post(':alg/sign')
  @HttpCode(HttpStatus.OK)
  sign(
    @Param('alg') alg: string,
    @Body() signDto: SignDto,
  ): { token: string; algorithm: string } {
    const algorithm = alg.toUpperCase() as SupportedAlgorithm;

    if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
      throw new BadRequestException(
        `Unsupported algorithm: ${alg}. Supported: ${SUPPORTED_ALGORITHMS.join(', ')}`,
      );
    }

    const secret = this.getSigningKey(algorithm);
    const token = jwt.sign(signDto.payload, secret, { algorithm });

    return { token, algorithm };
  }

  @Post(':alg/verify')
  @HttpCode(HttpStatus.OK)
  verify(
    @Param('alg') alg: string,
    @Body() verifyDto: VerifyDto,
  ): { valid: boolean; payload?: Record<string, unknown>; algorithm?: string } {
    const algorithm = alg.toUpperCase() as SupportedAlgorithm;

    if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
      throw new BadRequestException(
        `Unsupported algorithm: ${alg}. Supported: ${SUPPORTED_ALGORITHMS.join(', ')}`,
      );
    }

    try {
      const secret = this.getVerifyingKey(algorithm);
      const payload = jwt.verify(verifyDto.token, secret, { algorithms: [algorithm] }) as Record<string, unknown>;
      return { valid: true, payload, algorithm };
    } catch {
      return { valid: false };
    }
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
