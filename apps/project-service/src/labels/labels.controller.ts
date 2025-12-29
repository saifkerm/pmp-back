import {
  Controller,
  Get,
  Post,
  Put,
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
import { LabelsService } from './labels.service';
import { CreateLabelDto, UpdateLabelDto } from './dto';
import { CurrentUser } from '@pmp-back/common';

@ApiTags('Labels')
@ApiBearerAuth()
@Controller('projects/:projectId/labels')
export class LabelsController {
  constructor(private labelsService: LabelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new label' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 201, description: 'Label created successfully' })
  @ApiResponse({ status: 409, description: 'Label name already exists' })
  async create(
    @Param('projectId') projectId: string,
    @Body() createLabelDto: CreateLabelDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.labelsService.create(projectId, createLabelDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all labels for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Labels retrieved successfully' })
  async findAll(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.labelsService.findAll(projectId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get label by ID' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Label ID' })
  @ApiResponse({ status: 200, description: 'Label found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.labelsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update label' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Label ID' })
  @ApiResponse({ status: 200, description: 'Label updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateLabelDto: UpdateLabelDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.labelsService.update(id, updateLabelDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete label' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Label ID' })
  @ApiResponse({ status: 200, description: 'Label deleted successfully' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.labelsService.delete(id, userId);
  }
}