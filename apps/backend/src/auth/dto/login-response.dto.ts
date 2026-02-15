import type { AuthTokenResponse } from '@consult/shared-types';

export class LoginResponseDto implements AuthTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

