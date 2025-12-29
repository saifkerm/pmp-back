import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

@Injectable()
export class ProjectsProxyService {
  private readonly logger = new Logger(ProjectsProxyService.name);
  private readonly projectServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.projectServiceUrl =
      this.configService.get<string>('PROJECT_SERVICE_URL') ||
      'http://localhost:3003/api';
  }

  // ==================== PROJECTS ====================

  async createProject(createProjectDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.projectServiceUrl}/projects`,
          createProjectDto,
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

  async findAllProjects(query: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.projectServiceUrl}/projects`, {
          params: query,
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneProject(id: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.projectServiceUrl}/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProject(id: string, updateProjectDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.projectServiceUrl}/projects/${id}`,
          updateProjectDto,
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

  async archiveProject(id: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.projectServiceUrl}/projects/${id}/archive`,
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

  async restoreProject(id: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.projectServiceUrl}/projects/${id}/restore`,
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

  async deleteProject(id: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.projectServiceUrl}/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== MEMBERS ====================

  async getMembers(projectId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.projectServiceUrl}/projects/${projectId}/members`,
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

  async addMember(projectId: string, addMemberDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.projectServiceUrl}/projects/${projectId}/members`,
          addMemberDto,
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

  async removeMember(projectId: string, memberId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.projectServiceUrl}/projects/${projectId}/members/${memberId}`,
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

  // ==================== BOARDS ====================

  async createBoard(projectId: string, createBoardDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.projectServiceUrl}/projects/${projectId}/boards`,
          createBoardDto,
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

  async findAllBoards(projectId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.projectServiceUrl}/projects/${projectId}/boards`,
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

  async findOneBoard(projectId: string, boardId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.projectServiceUrl}/projects/${projectId}/boards/${boardId}`,
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

  async updateBoard(
    projectId: string,
    boardId: string,
    updateBoardDto: any,
    token: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.projectServiceUrl}/projects/${projectId}/boards/${boardId}`,
          updateBoardDto,
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

  async deleteBoard(projectId: string, boardId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.projectServiceUrl}/projects/${projectId}/boards/${boardId}`,
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

  // ==================== LABELS ====================

  async createLabel(projectId: string, createLabelDto: any, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.projectServiceUrl}/projects/${projectId}/labels`,
          createLabelDto,
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

  async findAllLabels(projectId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.projectServiceUrl}/projects/${projectId}/labels`,
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

  async updateLabel(
    projectId: string,
    labelId: string,
    updateLabelDto: any,
    token: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.projectServiceUrl}/projects/${projectId}/labels/${labelId}`,
          updateLabelDto,
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

  async deleteLabel(projectId: string, labelId: string, token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.projectServiceUrl}/projects/${projectId}/labels/${labelId}`,
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
        `Project Service Error: ${status} - ${JSON.stringify(error.response?.data)}`,
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