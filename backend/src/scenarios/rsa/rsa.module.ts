import { Module } from '@nestjs/common';
import { JwtModule } from '@block32/jwt-auth';
import { RsaController } from './rsa.controller';
import * as fs from 'fs';
import * as path from 'path';

const keysPath = path.join(process.cwd(), 'keys');
const privateKey = fs.readFileSync(path.join(keysPath, 'private.pem'), 'utf8');
const publicKey = fs.readFileSync(path.join(keysPath, 'public.pem'), 'utf8');

@Module({
  imports: [
    JwtModule.forRoot({
      accessToken: {
        storage: 'header',
        headerOptions: {
          headerName: 'Authorization',
          prefix: 'Bearer',
        },
        keyOptions: {
          algorithm: 'RS256',
          privateKey,
          publicKey,
        },
        signOptions: {
          expiresIn: '15m',
        },
      },
      refreshToken: {
        keyOptions: {
          algorithm: 'RS256',
          privateKey,
          publicKey,
        },
        cookieOptions: {
          cookieName: 'rsa_refresh_token',
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
        signOptions: {
          expiresIn: '7d',
        },
      },
    }),
  ],
  controllers: [RsaController],
})
export class RsaModule {}
