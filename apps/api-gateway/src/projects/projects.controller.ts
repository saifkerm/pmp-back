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
  import { ProjectsProxyService } from './projects-proxy.service';
  import { CurrentUser } from '@pmp-back/common';
  
  @ApiTags('Projects')
  @ApiBearerAuth()
  @Controller('projects')
  export class ProjectsController {
    constructor(private projectsProxyService: ProjectsProxyService) {}
  
    // ==================== PROJECTS ====================
  
    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    @ApiResponse({ status: 201, description: 'Project created successfully' })
    async createProject(
      @Body() createProjectDto: any,
      @Headers('authorization') authorization: string,
      @CurrentUser() user: any, // Exemple: obtenir l'utilisateur complet { id, email, role }
    ) {
      const token = authorization?.replace('Bearer ', '');
      // Vous pouvez utiliser user.id, user.email, user.role si nécessaire
      return this.projectsProxyService.createProject(createProjectDto, token);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all projects for current user' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'includeArchived', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
    async findAllProjects(
      @Query() query: any,
      @Headers('authorization') authorization: string,
      @CurrentUser('id') userId: string, // Exemple: obtenir uniquement l'ID de l'utilisateur
    ) {
      const token = authorization?.replace('Bearer ', '');
      // userId contient l'ID de l'utilisateur actuel
      return this.projectsProxyService.findAllProjects(query, token);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get project by ID' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({ status: 200, description: 'Project found' })
    async findOneProject(
      @Param('id') id: string,
      @Headers('authorization') authorization: string,
      @CurrentUser('email') userEmail: string, // Exemple: obtenir uniquement l'email
    ) {
      const token = authorization?.replace('Bearer ', '');
      // userEmail contient l'email de l'utilisateur actuel
      return this.projectsProxyService.findOneProject(id, token);
    }
  
    @Put(':id')
    @ApiOperation({ summary: 'Update project' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({ status: 200, description: 'Project updated successfully' })
    async updateProject(
      @Param('id') id: string,
      @Body() updateProjectDto: any,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.updateProject(id, updateProjectDto, token);
    }
  
    @Patch(':id/archive')
    @ApiOperation({ summary: 'Archive project' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({ status: 200, description: 'Project archived successfully' })
    async archiveProject(
      @Param('id') id: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.archiveProject(id, token);
    }
  
    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore archived project' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({ status: 200, description: 'Project restored successfully' })
    async restoreProject(
      @Param('id') id: string,
      @Headers('authorization') authorization: string,
    ) {
      console.log('authorization', authorization)
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.restoreProject(id, token);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete project permanently' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({ status: 200, description: 'Project deleted successfully' })
    async deleteProject(
      @Param('id') id: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.deleteProject(id, token);
    }
  
    // ==================== MEMBERS ====================
  
    @Get(':id/members')
    @ApiOperation({ summary: 'Get project members' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({ status: 200, description: 'Members retrieved successfully' })
    async getMembers(
      @Param('id') id: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.getMembers(id, token);
    }
  
    @Post(':id/members')
    @ApiOperation({ summary: 'Add member to project' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({ status: 201, description: 'Member added successfully' })
    async addMember(
      @Param('id') id: string,
      @Body() addMemberDto: any,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.addMember(id, addMemberDto, token);
    }
  
    @Delete(':id/members/:memberId')
    @ApiOperation({ summary: 'Remove member from project' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiParam({ name: 'memberId', description: 'User ID to remove' })
    @ApiResponse({ status: 200, description: 'Member removed successfully' })
    async removeMember(
      @Param('id') id: string,
      @Param('memberId') memberId: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.removeMember(id, memberId, token);
    }
  
    // ==================== BOARDS ====================
  
    @Post(':id/boards')
    @ApiOperation({ summary: 'Create a new board' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({ status: 201, description: 'Board created successfully' })
    async createBoard(
      @Param('id') projectId: string,
      @Body() createBoardDto: any,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.createBoard(projectId, createBoardDto, token);
    }
  
    @Get(':id/boards')
    @ApiOperation({ summary: 'Get all boards for a project' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({ status: 200, description: 'Boards retrieved successfully' })
    async findAllBoards(
      @Param('id') projectId: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.findAllBoards(projectId, token);
    }
  
    @Get(':id/boards/:boardId')
    @ApiOperation({ summary: 'Get board by ID with tasks' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiParam({ name: 'boardId', description: 'Board ID' })
    @ApiResponse({ status: 200, description: 'Board found' })
    async findOneBoard(
      @Param('id') projectId: string,
      @Param('boardId') boardId: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.findOneBoard(projectId, boardId, token);
    }
  
    @Put(':id/boards/:boardId')
    @ApiOperation({ summary: 'Update board' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiParam({ name: 'boardId', description: 'Board ID' })
    @ApiResponse({ status: 200, description: 'Board updated successfully' })
    async updateBoard(
      @Param('id') projectId: string,
      @Param('boardId') boardId: string,
      @Body() updateBoardDto: any,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.updateBoard(
        projectId,
        boardId,
        updateBoardDto,
        token,
      );
    }
  
    @Delete(':id/boards/:boardId')
    @ApiOperation({ summary: 'Delete board' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiParam({ name: 'boardId', description: 'Board ID' })
    @ApiResponse({ status: 200, description: 'Board deleted successfully' })
    async deleteBoard(
      @Param('id') projectId: string,
      @Param('boardId') boardId: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.deleteBoard(projectId, boardId, token);
    }
  
    // ==================== LABELS ====================
  
    @Post(':id/labels')
    @ApiOperation({ summary: 'Create a new label' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({ status: 201, description: 'Label created successfully' })
    async createLabel(
      @Param('id') projectId: string,
      @Body() createLabelDto: any,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.createLabel(projectId, createLabelDto, token);
    }
  
    @Get(':id/labels')
    @ApiOperation({ summary: 'Get all labels for a project' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({ status: 200, description: 'Labels retrieved successfully' })
    async findAllLabels(
      @Param('id') projectId: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.findAllLabels(projectId, token);
    }
  
    @Put(':id/labels/:labelId')
    @ApiOperation({ summary: 'Update label' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiParam({ name: 'labelId', description: 'Label ID' })
    @ApiResponse({ status: 200, description: 'Label updated successfully' })
    async updateLabel(
      @Param('id') projectId: string,
      @Param('labelId') labelId: string,
      @Body() updateLabelDto: any,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.projectsProxyService.updateLabel(
        projectId,
        labelId,
        updateLabelDto,
        token,
      );
    }

    @Delete(':id/labels/:labelId')
    @ApiOperation({ summary: 'Delete label' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiParam({ name: 'labelId', description: 'Label ID' })
    @ApiResponse({ status: 200, description: 'Label deleted successfully' })
    async deleteLabel(
        @Param('id') projectId: string,
        @Param('labelId') labelId: string,
        @Headers('authorization') authorization: string,
    ) {
        const token = authorization?.replace('Bearer ', '');
        return this.projectsProxyService.deleteLabel(projectId, labelId, token);
    }
  
    
  }