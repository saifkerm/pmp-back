import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { PrismaService } from '@pmp-back/database';
  import * as crypto from 'crypto';
  import * as Minio from 'minio';
  
  @Injectable()
  export class AttachmentsService {
    private readonly logger = new Logger(AttachmentsService.name);
    private minioClient: Minio.Client;
    private bucketName: string;
  
    constructor(
      private prisma: PrismaService,
      private configService: ConfigService,
    ) {
      this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'pmp-files');
  
      this.minioClient = new Minio.Client({
        endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
        port: parseInt(this.configService.get<string>('MINIO_PORT', '9000')),
        useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
        accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
        secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
      });
  
      this.ensureBucket();
    }
  
    private async ensureBucket() {
      try {
        const exists = await this.minioClient.bucketExists(this.bucketName);
        if (!exists) {
          await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
          this.logger.log(`Bucket created: ${this.bucketName}`);
        }
      } catch (error) {
        this.logger.error('Error ensuring bucket exists:', error);
      }
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
  
    async upload(taskId: string, file: Express.Multer.File, userId: string) {
      // Vérifier l'accès
      const task = await this.checkTaskAccess(taskId, userId);
  
      // Validation de la taille (50MB max)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new BadRequestException('File size must be less than 50MB');
      }
  
      // Générer un nom de fichier unique
      const fileExt = file.originalname.split('.').pop();
      const randomName = crypto.randomBytes(16).toString('hex');
      const filename = `attachments/${task.key}/${randomName}.${fileExt}`;
  
      try {
        // Upload vers MinIO
        await this.minioClient.putObject(
          this.bucketName,
          filename,
          file.buffer,
          file.size,
          {
            'Content-Type': file.mimetype,
            'Original-Name': file.originalname,
          },
        );
  
        // Générer l'URL publique
        const fileUrl = `http://${this.configService.get('MINIO_ENDPOINT')}:${this.configService.get('MINIO_PORT')}/${this.bucketName}/${filename}`;
  
        // Sauvegarder dans la DB
        const attachment = await this.prisma.attachment.create({
          data: {
            taskId,
            fileName: file.originalname,
            fileUrl,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedBy: userId,
          },
        });
  
        this.logger.log(`File uploaded: ${file.originalname} for task ${task.key}`);
        return attachment;
      } catch (error) {
        this.logger.error('Error uploading file:', error);
        throw new BadRequestException('Failed to upload file');
      }
    }
  
    async findAll(taskId: string, userId: string) {
      // Vérifier l'accès
      await this.checkTaskAccess(taskId, userId);
  
      const attachments = await this.prisma.attachment.findMany({
        where: { taskId },
        orderBy: { uploadedAt: 'desc' },
      });
  
      return attachments;
    }
  
    async findOne(taskId: string, attachmentId: string, userId: string) {
      // Vérifier l'accès
      await this.checkTaskAccess(taskId, userId);
  
      const attachment = await this.prisma.attachment.findUnique({
        where: { id: attachmentId, taskId },
      });
  
      if (!attachment) {
        throw new NotFoundException(`Attachment with ID ${attachmentId} not found`);
      }
  
      return attachment;
    }
  
    async delete(taskId: string, attachmentId: string, userId: string) {
      // Vérifier l'accès
      await this.checkTaskAccess(taskId, userId);
  
      const attachment = await this.prisma.attachment.findUnique({
        where: { id: attachmentId, taskId },
      });
  
      if (!attachment) {
        throw new NotFoundException(`Attachment with ID ${attachmentId} not found`);
      }
  
      try {
        // Extraire le nom du fichier depuis l'URL
        const url = new URL(attachment.fileUrl);
        const filename = url.pathname.split('/').slice(2).join('/'); // Enlever /bucket-name/
  
        // Supprimer de MinIO
        await this.minioClient.removeObject(this.bucketName, filename);
  
        // Supprimer de la DB
        await this.prisma.attachment.delete({
          where: { id: attachmentId },
        });
  
        this.logger.log(`Attachment deleted: ${attachment.fileName}`);
        return { message: 'Attachment deleted successfully' };
      } catch (error) {
        this.logger.error('Error deleting attachment:', error);
        throw new BadRequestException('Failed to delete attachment');
      }
    }
  
    async getDownloadUrl(taskId: string, attachmentId: string, userId: string) {
      // Vérifier l'accès
      await this.checkTaskAccess(taskId, userId);
  
      const attachment = await this.prisma.attachment.findUnique({
        where: { id: attachmentId, taskId },
      });
  
      if (!attachment) {
        throw new NotFoundException(`Attachment with ID ${attachmentId} not found`);
      }
  
      try {
        // Extraire le nom du fichier
        const url = new URL(attachment.fileUrl);
        const filename = url.pathname.split('/').slice(2).join('/');
  
        // Générer une URL présignée (valide 1 heure)
        const presignedUrl = await this.minioClient.presignedGetObject(
          this.bucketName,
          filename,
          3600, // 1 heure
        );
  
        return {
          url: presignedUrl,
          expiresIn: 3600,
          fileName: attachment.fileName,
        };
      } catch (error) {
        this.logger.error('Error generating download URL:', error);
        throw new BadRequestException('Failed to generate download URL');
      }
    }
  }