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
        this.httpService.post(`${this.taskServiceUrl}/tasks`, createTaskDto, {
          headers: { Authorization: `Bearer ${token}` },
        }),
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

  async unassignTask(id: string, userId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.taskServiceUrl}/tasks/${id}/assignees/${userId}`,
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

  async watchTask(id: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.taskServiceUrl}/tasks/${id}/watch`,
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

  async unwatchTask(id: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.taskServiceUrl}/tasks/${id}/watch`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== SUBTASKS ====================

  async createSubtask(taskId: string, createSubtaskDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.taskServiceUrl}/tasks/${taskId}/subtasks`,
          createSubtaskDto,
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

  async findAllSubtasks(taskId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.taskServiceUrl}/tasks/${taskId}/subtasks`,
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

  async findOneSubtask(taskId: string, subtaskId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.taskServiceUrl}/tasks/${taskId}/subtasks/${subtaskId}`,
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

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    updateSubtaskDto: any,
    token: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.taskServiceUrl}/tasks/${taskId}/subtasks/${subtaskId}`,
          updateSubtaskDto,
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

  async deleteSubtask(taskId: string, subtaskId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.taskServiceUrl}/tasks/${taskId}/subtasks/${subtaskId}`,
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

  async toggleSubtask(taskId: string, subtaskId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.taskServiceUrl}/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
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

  async reorderSubtasks(taskId: string, subtaskIds: string[], token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.taskServiceUrl}/tasks/${taskId}/subtasks/reorder`,
          { subtaskIds },
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

  // ==================== ATTACHMENTS ====================

  async uploadAttachment(taskId: string, file: any, token: string) {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.taskServiceUrl}/tasks/${taskId}/attachments`,
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

  async findAllAttachments(taskId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.taskServiceUrl}/tasks/${taskId}/attachments`,
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

  async findOneAttachment(
    taskId: string,
    attachmentId: string,
    token: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.taskServiceUrl}/tasks/${taskId}/attachments/${attachmentId}`,
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

  async getAttachmentDownloadUrl(
    taskId: string,
    attachmentId: string,
    token: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.taskServiceUrl}/tasks/${taskId}/attachments/${attachmentId}/download`,
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

  async deleteAttachment(taskId: string, attachmentId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.taskServiceUrl}/tasks/${taskId}/attachments/${attachmentId}`,
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

  // ==================== ERROR HANDLING ====================

  // ==================== COMMENTS ====================

  async createComment(taskId: string, createCommentDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.taskServiceUrl}/tasks/${taskId}/comments`,
          createCommentDto,
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

  async findAllComments(taskId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.taskServiceUrl}/tasks/${taskId}/comments`,
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

  async findOneComment(taskId: string, commentId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.taskServiceUrl}/tasks/${taskId}/comments/${commentId}`,
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

  async updateComment(
    taskId: string,
    commentId: string,
    updateCommentDto: any,
    token: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.taskServiceUrl}/tasks/${taskId}/comments/${commentId}`,
          updateCommentDto,
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

  async deleteComment(taskId: string, commentId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.taskServiceUrl}/tasks/${taskId}/comments/${commentId}`,
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

  async getCommentReplies(taskId: string, commentId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.taskServiceUrl}/tasks/${taskId}/comments/${commentId}/replies`,
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