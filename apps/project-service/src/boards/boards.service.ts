import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger,
  } from '@nestjs/common';
  import { PrismaService } from '@pmp-back/database';
  import {
    CreateBoardDto,
    UpdateBoardDto,
    CreateColumnDto,
    UpdateColumnDto,
  } from './dto';
  
  @Injectable()
  export class BoardsService {
    private readonly logger = new Logger(BoardsService.name);
  
    constructor(private prisma: PrismaService) {}
  
    private async checkProjectAccess(projectId: string, userId: string) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: {
            where: { userId },
          },
        },
      });
  
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }
  
      const hasAccess =
        project.ownerId === userId || project.members.length > 0;
  
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this project');
      }
  
      return project;
    }
  
    private async checkBoardAccess(boardId: string, userId: string) {
      const board = await this.prisma.board.findUnique({
        where: { id: boardId },
        include: {
          project: {
            include: {
              members: {
                where: { userId },
              },
            },
          },
        },
      });
  
      if (!board) {
        throw new NotFoundException(`Board with ID ${boardId} not found`);
      }
  
      const hasAccess =
        board.project.ownerId === userId || board.project.members.length > 0;
  
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this board');
      }
  
      return board;
    }
  
    // ==================== BOARDS ====================
  
    async create(projectId: string, createBoardDto: CreateBoardDto, userId: string) {
      await this.checkProjectAccess(projectId, userId);
  
      // Obtenir la position suivante
      const maxPosition = await this.prisma.board.findFirst({
        where: { projectId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
  
      const position = createBoardDto.position ?? (maxPosition?.position ?? 0) + 1;
  
      const board = await this.prisma.board.create({
        data: {
          ...createBoardDto,
          projectId,
          position,
        },
        include: {
          columns: {
            orderBy: { position: 'asc' },
          },
        },
      });
  
      this.logger.log(`Board created: ${board.name} in project ${projectId}`);
      return board;
    }
  
    async findAll(projectId: string, userId: string) {
      await this.checkProjectAccess(projectId, userId);
  
      const boards = await this.prisma.board.findMany({
        where: { projectId },
        include: {
          columns: {
            orderBy: { position: 'asc' },
            include: {
              _count: {
                select: { tasks: true },
              },
            },
          },
        },
        orderBy: { position: 'asc' },
      });
  
      return boards;
    }
  
    async findOne(id: string, userId: string) {
      const board = await this.checkBoardAccess(id, userId);
  
      const fullBoard = await this.prisma.board.findUnique({
        where: { id },
        include: {
          columns: {
            orderBy: { position: 'asc' },
            include: {
              tasks: {
                orderBy: { position: 'asc' },
                include: {
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
              },
            },
          },
        },
      });
  
      return fullBoard;
    }
  
    async update(id: string, updateBoardDto: UpdateBoardDto, userId: string) {
      await this.checkBoardAccess(id, userId);
  
      const updated = await this.prisma.board.update({
        where: { id },
        data: updateBoardDto,
        include: {
          columns: {
            orderBy: { position: 'asc' },
          },
        },
      });
  
      this.logger.log(`Board updated: ${updated.name}`);
      return updated;
    }
  
    async delete(id: string, userId: string) {
      await this.checkBoardAccess(id, userId);
  
      await this.prisma.board.delete({
        where: { id },
      });
  
      this.logger.log(`Board deleted: ${id}`);
      return { message: 'Board deleted successfully' };
    }
  
    async reorder(projectId: string, boardIds: string[], userId: string) {
      await this.checkProjectAccess(projectId, userId);
  
      // Mettre à jour les positions
      const updates = boardIds.map((boardId, index) =>
        this.prisma.board.update({
          where: { id: boardId },
          data: { position: index },
        }),
      );
  
      await this.prisma.$transaction(updates);
  
      this.logger.log(`Boards reordered in project ${projectId}`);
      return { message: 'Boards reordered successfully' };
    }
  
    // ==================== COLUMNS ====================
  
    async createColumn(
      boardId: string,
      createColumnDto: CreateColumnDto,
      userId: string,
    ) {
      await this.checkBoardAccess(boardId, userId);
  
      // Obtenir la position suivante
      const maxPosition = await this.prisma.column.findFirst({
        where: { boardId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
  
      const position = createColumnDto.position ?? (maxPosition?.position ?? 0) + 1;
  
      const column = await this.prisma.column.create({
        data: {
          ...createColumnDto,
          boardId,
          position,
        },
      });
  
      this.logger.log(`Column created: ${column.name} in board ${boardId}`);
      return column;
    }
  
    async updateColumn(
      columnId: string,
      updateColumnDto: UpdateColumnDto,
      userId: string,
    ) {
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
  
      const updated = await this.prisma.column.update({
        where: { id: columnId },
        data: updateColumnDto,
      });
  
      this.logger.log(`Column updated: ${updated.name}`);
      return updated;
    }
  
    async deleteColumn(columnId: string, userId: string) {
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
          _count: {
            select: { tasks: true },
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
  
      // Vérifier qu'il n'y a pas de tâches
      if (column._count.tasks > 0) {
        throw new ForbiddenException(
          `Cannot delete column with ${column._count.tasks} task(s). Move or delete tasks first.`,
        );
      }
  
      await this.prisma.column.delete({
        where: { id: columnId },
      });
  
      this.logger.log(`Column deleted: ${columnId}`);
      return { message: 'Column deleted successfully' };
    }
  
    async reorderColumns(boardId: string, columnIds: string[], userId: string) {
      await this.checkBoardAccess(boardId, userId);
  
      // Mettre à jour les positions
      const updates = columnIds.map((columnId, index) =>
        this.prisma.column.update({
          where: { id: columnId },
          data: { position: index },
        }),
      );
  
      await this.prisma.$transaction(updates);
  
      this.logger.log(`Columns reordered in board ${boardId}`);
      return { message: 'Columns reordered successfully' };
    }
  
    async toggleCollapse(columnId: string, userId: string) {
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
  
      const updated = await this.prisma.column.update({
        where: { id: columnId },
        data: { isCollapsed: !column.isCollapsed },
      });
  
      return updated;
    }
  }