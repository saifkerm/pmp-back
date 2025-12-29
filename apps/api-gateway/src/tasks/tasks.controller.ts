import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
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
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { TasksProxyService } from './tasks-proxy.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private tasksProxyService: TasksProxyService) {}

  // ==================== TASKS ====================

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async createTask(
    @Body() createTaskDto: any,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.createTask(createTaskDto, token);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'columnId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async findAllTasks(
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.findAllTasks(query, token);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task found' })
  async findOneTask(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.findOneTask(id, token);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: any,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.updateTask(id, updateTaskDto, token);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  async deleteTask(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.deleteTask(id, token);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move task to another column' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task moved successfully' })
  async moveTask(
    @Param('id') id: string,
    @Body() moveTaskDto: any,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.moveTask(id, moveTaskDto, token);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign users to task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Users assigned successfully' })
  async assignTask(
    @Param('id') id: string,
    @Body() assignTaskDto: any,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.assignTask(id, assignTaskDto, token);
  }

  @Delete(':id/assignees/:userId')
  @ApiOperation({ summary: 'Unassign user from task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiParam({ name: 'userId', description: 'User ID to unassign' })
  @ApiResponse({ status: 200, description: 'User unassigned successfully' })
  async unassignTask(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.unassignTask(id, userId, token);
  }

  @Post(':id/watch')
  @ApiOperation({ summary: 'Watch a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task watched successfully' })
  async watchTask(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.watchTask(id, token);
  }

  @Delete(':id/watch')
  @ApiOperation({ summary: 'Unwatch a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task unwatched successfully' })
  async unwatchTask(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.unwatchTask(id, token);
  }

  // ==================== SUBTASKS ====================

  @Post(':taskId/subtasks')
  @ApiOperation({ summary: 'Create a new subtask' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiResponse({ status: 201, description: 'Subtask created successfully' })
  async createSubtask(
    @Param('taskId') taskId: string,
    @Body() createSubtaskDto: any,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.createSubtask(taskId, createSubtaskDto, token);
  }

  @Get(':taskId/subtasks')
  @ApiOperation({ summary: 'Get all subtasks for a task' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiResponse({ status: 200, description: 'Subtasks retrieved successfully' })
  async findAllSubtasks(
    @Param('taskId') taskId: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.findAllSubtasks(taskId, token);
  }

  @Get(':taskId/subtasks/:id')
  @ApiOperation({ summary: 'Get subtask by ID' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiParam({ name: 'id', description: 'Subtask ID' })
  @ApiResponse({ status: 200, description: 'Subtask found' })
  async findOneSubtask(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.findOneSubtask(taskId, id, token);
  }

  @Patch(':taskId/subtasks/:id')
  @ApiOperation({ summary: 'Update subtask' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiParam({ name: 'id', description: 'Subtask ID' })
  @ApiResponse({ status: 200, description: 'Subtask updated successfully' })
  async updateSubtask(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Body() updateSubtaskDto: any,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.updateSubtask(taskId, id, updateSubtaskDto, token);
  }

  @Delete(':taskId/subtasks/:id')
  @ApiOperation({ summary: 'Delete subtask' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiParam({ name: 'id', description: 'Subtask ID' })
  @ApiResponse({ status: 200, description: 'Subtask deleted successfully' })
  async deleteSubtask(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.deleteSubtask(taskId, id, token);
  }

  @Patch(':taskId/subtasks/:id/toggle')
  @ApiOperation({ summary: 'Toggle subtask completion status' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiParam({ name: 'id', description: 'Subtask ID' })
  @ApiResponse({ status: 200, description: 'Subtask toggled successfully' })
  async toggleSubtask(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.toggleSubtask(taskId, id, token);
  }

  @Patch(':taskId/subtasks/reorder')
  @ApiOperation({ summary: 'Reorder subtasks' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiResponse({ status: 200, description: 'Subtasks reordered successfully' })
  async reorderSubtasks(
    @Param('taskId') taskId: string,
    @Body('subtaskIds') subtaskIds: string[],
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.reorderSubtasks(taskId, subtaskIds, token);
  }

  // ==================== ATTACHMENTS ====================

  @Post(':taskId/attachments')
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
  async uploadAttachment(
    @Param('taskId') taskId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
        ],
      }),
    )
    file: any,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.uploadAttachment(taskId, file, token);
  }

  @Get(':taskId/attachments')
  @ApiOperation({ summary: 'Get all attachments for a task' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiResponse({ status: 200, description: 'Attachments retrieved successfully' })
  async findAllAttachments(
    @Param('taskId') taskId: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.findAllAttachments(taskId, token);
  }

  @Get(':taskId/attachments/:id')
  @ApiOperation({ summary: 'Get attachment details' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiParam({ name: 'id', description: 'Attachment ID' })
  @ApiResponse({ status: 200, description: 'Attachment found' })
  async findOneAttachment(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.findOneAttachment(taskId, id, token);
  }

  @Get(':taskId/attachments/:id/download')
  @ApiOperation({ summary: 'Get presigned download URL for attachment' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiParam({ name: 'id', description: 'Attachment ID' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated (valid for 1 hour)',
  })
  async getAttachmentDownloadUrl(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.getAttachmentDownloadUrl(taskId, id, token);
  }

  @Delete(':taskId/attachments/:id')
  @ApiOperation({ summary: 'Delete attachment' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiParam({ name: 'id', description: 'Attachment ID' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  async deleteAttachment(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.deleteAttachment(taskId, id, token);
  }

  // ==================== COMMENTS ====================

  @Post(':taskId/comments')
  @ApiOperation({ summary: 'Create a comment' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 404, description: 'Task or parent comment not found' })
  async createComment(
    @Param('taskId') taskId: string,
    @Body() createCommentDto: any,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.createComment(taskId, createCommentDto, token);
  }

  @Get(':taskId/comments')
  @ApiOperation({ summary: 'Get all comments for a task' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  async findAllComments(
    @Param('taskId') taskId: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.findAllComments(taskId, token);
  }

  @Get(':taskId/comments/:id')
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment found' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOneComment(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.findOneComment(taskId, id, token);
  }

  @Patch(':taskId/comments/:id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 403, description: 'Can only edit your own comments' })
  async updateComment(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Body() updateCommentDto: any,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.updateComment(
      taskId,
      id,
      updateCommentDto,
      token,
    );
  }

  @Delete(':taskId/comments/:id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Can only delete your own comments' })
  async deleteComment(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.deleteComment(taskId, id, token);
  }

  @Get(':taskId/comments/:id/replies')
  @ApiOperation({ summary: 'Get all replies to a comment' })
  @ApiParam({ name: 'taskId', description: 'Parent task ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully' })
  async getCommentReplies(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.tasksProxyService.getCommentReplies(taskId, id, token);
  }
}