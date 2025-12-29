import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger,
  } from '@nestjs/common';
  import { PrismaService } from '@pmp-back/database';
  import { CreateCommentDto, UpdateCommentDto } from './dto';
  
  @Injectable()
  export class CommentsService {
    private readonly logger = new Logger(CommentsService.name);
  
    constructor(private prisma: PrismaService) {}
  
    /**
     * Vérifier que l'utilisateur a accès à la tâche
     */
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
  
    /**
     * Extraire les mentions depuis le contenu (@username)
     * Format: @[userId] dans le texte
     */
    private extractMentions(content: string): string[] {
      const mentionRegex = /@\[([a-f0-9-]{36})\]/g;
      const mentions: string[] = [];
      let match;
  
      while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1]);
      }
  
      return [...new Set(mentions)]; // Remove duplicates
    }
  
    /**
     * Créer un commentaire
     */
    async create(
      taskId: string,
      createCommentDto: CreateCommentDto,
      userId: string,
    ) {
      await this.checkTaskAccess(taskId, userId);
  
      // Vérifier que le parent existe si fourni
      if (createCommentDto.parentId) {
        const parentComment = await this.prisma.comment.findUnique({
          where: { id: createCommentDto.parentId },
        });
  
        if (!parentComment) {
          throw new NotFoundException(
            `Parent comment with ID ${createCommentDto.parentId} not found`,
          );
        }
  
        if (parentComment.taskId !== taskId) {
          throw new ForbiddenException(
            'Parent comment does not belong to this task',
          );
        }
      }
  
      // Extraire les mentions du contenu
      const autoMentions = this.extractMentions(createCommentDto.content);
      const allMentions = [
        ...new Set([...(createCommentDto.mentions || []), ...autoMentions]),
      ];
  
      const comment = await this.prisma.comment.create({
        data: {
          content: createCommentDto.content,
          taskId,
          authorId: userId,
          parentId: createCommentDto.parentId,
          mentions: allMentions,
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          parent: {
            select: {
              id: true,
              content: true,
              authorId: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      });
  
      this.logger.log(`Comment created: ${comment.id} on task ${taskId}`);
      return comment;
    }
  
    /**
     * Récupérer tous les commentaires d'une tâche
     */
    async findAll(taskId: string, userId: string) {
      await this.checkTaskAccess(taskId, userId);
  
      const comments = await this.prisma.comment.findMany({
        where: { 
          taskId,
          parentId: null, // Only root comments
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          replies: {
            include: {
              author: {
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
                  replies: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
  
      return comments;
    }
  
    /**
     * Récupérer un commentaire par ID
     */
    async findOne(taskId: string, commentId: string, userId: string) {
      await this.checkTaskAccess(taskId, userId);
  
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          parent: {
            include: {
              author: {
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
          replies: {
            include: {
              author: {
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
                  replies: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      });
  
      if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }
  
      if (comment.taskId !== taskId) {
        throw new ForbiddenException('Comment does not belong to this task');
      }
  
      return comment;
    }
  
    /**
     * Mettre à jour un commentaire
     */
    async update(
      taskId: string,
      commentId: string,
      updateCommentDto: UpdateCommentDto,
      userId: string,
    ) {
      await this.checkTaskAccess(taskId, userId);
  
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });
  
      if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }
  
      if (comment.taskId !== taskId) {
        throw new ForbiddenException('Comment does not belong to this task');
      }
  
      // Seul l'auteur peut modifier son commentaire
      if (comment.authorId !== userId) {
        throw new ForbiddenException('You can only edit your own comments');
      }
  
      // Extraire les mentions du nouveau contenu
      const autoMentions = this.extractMentions(updateCommentDto.content);
      const allMentions = [
        ...new Set([...(updateCommentDto.mentions || []), ...autoMentions]),
      ];
  
      const updated = await this.prisma.comment.update({
        where: { id: commentId },
        data: {
          content: updateCommentDto.content,
          mentions: allMentions,
          isEdited: true,
        },
        include: {
          author: {
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
              replies: true,
            },
          },
        },
      });
  
      this.logger.log(`Comment updated: ${commentId}`);
      return updated;
    }
  
    /**
     * Supprimer un commentaire
     */
    async delete(taskId: string, commentId: string, userId: string) {
      await this.checkTaskAccess(taskId, userId);
  
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          _count: {
            select: {
              replies: true,
            },
          },
        },
      });
  
      if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }
  
      if (comment.taskId !== taskId) {
        throw new ForbiddenException('Comment does not belong to this task');
      }
  
      // Seul l'auteur peut supprimer son commentaire
      if (comment.authorId !== userId) {
        throw new ForbiddenException('You can only delete your own comments');
      }
  
      // Vérifier s'il y a des réponses
      if (comment._count.replies > 0) {
        // Option 1: Empêcher la suppression
        throw new ForbiddenException(
          `Cannot delete comment with ${comment._count.replies} reply/replies. Delete replies first.`,
        );
  
        // Option 2 (alternative): Cascade delete
        // await this.prisma.comment.deleteMany({
        //   where: { parentId: commentId },
        // });
      }
  
      await this.prisma.comment.delete({
        where: { id: commentId },
      });
  
      this.logger.log(`Comment deleted: ${commentId}`);
      return { message: 'Comment deleted successfully' };
    }
  
    /**
     * Récupérer les réponses d'un commentaire
     */
    async getReplies(taskId: string, commentId: string, userId: string) {
      await this.checkTaskAccess(taskId, userId);
  
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });
  
      if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }
  
      if (comment.taskId !== taskId) {
        throw new ForbiddenException('Comment does not belong to this task');
      }
  
      const replies = await this.prisma.comment.findMany({
        where: { parentId: commentId },
        include: {
          author: {
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
              replies: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
  
      return replies;
    }
  }