import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

@Injectable()
export class AuthProxyService {
  private readonly logger = new Logger(AuthProxyService.name);
  private readonly authServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.authServiceUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ||
      'http://localhost:3000/api';
  }

  async register(registerDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/register`, registerDto),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(loginDto: any) {
    try {

        this.logger.log('this.authServiceUrl --> ', this.authServiceUrl)
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/login`, loginDto),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async refreshToken(refreshTokenDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/refresh`, refreshTokenDto),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async logout(token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCurrentUser(token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data?.message || 'Internal server error';
      
      this.logger.error(
        `Auth Service Error: ${status} - ${JSON.stringify(error.response?.data)}`,
      );

      throw new HttpException(
        {
          statusCode: status,
          message: Array.isArray(message) ? message : [message],
          error: error.response?.data?.error || 'Error',
        },
        status,
      );
    }

    this.logger.error('Unexpected error:', error);
    throw new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}