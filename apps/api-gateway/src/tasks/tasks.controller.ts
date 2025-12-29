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
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
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
    @ApiOperation({ summary: 'Move task to another column or position' })
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
  
    // ==================== ASSIGNEES ====================
  
    @Post(':id/assign')
    @ApiOperation({ summary: 'Assign users to task' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Task assigned successfully' })
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
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User unassigned successfully' })
    async unassignTask(
      @Param('id') id: string,
      @Param('userId') userId: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.tasksProxyService.unassignTask(id, userId, token);
    }
  
    // ==================== WATCHERS ====================
  
    @Post(':id/watch')
    @ApiOperation({ summary: 'Watch a task' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Watcher added successfully' })
    async addWatcher(
      @Param('id') id: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.tasksProxyService.addWatcher(id, token);
    }
  
    @Delete(':id/watch')
    @ApiOperation({ summary: 'Unwatch a task' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Watcher removed successfully' })
    async removeWatcher(
      @Param('id') id: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.tasksProxyService.removeWatcher(id, token);
    }
  }