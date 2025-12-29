import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

@Injectable()
export class TasksProxyService {
  private readonly logger = new Logger(TasksProxyService.name);
  private readonly taskServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.taskServiceUrl =
      this.configService.get<string>('TASK_SERVICE_URL') ||
      'http://localhost:3004/api';
  }

  // ==================== TASKS ====================

  async createTask(createTaskDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.taskServiceUrl}/tasks`,
          createTaskDto,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllTasks(query: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.taskServiceUrl}/tasks`, {
          params: query,
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneTask(id: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.taskServiceUrl}/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateTask(id: string, updateTaskDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.taskServiceUrl}/tasks/${id}`,
          updateTaskDto,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteTask(id: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.taskServiceUrl}/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async moveTask(id: string, moveTaskDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.taskServiceUrl}/tasks/${id}/move`,
          moveTaskDto,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== ASSIGNEES ====================

  async assignTask(id: string, assignTaskDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.taskServiceUrl}/tasks/${id}/assign`,
          assignTaskDto,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async unassignTask(taskId: string, userId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.taskServiceUrl}/tasks/${taskId}/assignees/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== WATCHERS ====================

  async addWatcher(taskId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.taskServiceUrl}/tasks/${taskId}/watch`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async removeWatcher(taskId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.taskServiceUrl}/tasks/${taskId}/watch`,
          {
            headers: { Authorization: `Bearer ${token}` },
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
        `Task Service Error: ${status} - ${JSON.stringify(error.response?.data)}`,
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