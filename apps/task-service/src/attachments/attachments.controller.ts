import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiConsumes,
    ApiBody,
  } from '@nestjs/swagger';
  import { AttachmentsService } from './attachments.service';
  import { CurrentUser } from '@pmp-back/common';
  
  @ApiTags('Attachments')
  @ApiBearerAuth()
  @Controller('tasks/:taskId/attachments')
  export class AttachmentsController {
    constructor(private attachmentsService: AttachmentsService) {}
  
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload a file attachment to a task' })
    @ApiParam({ name: 'taskId', description: 'Parent task ID' })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'File to upload (max 50MB)',
          },
        },
      },
    })
    @ApiResponse({ status: 201, description: 'File uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
    async upload(
      @Param('taskId') taskId: string,
      @UploadedFile(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          ],
        }),
      )
      file: Express.Multer.File,
      @CurrentUser('id') userId: string,
    ) {
      return this.attachmentsService.upload(taskId, file, userId);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all attachments for a task' })
    @ApiParam({ name: 'taskId', description: 'Parent task ID' })
    @ApiResponse({ status: 200, description: 'Attachments retrieved successfully' })
    async findAll(
      @Param('taskId') taskId: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.attachmentsService.findAll(taskId, userId);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get attachment details' })
    @ApiParam({ name: 'taskId', description: 'Parent task ID' })
    @ApiParam({ name: 'id', description: 'Attachment ID' })
    @ApiResponse({ status: 200, description: 'Attachment found' })
    async findOne(
      @Param('taskId') taskId: string,
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.attachmentsService.findOne(taskId, id, userId);
    }
  
    @Get(':id/download')
    @ApiOperation({ summary: 'Get presigned download URL for attachment' })
    @ApiParam({ name: 'taskId', description: 'Parent task ID' })
    @ApiParam({ name: 'id', description: 'Attachment ID' })
    @ApiResponse({ 
      status: 200, 
      description: 'Presigned URL generated (valid for 1 hour)',
      schema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Presigned download URL' },
          expiresIn: { type: 'number', description: 'Expiration time in seconds' },
          fileName: { type: 'string', description: 'Original file name' },
        },
      },
    })
    async getDownloadUrl(
      @Param('taskId') taskId: string,
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.attachmentsService.getDownloadUrl(taskId, id, userId);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete attachment' })
    @ApiParam({ name: 'taskId', description: 'Parent task ID' })
    @ApiParam({ name: 'id', description: 'Attachment ID' })
    @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
    async delete(
      @Param('taskId') taskId: string,
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.attachmentsService.delete(taskId, id, userId);
    }
  }