import {
  Controller,
  Get,
  Post,
  Put,
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
import { BoardsService } from './boards.service';
import {
  CreateBoardDto,
  UpdateBoardDto,
  CreateColumnDto,
  UpdateColumnDto,
} from './dto';
import { CurrentUser } from '@pmp-back/common'; 

@ApiTags('Boards')
@ApiBearerAuth()
@Controller('projects/:projectId/boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 201, description: 'Board created successfully' })
  async create(
    @Param('projectId') projectId: string,
    @Body() createBoardDto: CreateBoardDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.boardsService.create(projectId, createBoardDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all boards for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Boards retrieved successfully' })
  async findAll(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.boardsService.findAll(projectId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board by ID with tasks' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'Board found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.boardsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update board' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'Board updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.boardsService.update(id, updateBoardDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete board' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'Board deleted successfully' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.boardsService.delete(id, userId);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder boards' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Boards reordered successfully' })
  async reorder(
    @Param('projectId') projectId: string,
    @Body('boardIds') boardIds: string[],
    @CurrentUser('id') userId: string,
  ) {
    return this.boardsService.reorder(projectId, boardIds, userId);
  }

  // ==================== COLUMNS ====================

  @Post(':boardId/columns')
  @ApiOperation({ summary: 'Create a new column' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'boardId', description: 'Board ID' })
  @ApiResponse({ status: 201, description: 'Column created successfully' })
  async createColumn(
    @Param('boardId') boardId: string,
    @Body() createColumnDto: CreateColumnDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.boardsService.createColumn(boardId, createColumnDto, userId);
  }

  @Put('columns/:columnId')
  @ApiOperation({ summary: 'Update column' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'columnId', description: 'Column ID' })
  @ApiResponse({ status: 200, description: 'Column updated successfully' })
  async updateColumn(
    @Param('columnId') columnId: string,
    @Body() updateColumnDto: UpdateColumnDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.boardsService.updateColumn(columnId, updateColumnDto, userId);
  }

  @Delete('columns/:columnId')
  @ApiOperation({ summary: 'Delete column' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'columnId', description: 'Column ID' })
  @ApiResponse({ status: 200, description: 'Column deleted successfully' })
  @ApiResponse({ status: 403, description: 'Cannot delete column with tasks' })
  async deleteColumn(
    @Param('columnId') columnId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.boardsService.deleteColumn(columnId, userId);
  }

  @Patch(':boardId/columns/reorder')
  @ApiOperation({ summary: 'Reorder columns' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'boardId', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'Columns reordered successfully' })
  async reorderColumns(
    @Param('boardId') boardId: string,
    @Body('columnIds') columnIds: string[],
    @CurrentUser('id') userId: string,
  ) {
    return this.boardsService.reorderColumns(boardId, columnIds, userId);
  }

  @Patch('columns/:columnId/toggle-collapse')
  @ApiOperation({ summary: 'Toggle column collapse state' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'columnId', description: 'Column ID' })
  @ApiResponse({ status: 200, description: 'Column collapse toggled' })
  async toggleCollapse(
    @Param('columnId') columnId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.boardsService.toggleCollapse(columnId, userId);
  }
}