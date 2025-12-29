import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
  } from '@nestjs/swagger';
  import { CommentsService } from './comments.service';
  import { CreateCommentDto, UpdateCommentDto } from './dto';
  import { CurrentUser } from '@pmp-back/common';
  
  @ApiTags('Comments')
  @ApiBearerAuth()
  @Controller('tasks/:taskId/comments')
  export class CommentsController {
    constructor(private commentsService: CommentsService) {}
  
    @Post()
    @ApiOperation({ 
      summary: 'Create a comment',
      description: 'Create a new comment on a task. Can be a root comment or a reply to another comment.' 
    })
    @ApiParam({ name: 'taskId', description: 'Task ID' })
    @ApiResponse({ status: 201, description: 'Comment created successfully' })
    @ApiResponse({ status: 404, description: 'Task or parent comment not found' })
    @ApiResponse({ status: 403, description: 'Access forbidden' })
    async create(
      @Param('taskId') taskId: string,
      @Body() createCommentDto: CreateCommentDto,
      @CurrentUser('id') userId: string,
    ) {
      return this.commentsService.create(taskId, createCommentDto, userId);
    }
  
    @Get()
    @ApiOperation({ 
      summary: 'Get all comments for a task',
      description: 'Returns all root comments with their replies in a threaded structure.' 
    })
    @ApiParam({ name: 'taskId', description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    @ApiResponse({ status: 403, description: 'Access forbidden' })
    async findAll(
      @Param('taskId') taskId: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.commentsService.findAll(taskId, userId);
    }
  
    @Get(':id')
    @ApiOperation({ 
      summary: 'Get a comment by ID',
      description: 'Returns a single comment with its author, parent, and replies.' 
    })
    @ApiParam({ name: 'taskId', description: 'Task ID' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment found' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 403, description: 'Access forbidden' })
    async findOne(
      @Param('taskId') taskId: string,
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.commentsService.findOne(taskId, id, userId);
    }
  
    @Patch(':id')
    @ApiOperation({ 
      summary: 'Update a comment',
      description: 'Update comment content. Only the author can edit their own comments.' 
    })
    @ApiParam({ name: 'taskId', description: 'Task ID' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment updated successfully' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 403, description: 'Can only edit your own comments' })
    async update(
      @Param('taskId') taskId: string,
      @Param('id') id: string,
      @Body() updateCommentDto: UpdateCommentDto,
      @CurrentUser('id') userId: string,
    ) {
      return this.commentsService.update(taskId, id, updateCommentDto, userId);
    }
  
    @Delete(':id')
    @ApiOperation({ 
      summary: 'Delete a comment',
      description: 'Delete a comment. Only the author can delete their own comments. Cannot delete comments with replies.' 
    })
    @ApiParam({ name: 'taskId', description: 'Task ID' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 403, description: 'Can only delete your own comments or comment has replies' })
    async delete(
      @Param('taskId') taskId: string,
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.commentsService.delete(taskId, id, userId);
    }
  
    @Get(':id/replies')
    @ApiOperation({ 
      summary: 'Get all replies to a comment',
      description: 'Returns all direct replies to a specific comment.' 
    })
    @ApiParam({ name: 'taskId', description: 'Task ID' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Replies retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 403, description: 'Access forbidden' })
    async getReplies(
      @Param('taskId') taskId: string,
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.commentsService.getReplies(taskId, id, userId);
    }
  }