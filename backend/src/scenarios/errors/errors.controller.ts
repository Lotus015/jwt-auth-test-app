import {
  Controller,
  Get,
  Req,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  SecretKeyError,
  UndefinedTokenError,
  WrongAuthHeaderTypeError,
  EmptyCookieError,
  RefreshTokenError,
  TokenService,
} from '@block32/jwt-auth';

@Controller('error')
export class ErrorsController {
  constructor(private readonly tokenService: TokenService) {}

  /**
   * Triggers SecretKeyError
   * This error occurs when neither secret nor private/public key is configured
   */
  @Get('secret-key')
  triggerSecretKeyError(): never {
    const error = new SecretKeyError('Neither secret nor key is provided');
    throw new HttpException(
      {
        error: 'SecretKeyError',
        message: error.message || 'Neither secret nor key is provided',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Triggers UndefinedTokenError
   * This error occurs when the token is undefined or missing
   */
  @Get('undefined-token')
  triggerUndefinedTokenError(): never {
    const error = new UndefinedTokenError('Token is undefined');
    throw new HttpException(
      {
        error: 'UndefinedTokenError',
        message: error.message || 'Token is undefined',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }

  /**
   * Triggers WrongAuthHeaderTypeError
   * This error occurs when the authorization header is missing or has wrong format
   */
  @Get('wrong-header')
  triggerWrongAuthHeaderTypeError(@Req() req: Request): never {
    // Try to get the token from a request without proper header
    // This will throw WrongAuthHeaderTypeError since no Authorization header is present
    try {
      this.tokenService.getAccessTokenFromStorage(req);
    } catch (e) {
      if (e instanceof WrongAuthHeaderTypeError) {
        throw new HttpException(
          {
            error: 'WrongAuthHeaderTypeError',
            message: e.message || 'Missing authorization header',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw e;
    }
    // If somehow it doesn't throw (unlikely), throw manually
    const error = new WrongAuthHeaderTypeError('Missing authorization header');
    throw new HttpException(
      {
        error: 'WrongAuthHeaderTypeError',
        message: error.message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  /**
   * Triggers EmptyCookieError
   * This error occurs when the cookie value is empty or undefined
   */
  @Get('empty-cookie')
  triggerEmptyCookieError(@Req() req: Request): never {
    // Try to get the refresh token from cookies when none are set
    try {
      this.tokenService.getRefreshTokenFromStorage(req);
    } catch (e) {
      if (e instanceof EmptyCookieError) {
        throw new HttpException(
          {
            error: 'EmptyCookieError',
            message: e.message || 'Cookie has empty or undefined value',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw e;
    }
    // If somehow it doesn't throw (unlikely), throw manually
    const error = new EmptyCookieError('Cookie has empty or undefined value');
    throw new HttpException(
      {
        error: 'EmptyCookieError',
        message: error.message,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }

  /**
   * Triggers RefreshTokenError
   * This error occurs when refresh token options are missing
   */
  @Get('refresh-token')
  triggerRefreshTokenError(): never {
    const error = new RefreshTokenError('Refresh token options are missing');
    throw new HttpException(
      {
        error: 'RefreshTokenError',
        message: error.message || 'Refresh token options are missing',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
