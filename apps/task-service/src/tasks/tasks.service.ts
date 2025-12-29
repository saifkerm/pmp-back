import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
  } from '@nestjs/common';
  import { PrismaService } from '@pmp-back/database';
  import { Prisma } from '@prisma/client';
  import {
    CreateTaskDto,
    UpdateTaskDto,
    QueryTasksDto,
    MoveTaskDto,
    AssignTaskDto,
  } from './dto';
  
  @Injectable()
  export class TasksService {
    private readonly logger = new Logger(TasksService.name);
  
    constructor(private prisma: PrismaService) {}
  
    private async checkColumnAccess(columnId: string, userId: string) {
      const column = await this.prisma.column.findUnique({
        where: { id: columnId },
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
      });
  
      if (!column) {
        throw new NotFoundException(`Column with ID ${columnId} not found`);
      }
  
      const hasAccess =
        column.board.project.ownerId === userId ||
        column.board.project.members.length > 0;
  
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this column');
      }
  
      return column;
    }
  
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
  
    async create(createTaskDto: CreateTaskDto, userId: string) {
      const { assigneeIds, labelIds, ...taskData } = createTaskDto;
  
      // Vérifier l'accès à la colonne
      const column = await this.checkColumnAccess(taskData.columnId, userId);
  
      // Obtenir la position suivante si non fournie
      if (taskData.position === undefined) {
        const maxPosition = await this.prisma.task.findFirst({
          where: { columnId: taskData.columnId },
          orderBy: { position: 'desc' },
          select: { position: true },
        });
        taskData.position = (maxPosition?.position ?? -1) + 1;
      }
  
      // Générer la clé de la tâche (PROJECT_KEY-NUMBER)
      const projectKey = column.board.project.key;
      const lastTask = await this.prisma.task.findFirst({
        where: {
          key: {
            startsWith: `${projectKey}-`,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
  
      const taskNumber = lastTask
        ? parseInt(lastTask.key.split('-')[1]) + 1
        : 1;
      const taskKey = `${projectKey}-${taskNumber}`;
  
      // Créer la tâche
      const task = await this.prisma.task.create({
        data: {
          ...taskData,
          key: taskKey,
          creatorId: userId,
          assignees: assigneeIds
            ? {
                create: assigneeIds.map((userId) => ({
                  userId,
                  assignedBy: userId,
                })),
              }
            : undefined,
          labels: labelIds
            ? {
                create: labelIds.map((labelId) => ({
                  labelId,
                })),
              }
            : undefined,
        },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          _count: {
            select: {
              subtasks: true,
              comments: true,
              attachments: true,
            },
          },
        },
      });
  
      this.logger.log(`Task created: ${task.key} - ${task.title}`);
      return task;
    }
  
    async findAll(query: QueryTasksDto, userId: string) {
      const {
        search,
        page,
        limit,
        status,
        priority,
        assignedTo,
        columnId,
        labelIds,
        dueBefore,
        dueAfter,
        sortBy,
        sortOrder,
      } = query;
  
      const skip = (page - 1) * limit;
  
      // Build where clause
      const where: Prisma.TaskWhereInput = {
        column: {
          board: {
            project: {
              OR: [
                { ownerId: userId },
                { members: { some: { userId } } },
              ],
            },
          },
        },
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { key: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedTo && {
          assignees: {
            some: { userId: assignedTo },
          },
        }),
        ...(columnId && { columnId }),
        ...(labelIds && labelIds.length > 0 && {
          labels: {
            some: {
              labelId: { in: labelIds },
            },
          },
        }),
        ...(dueBefore && {
          dueDate: { lte: new Date(dueBefore) },
        }),
        ...(dueAfter && {
          dueDate: { gte: new Date(dueAfter) },
        }),
      };
  
      // Get total count
      const total = await this.prisma.task.count({ where });
  
      // Get tasks
      const tasks = await this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          _count: {
            select: {
              subtasks: true,
              comments: true,
              attachments: true,
            },
          },
        },
      });
  
      return {
        data: tasks,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  
    async findOne(id: string, userId: string) {
      await this.checkTaskAccess(id, userId);
  
      const task = await this.prisma.task.findUnique({
        where: { id },
        include: {
          column: {
            include: {
              board: {
                include: {
                  project: {
                    select: {
                      id: true,
                      name: true,
                      key: true,
                    },
                  },
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          subtasks: {
            orderBy: { position: 'asc' },
          },
          attachments: {
            orderBy: { uploadedAt: 'desc' },
          },
          dependencies: {
            include: {
              dependsOnTask: {
                select: {
                  id: true,
                  key: true,
                  title: true,
                  status: true,
                },
              },
            },
          },
          dependents: {
            include: {
              task: {
                select: {
                  id: true,
                  key: true,
                  title: true,
                  status: true,
                },
              },
            },
          },
          watchers: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });
  
      return task;
    }
  
    async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
      const { assigneeIds, labelIds, ...taskData } = updateTaskDto;
  
      // Vérifier l'accès
      await this.checkTaskAccess(id, userId);
  
      // Si la colonne change, vérifier l'accès à la nouvelle colonne
      if (taskData.columnId) {
        await this.checkColumnAccess(taskData.columnId, userId);
      }
  
      // Mettre à jour la tâche
      const task = await this.prisma.task.update({
        where: { id },
        data: {
          ...taskData,
          ...(assigneeIds && {
            assignees: {
              deleteMany: {},
              create: assigneeIds.map((userId) => ({
                userId,
                assignedBy: userId,
              })),
            },
          }),
          ...(labelIds && {
            labels: {
              deleteMany: {},
              create: labelIds.map((labelId) => ({
                labelId,
              })),
            },
          }),
        },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
        },
      });
  
      this.logger.log(`Task updated: ${task.key}`);
      return task;
    }
  
    async delete(id: string, userId: string) {
      await this.checkTaskAccess(id, userId);
  
      const task = await this.prisma.task.delete({
        where: { id },
      });
  
      this.logger.log(`Task deleted: ${task.key}`);
      return { message: 'Task deleted successfully' };
    }
  
    async move(id: string, moveTaskDto: MoveTaskDto, userId: string) {
      const { columnId, position } = moveTaskDto;
  
      // Vérifier l'accès
      const task = await this.checkTaskAccess(id, userId);
      await this.checkColumnAccess(columnId, userId);
  
      // Si même colonne, juste réordonner
      if (task.columnId === columnId) {
        // Mettre à jour les positions
        await this.prisma.$transaction(async (tx) => {
          // Décaler les autres tâches
          if (position > task.position) {
            await tx.task.updateMany({
              where: {
                columnId,
                position: {
                  gt: task.position,
                  lte: position,
                },
              },
              data: {
                position: {
                  decrement: 1,
                },
              },
            });
          } else {
            await tx.task.updateMany({
              where: {
                columnId,
                position: {
                  gte: position,
                  lt: task.position,
                },
              },
              data: {
                position: {
                  increment: 1,
                },
              },
            });
          }
  
          // Mettre à jour la tâche
          await tx.task.update({
            where: { id },
            data: { position },
          });
        });
      } else {
        // Changement de colonne
        await this.prisma.$transaction(async (tx) => {
          // Décaler les tâches de l'ancienne colonne
          await tx.task.updateMany({
            where: {
              columnId: task.columnId,
              position: { gt: task.position },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });
  
          // Décaler les tâches de la nouvelle colonne
          await tx.task.updateMany({
            where: {
              columnId,
              position: { gte: position },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          });
  
          // Mettre à jour la tâche
          await tx.task.update({
            where: { id },
            data: {
              columnId,
              position,
            },
          });
        });
      }
  
      this.logger.log(`Task moved: ${task.key} to column ${columnId}`);
      return { message: 'Task moved successfully' };
    }
  
    async assign(id: string, assignTaskDto: AssignTaskDto, userId: string) {
      await this.checkTaskAccess(id, userId);
  
      // Supprimer les assignations existantes et en créer de nouvelles
      await this.prisma.task.update({
        where: { id },
        data: {
          assignees: {
            deleteMany: {},
            create: assignTaskDto.userIds.map((uid) => ({
              userId: uid,
              assignedBy: userId,
            })),
          },
        },
      });
  
      this.logger.log(`Task assigned: ${id}`);
      return { message: 'Task assigned successfully' };
    }
  
    async unassign(id: string, userIdToRemove: string, userId: string) {
      await this.checkTaskAccess(id, userId);
  
      await this.prisma.taskAssignee.deleteMany({
        where: {
          taskId: id,
          userId: userIdToRemove,
        },
      });
  
      this.logger.log(`User unassigned from task: ${id}`);
      return { message: 'User unassigned successfully' };
    }
  
    async addWatcher(taskId: string, userId: string) {
      await this.checkTaskAccess(taskId, userId);
  
      const existing = await this.prisma.taskWatcher.findUnique({
        where: {
          taskId_userId: {
            taskId,
            userId,
          },
        },
      });
  
      if (existing) {
        throw new BadRequestException('Already watching this task');
      }
  
      await this.prisma.taskWatcher.create({
        data: {
          taskId,
          userId,
        },
      });
  
      return { message: 'Watcher added successfully' };
    }
  
    async removeWatcher(taskId: string, userId: string) {
      await this.checkTaskAccess(taskId, userId);
  
      await this.prisma.taskWatcher.delete({
        where: {
          taskId_userId: {
            taskId,
            userId,
          },
        },
      });
  
      return { message: 'Watcher removed successfully' };
    }
  }