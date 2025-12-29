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
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
  } from '@nestjs/swagger';
  import { TasksService } from './tasks.service';
  import {
    CreateTaskDto,
    UpdateTaskDto,
    QueryTasksDto,
    MoveTaskDto,
    AssignTaskDto,
  } from './dto';
  import { CurrentUser } from '@pmp-back/common';
  
  @ApiTags('Tasks')
  @ApiBearerAuth()
  @Controller('tasks')
  export class TasksController {
    constructor(private tasksService: TasksService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new task' })
    @ApiResponse({ status: 201, description: 'Task created successfully' })
    @ApiResponse({ status: 403, description: 'No access to column' })
    async create(
      @Body() createTaskDto: CreateTaskDto,
      @CurrentUser('id') userId: string,
    ) {
      return this.tasksService.create(createTaskDto, userId);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all tasks with filters and pagination' })
    @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
    async findAll(
      @Query() query: QueryTasksDto,
      @CurrentUser('id') userId: string,
    ) {
      return this.tasksService.findAll(query, userId);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get task by ID with full details' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Task found' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async findOne(
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.tasksService.findOne(id, userId);
    }
  
    @Put(':id')
    @ApiOperation({ summary: 'Update task' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Task updated successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async update(
      @Param('id') id: string,
      @Body() updateTaskDto: UpdateTaskDto,
      @CurrentUser('id') userId: string,
    ) {
      return this.tasksService.update(id, updateTaskDto, userId);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete task' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Task deleted successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async delete(
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.tasksService.delete(id, userId);
    }
  
    @Patch(':id/move')
    @ApiOperation({ summary: 'Move task to another column or position' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Task moved successfully' })
    async move(
      @Param('id') id: string,
      @Body() moveTaskDto: MoveTaskDto,
      @CurrentUser('id') userId: string,
    ) {
      return this.tasksService.move(id, moveTaskDto, userId);
    }
  
    // ==================== ASSIGNEES ====================
  
    @Post(':id/assign')
    @ApiOperation({ summary: 'Assign users to task' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Task assigned successfully' })
    async assign(
      @Param('id') id: string,
      @Body() assignTaskDto: AssignTaskDto,
      @CurrentUser('id') userId: string,
    ) {
      return this.tasksService.assign(id, assignTaskDto, userId);
    }
  
    @Delete(':id/assignees/:userId')
    @ApiOperation({ summary: 'Unassign user from task' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiParam({ name: 'userId', description: 'User ID to unassign' })
    @ApiResponse({ status: 200, description: 'User unassigned successfully' })
    async unassign(
      @Param('id') id: string,
      @Param('userId') userIdToRemove: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.tasksService.unassign(id, userIdToRemove, userId);
    }
  
    // ==================== WATCHERS ====================
  
    @Post(':id/watch')
    @ApiOperation({ summary: 'Watch a task' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Watcher added successfully' })
    async addWatcher(
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.tasksService.addWatcher(id, userId);
    }
  
    @Delete(':id/watch')
    @ApiOperation({ summary: 'Unwatch a task' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Watcher removed successfully' })
    async removeWatcher(
      @Param('id') id: string,
      @CurrentUser('id') userId: string,
    ) {
      return this.tasksService.removeWatcher(id, userId);
    }
  }