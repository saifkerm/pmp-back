import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger,
  } from '@nestjs/common';
  import { PrismaService } from '@pmp-back/database';
  import { CreateSubtaskDto, UpdateSubtaskDto } from './dto';
  
  @Injectable()
  export class SubtasksService {
    private readonly logger = new Logger(SubtasksService.name);
  
    constructor(private prisma: PrismaService) {}
  
    private async checkTaskAccess(taskId: string, userId: string) {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: {
          column: {
            include: {
              board: {
                include: {
                  project: {
                    include: {
                      members: {
                        where: { userId },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
  
      if (!task) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }
  
      const hasAccess =
        task.column.board.project.ownerId === userId ||
        task.column.board.project.members.length > 0;
  
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this task');
      }
  
      return task;
    }
  
    private async checkSubtaskAccess(subtaskId: string, userId: string) {
      const subtask = await this.prisma.subtask.findUnique({
        where: { id: subtaskId },
        include: {
          task: {
            include: {
              column: {
                include: {
                  board: {
                    include: {
                      project: {
                        include: {
                          members: {
                            where: { userId },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
  
      if (!subtask) {
        throw new NotFoundException(`Subtask with ID ${subtaskId} not found`);
      }
  
      const hasAccess =
        subtask.task.column.board.project.ownerId === userId ||
        subtask.task.column.board.project.members.length > 0;
  
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this subtask');
      }
  
      return subtask;
    }
  
    async create(taskId: string, createSubtaskDto: CreateSubtaskDto, userId: string) {
      // Vérifier l'accès à la tâche
      await this.checkTaskAccess(taskId, userId);
  
      // Obtenir la position suivante si non fournie
      if (createSubtaskDto.position === undefined) {
        const maxPosition = await this.prisma.subtask.findFirst({
          where: { taskId },
          orderBy: { position: 'desc' },
          select: { position: true },
        });
        createSubtaskDto.position = (maxPosition?.position ?? -1) + 1;
      }
  
      const subtask = await this.prisma.subtask.create({
        data: {
          ...createSubtaskDto,
          taskId,
        },
      });
  
      this.logger.log(`Subtask created: ${subtask.title} for task ${taskId}`);
      return subtask;
    }
  
    async findAll(taskId: string, userId: string) {
      // Vérifier l'accès
      await this.checkTaskAccess(taskId, userId);
  
      const subtasks = await this.prisma.subtask.findMany({
        where: { taskId },
        orderBy: { position: 'asc' },
      });
  
      return subtasks;
    }
  
    async findOne(taskId: string, subtaskId: string, userId: string) {
      // Vérifier l'accès
      await this.checkTaskAccess(taskId, userId);
  
      const subtask = await this.prisma.subtask.findUnique({
        where: { id: subtaskId, taskId },
      });
  
      if (!subtask) {
        throw new NotFoundException(`Subtask with ID ${subtaskId} not found`);
      }
  
      return subtask;
    }
  
    async update(
      taskId: string,
      subtaskId: string,
      updateSubtaskDto: UpdateSubtaskDto,
      userId: string,
    ) {
      // Vérifier l'accès
      await this.checkSubtaskAccess(subtaskId, userId);
  
      const subtask = await this.prisma.subtask.update({
        where: { id: subtaskId, taskId },
        data: updateSubtaskDto,
      });
  
      this.logger.log(`Subtask updated: ${subtask.title}`);
      return subtask;
    }
  
    async delete(taskId: string, subtaskId: string, userId: string) {
      // Vérifier l'accès
      await this.checkSubtaskAccess(subtaskId, userId);
  
      const subtask = await this.prisma.subtask.delete({
        where: { id: subtaskId, taskId },
      });
  
      // Réorganiser les positions
      await this.prisma.subtask.updateMany({
        where: {
          taskId,
          position: { gt: subtask.position },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });
  
      this.logger.log(`Subtask deleted: ${subtask.title}`);
      return { message: 'Subtask deleted successfully' };
    }
  
    async toggle(taskId: string, subtaskId: string, userId: string) {
      // Vérifier l'accès
      const subtask = await this.checkSubtaskAccess(subtaskId, userId);
  
      const updated = await this.prisma.subtask.update({
        where: { id: subtaskId, taskId },
        data: {
          completed: !subtask.completed,
          completedAt: !subtask.completed ? new Date() : null,
          completedBy: !subtask.completed ? userId : null,
        },
      });
  
      this.logger.log(
        `Subtask ${updated.completed ? 'completed' : 'reopened'}: ${updated.title}`,
      );
      return updated;
    }
  
    async reorder(taskId: string, subtaskIds: string[], userId: string) {
      // Vérifier l'accès
      await this.checkTaskAccess(taskId, userId);
  
      // Mettre à jour les positions
      const updates = subtaskIds.map((subtaskId, index) =>
        this.prisma.subtask.update({
          where: { id: subtaskId },
          data: { position: index },
        }),
      );
  
      await this.prisma.$transaction(updates);
  
      this.logger.log(`Subtasks reordered for task ${taskId}`);
      return { message: 'Subtasks reordered successfully' };
    }
  }