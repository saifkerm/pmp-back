import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

@Injectable()
export class UsersProxyService {
  private readonly logger = new Logger(UsersProxyService.name);
  private readonly userServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.userServiceUrl =
      this.configService.get<string>('USER_SERVICE_URL') ||
      'http://localhost:3002/api';
  }

  async findAll(query: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users`, {
          params: query,
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

  async findOne(id: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users/${id}`, {
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

  async getStats(id: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users/${id}/stats`, {
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

  async update(id: string, updateUserDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.userServiceUrl}/users/${id}`,
          updateUserDto,
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

  async updateProfile(id: string, updateProfileDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.userServiceUrl}/users/${id}/profile`,
          updateProfileDto,
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

  async uploadAvatar(id: string, file: any, token: string) {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.userServiceUrl}/users/${id}/avatar`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
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

  async deactivate(id: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.userServiceUrl}/users/${id}/deactivate`,
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

  async activate(id: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.userServiceUrl}/users/${id}/activate`,
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

  private handleError(error: any): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data?.message || 'Internal server error';

      this.logger.error(
        `User Service Error: ${status} - ${JSON.stringify(error.response?.data)}`,
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