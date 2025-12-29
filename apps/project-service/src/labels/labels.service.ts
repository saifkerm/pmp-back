import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    Logger,
  } from '@nestjs/common';
  import { PrismaService } from '@pmp-back/database';
  import { CreateLabelDto, UpdateLabelDto } from './dto';
  
  @Injectable()
  export class LabelsService {
    private readonly logger = new Logger(LabelsService.name);
  
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
  
    async create(projectId: string, createLabelDto: CreateLabelDto, userId: string) {
      await this.checkProjectAccess(projectId, userId);
  
      // Vérifier que le nom n'existe pas déjà dans ce projet
      const existingLabel = await this.prisma.label.findUnique({
        where: {
          projectId_name: {
            projectId,
            name: createLabelDto.name,
          },
        },
      });
  
      if (existingLabel) {
        throw new ConflictException(
          `Label "${createLabelDto.name}" already exists in this project`,
        );
      }
  
      const label = await this.prisma.label.create({
        data: {
          ...createLabelDto,
          projectId,
        },
      });
  
      this.logger.log(`Label created: ${label.name} in project ${projectId}`);
      return label;
    }
  
    async findAll(projectId: string, userId: string) {
      await this.checkProjectAccess(projectId, userId);
  
      const labels = await this.prisma.label.findMany({
        where: { projectId },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
  
      return labels;
    }
  
    async findOne(id: string, userId: string) {
      const label = await this.prisma.label.findUnique({
        where: { id },
        include: {
          project: {
            include: {
              members: {
                where: { userId },
              },
            },
          },
          _count: {
            select: { tasks: true },
          },
        },
      });
  
      if (!label) {
        throw new NotFoundException(`Label with ID ${id} not found`);
      }
  
      const hasAccess =
        label.project.ownerId === userId || label.project.members.length > 0;
  
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this label');
      }
  
      return label;
    }
  
    async update(id: string, updateLabelDto: UpdateLabelDto, userId: string) {
      const label = await this.findOne(id, userId);
  
      // Si le nom change, vérifier qu'il n'existe pas déjà
      if (updateLabelDto.name && updateLabelDto.name !== label.name) {
        const existingLabel = await this.prisma.label.findUnique({
          where: {
            projectId_name: {
              projectId: label.projectId,
              name: updateLabelDto.name,
            },
          },
        });
  
        if (existingLabel) {
          throw new ConflictException(
            `Label "${updateLabelDto.name}" already exists in this project`,
          );
        }
      }
  
      const updated = await this.prisma.label.update({
        where: { id },
        data: updateLabelDto,
      });
  
      this.logger.log(`Label updated: ${updated.name}`);
      return updated;
    }
  
    async delete(id: string, userId: string) {
      const label = await this.findOne(id, userId);
  
      await this.prisma.label.delete({
        where: { id },
      });
  
      this.logger.log(`Label deleted: ${label.name}`);
      return { message: 'Label deleted successfully' };
    }
  }