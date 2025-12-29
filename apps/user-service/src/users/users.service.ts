import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Logger,
  } from '@nestjs/common';
  import { PrismaService } from '@pmp-back/database';
  import { UpdateUserDto, UpdateProfileDto, QueryUsersDto } from './dto';
  
  @Injectable()
  export class UsersService {
    private readonly logger = new Logger(UsersService.name);
  
    constructor(private prisma: PrismaService) {}
  
    async findAll(query: QueryUsersDto) {
      const { search, page, limit, sortBy, sortOrder } = query;
      const skip = (page - 1) * limit;

      // Build where clause
      const where = search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },

              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {};
  
      // Get total count
      const total = await this.prisma.user.count({ where });
  
      // Get users
      const users = await this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });
  
      return {
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  
    async findOne(id: string) {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          profile: {
            select: {
              bio: true,
              timezone: true,
              language: true,
              theme: true,
              preferences: true,
            },
          },
          _count: {
            select: {
              ownedProjects: true,
              projectMembers: true,
              assignedTasks: true,
              createdTasks: true,
              comments: true,
            },
          },
        },
      });
  
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
  
      return user;
    }
  
    async findByEmail(email: string) {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          isActive: true,
        },
      });
  
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
  
      return user;
    }
  
    async update(id: string, updateUserDto: UpdateUserDto) {
      // Vérifier que l'utilisateur existe
      await this.findOne(id);
  
      // Si email change, vérifier qu'il n'est pas déjà pris
      if (updateUserDto.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: updateUserDto.email },
        });
  
        if (existingUser && existingUser.id !== id) {
          throw new ConflictException('Email already in use');
        }
      }
  
      try {
        const updatedUser = await this.prisma.user.update({
          where: { id },
          data: updateUserDto,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            isActive: true,
            updatedAt: true,
          },
        });
  
        this.logger.log(`User updated: ${updatedUser.email}`);
        return updatedUser;
      } catch (error) {
        throw new BadRequestException('Failed to update user');
      }
    }
  
    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
      // Vérifier que l'utilisateur existe
      await this.findOne(userId);
  
      try {
        const profile = await this.prisma.userProfile.upsert({
          where: { userId },
          update: updateProfileDto,
          create: {
            userId,
            ...updateProfileDto,
          },
        });
  
        this.logger.log(`Profile updated for user: ${userId}`);
        return profile;
      } catch (error) {
        throw new BadRequestException('Failed to update profile');
      }
    }
  
    async updateAvatar(userId: string, avatarUrl: string) {
      try {
        const user = await this.prisma.user.update({
          where: { id: userId },
          data: { avatar: avatarUrl },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        });
  
        this.logger.log(`Avatar updated for user: ${user.email}`);
        return user;
      } catch (error) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
    }
  
    async deactivate(id: string) {
      try {
        const user = await this.prisma.user.update({
          where: { id },
          data: { isActive: false },
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        });
  
        this.logger.log(`User deactivated: ${user.email}`);
        return { message: 'User deactivated successfully', user };
      } catch (error) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    }
  
    async activate(id: string) {
      try {
        const user = await this.prisma.user.update({
          where: { id },
          data: { isActive: true },
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        });
  
        this.logger.log(`User activated: ${user.email}`);
        return { message: 'User activated successfully', user };
      } catch (error) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    }
  
    async getStats(userId: string) {
      const stats = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          _count: {
            select: {
              ownedProjects: true,
              projectMembers: true,
              assignedTasks: true,
              createdTasks: true,
              comments: true,
            },
          },
        },
      });
  
      if (!stats) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
  
      return {
        projectsOwned: stats._count.ownedProjects,
        projectsMember: stats._count.projectMembers,
        tasksAssigned: stats._count.assignedTasks,
        tasksCreated: stats._count.createdTasks,
        comments: stats._count.comments,
      };
    }
  }