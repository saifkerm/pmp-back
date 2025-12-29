import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
    Logger,
  } from '@nestjs/common';
  import { PrismaService } from '@pmp-back/database';
  import { CreateProjectDto, UpdateProjectDto, QueryProjectsDto, AddMemberDto } from './dto';
  import { Prisma } from '@prisma/client';
  
  @Injectable()
  export class ProjectsService {
    private readonly logger = new Logger(ProjectsService.name);
  
    constructor(private prisma: PrismaService) {}
  
    async create(createProjectDto: CreateProjectDto, ownerId: string) {
      // Vérifier que la clé n'existe pas déjà
      const existingProject = await this.prisma.project.findUnique({
        where: { key: createProjectDto.key },
      });
  
      if (existingProject) {
        throw new ConflictException(`Project key "${createProjectDto.key}" already exists`);
      }
  
      try {
        const project = await this.prisma.project.create({
          data: {
            ...createProjectDto,
            ownerId,
            // Créer un board par défaut
            boards: {
              create: {
                name: 'Main Board',
                position: 0,
                type: 'KANBAN',
                columns: {
                  create: [
                    { name: 'To Do', position: 0, color: '#64748B' },
                    { name: 'In Progress', position: 1, color: '#3B82F6' },
                    { name: 'Review', position: 2, color: '#F59E0B' },
                    { name: 'Done', position: 3, color: '#10B981' },
                  ],
                },
              },
            },
          },
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            boards: {
              include: {
                columns: {
                  orderBy: { position: 'asc' },
                },
              },
            },
            _count: {
              select: {
                members: true,
                boards: true,
                labels: true,
              },
            },
          },
        });
  
        this.logger.log(`Project created: ${project.name} (${project.key}) by ${ownerId}`);
        return project;
      } catch (error) {
        this.logger.error('Error creating project:', error);
        throw error;
      }
    }
  
    async findAll(userId: string, query: QueryProjectsDto) {
      const { search, page, limit, includeArchived } = query;
      const skip = (page - 1) * limit;
  
      // L'utilisateur peut voir les projets dont il est owner ou membre
      const where: Prisma.ProjectWhereInput = {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { key: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(includeArchived ? {} : { isArchived: false }),
      };
  
      const [projects, total] = await Promise.all([
        this.prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                members: true,
                boards: true,
                labels: true,
              },
            },
          },
        }),
        this.prisma.project.count({ where }),
      ]);
  
      return {
        data: projects,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  
    async findOne(id: string, userId: string) {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          members: {
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
          boards: {
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
          },
          labels: {
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: {
              members: true,
              boards: true,
              labels: true,
            },
          },
        },
      });
  
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
  
      // Vérifier que l'utilisateur a accès au projet
      const hasAccess =
        project.ownerId === userId ||
        project.members.some((member) => member.userId === userId);
  
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this project');
      }
  
      return project;
    }
  
    async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
      // Vérifier les permissions
      const project = await this.findOne(id, userId);
  
      const isOwnerOrAdmin =
        project.ownerId === userId ||
        project.members.some(
          (m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'ADMIN'),
        );
  
      if (!isOwnerOrAdmin) {
        throw new ForbiddenException('Only owners and admins can update the project');
      }
  
      // Si la clé change, vérifier qu'elle n'existe pas
      if (updateProjectDto.key && updateProjectDto.key !== project.key) {
        const existing = await this.prisma.project.findUnique({
          where: { key: updateProjectDto.key },
        });
  
        if (existing) {
          throw new ConflictException(`Project key "${updateProjectDto.key}" already exists`);
        }
      }
  
      const updated = await this.prisma.project.update({
        where: { id },
        data: updateProjectDto,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });
  
      this.logger.log(`Project updated: ${updated.name} (${updated.key})`);
      return updated;
    }
  
    async archive(id: string, userId: string) {
      const project = await this.findOne(id, userId);
  
      if (project.ownerId !== userId) {
        throw new ForbiddenException('Only the project owner can archive the project');
      }
  
      const archived = await this.prisma.project.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date(),
        },
      });
  
      this.logger.log(`Project archived: ${archived.name}`);
      return { message: 'Project archived successfully', project: archived };
    }
  
    async restore(id: string, userId: string) {
      const project = await this.prisma.project.findUnique({
        where: { id },
      });
  
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
  
      if (project.ownerId !== userId) {
        throw new ForbiddenException('Only the project owner can restore the project');
      }
  
      const restored = await this.prisma.project.update({
        where: { id },
        data: {
          isArchived: false,
          archivedAt: null,
        },
      });
  
      this.logger.log(`Project restored: ${restored.name}`);
      return { message: 'Project restored successfully', project: restored };
    }
  
    async delete(id: string, userId: string) {
      const project = await this.findOne(id, userId);
  
      if (project.ownerId !== userId) {
        throw new ForbiddenException('Only the project owner can delete the project');
      }
  
      await this.prisma.project.delete({
        where: { id },
      });
  
      this.logger.log(`Project deleted: ${project.name} (${project.key})`);
      return { message: 'Project deleted successfully' };
    }
  
    // Gestion des membres
    async addMember(projectId: string, addMemberDto: AddMemberDto, userId: string) {
      const project = await this.findOne(projectId, userId);
  
      const isOwnerOrAdmin =
        project.ownerId === userId ||
        project.members.some(
          (m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'ADMIN'),
        );
  
      if (!isOwnerOrAdmin) {
        throw new ForbiddenException('Only owners and admins can add members');
      }
  
      // Vérifier que l'utilisateur n'est pas déjà membre
      const existingMember = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: addMemberDto.userId,
          },
        },
      });
  
      if (existingMember) {
        throw new ConflictException('User is already a member of this project');
      }
  
      const member = await this.prisma.projectMember.create({
        data: {
          projectId,
          userId: addMemberDto.userId,
          role: addMemberDto.role,
        },
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
      });
  
      this.logger.log(`Member added to project ${projectId}: ${addMemberDto.userId}`);
      return member;
    }
  
    async removeMember(projectId: string, memberId: string, userId: string) {
      const project = await this.findOne(projectId, userId);
  
      const isOwnerOrAdmin =
        project.ownerId === userId ||
        project.members.some(
          (m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'ADMIN'),
        );
  
      if (!isOwnerOrAdmin) {
        throw new ForbiddenException('Only owners and admins can remove members');
      }
  
      // Ne peut pas retirer le owner
      if (memberId === project.ownerId) {
        throw new ForbiddenException('Cannot remove the project owner');
      }
  
      await this.prisma.projectMember.delete({
        where: {
          projectId_userId: {
            projectId,
            userId: memberId,
          },
        },
      });
  
      this.logger.log(`Member removed from project ${projectId}: ${memberId}`);
      return { message: 'Member removed successfully' };
    }
  
    async getMembers(projectId: string, userId: string) {
      await this.findOne(projectId, userId); // Vérifier l'accès
  
      const members = await this.prisma.projectMember.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      });
  
      return members;
    }
  }