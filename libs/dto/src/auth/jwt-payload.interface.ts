export interface JwtPayload {
    sub: string; // user ID
    email: string;
    role: string;
    iat?: number;
    exp?: number;
  }
  
  export class AuthResponseDto {
    accessToken: string | undefined;
    refreshToken: string | undefined;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    } | undefined;
  }