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
  import { SubtasksService } from './subtasks.service';
  import { CreateSubtaskDto, UpdateSubtaskDto } from './dto';
  import { CurrentUser } from '@pmp-back/common';
  
  @ApiTags('Subtasks')
  @ApiBearerAuth()
  @Controller('tasks/:taskId/subtasks')
  export class SubtasksController {
    constructor(private subtasksService: SubtasksService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new subtask' })
    @ApiParam({ name: 'taskId', description: 'Parent task ID' })
    @ApiResponse({ status: 201, description: 'Subtask created successfully' })
    async create(
      @Param('taskId') taskId: string,
      @Body() createSubtaskDto: CreateSubtaskDto,
      @CurrentUser('id') userId: string,
    ) {
      return this.subtasksService.create(taskId, createSubtaskDto, userId);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all subtasks for a task' })
    @ApiParam({ name: 'taskId', description: 'Parent task ID' })
    @ApiResponse({ status: 200, description: 'Subtasks retrieved successfully' })
    async findAll(
      @Param('taskId') taskId: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.subtasksService.findAll(taskId, userId);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get subtask by ID' })
    @ApiParam({ name: 'taskId', description: 'Parent task ID' })
    @ApiParam({ name: 'id', description: 'Subtask ID' })
    @ApiResponse({ status: 200, description: 'Subtask found' })
    async findOne(
      @Param('taskId') taskId: string,
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.subtasksService.findOne(taskId, id, userId);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update subtask' })
    @ApiParam({ name: 'taskId', description: 'Parent task ID' })
    @ApiParam({ name: 'id', description: 'Subtask ID' })
    @ApiResponse({ status: 200, description: 'Subtask updated successfully' })
    async update(
      @Param('taskId') taskId: string,
      @Param('id') id: string,
      @Body() updateSubtaskDto: UpdateSubtaskDto,
      @CurrentUser('id') userId: string,
    ) {
      return this.subtasksService.update(taskId, id, updateSubtaskDto, userId);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete subtask' })
    @ApiParam({ name: 'taskId', description: 'Parent task ID' })
    @ApiParam({ name: 'id', description: 'Subtask ID' })
    @ApiResponse({ status: 200, description: 'Subtask deleted successfully' })
    async delete(
      @Param('taskId') taskId: string,
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.subtasksService.delete(taskId, id, userId);
    }
  
    @Patch(':id/toggle')
    @ApiOperation({ summary: 'Toggle subtask completion status' })
    @ApiParam({ name: 'taskId', description: 'Parent task ID' })
    @ApiParam({ name: 'id', description: 'Subtask ID' })
    @ApiResponse({ status: 200, description: 'Subtask toggled successfully' })
    async toggle(
      @Param('taskId') taskId: string,
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.subtasksService.toggle(taskId, id, userId);
    }
  
    @Patch('reorder')
    @ApiOperation({ summary: 'Reorder subtasks' })
    @ApiParam({ name: 'taskId', description: 'Parent task ID' })
    @ApiResponse({ status: 200, description: 'Subtasks reordered successfully' })
    async reorder(
      @Param('taskId') taskId: string,
      @Body('subtaskIds') subtaskIds: string[],
      @CurrentUser('id') userId: string,
    ) {
      return this.subtasksService.reorder(taskId, subtaskIds, userId);
    }
  }