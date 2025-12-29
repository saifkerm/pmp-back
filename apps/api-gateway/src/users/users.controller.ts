import {
    Controller,
    Get,
    Put,
    Patch,
    Body,
    Param,
    Query,
    Headers,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Post,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
    ApiQuery,
  } from '@nestjs/swagger';
  import { UsersProxyService } from './users-proxy.service';
  import { CurrentUser } from '@pmp-back/common';
  
  @ApiTags('Users')
  @ApiBearerAuth()
  @Controller('users')
  export class UsersController {
    constructor(private usersProxyService: UsersProxyService) {}
  
    @Get()
    @ApiOperation({ summary: 'Get all users with pagination and search' })
    @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    async findAll(
      @Query() query: any,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.usersProxyService.findAll(query, token);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findOne(
      @Param('id') id: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.usersProxyService.findOne(id, token);
    }
  
    @Get(':id/stats')
    @ApiOperation({ summary: 'Get user statistics' })
    @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
    async getStats(
      @Param('id') id: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.usersProxyService.getStats(id, token);
    }
  
    @Put(':id')
    @ApiOperation({ summary: 'Update user basic info' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 409, description: 'Email already in use' })
    async update(
      @Param('id') id: string,
      @Body() updateUserDto: any,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.usersProxyService.update(id, updateUserDto, token);
    }
  
    @Patch(':id/profile')
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    async updateProfile(
      @Param('id') id: string,
      @Body() updateProfileDto: any,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.usersProxyService.updateProfile(id, updateProfileDto, token);
    }
  
    @Post(':id/avatar')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload user avatar' })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Avatar image file (max 5MB, JPEG/PNG/GIF/WebP)',
          },
        },
      },
    })
    @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Invalid file' })
    async uploadAvatar(
      @Param('id') id: string,
      @UploadedFile(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
          ],
        }),
      )
      file: any,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.usersProxyService.uploadAvatar(id, file, token);
    }
  
    @Patch(':id/deactivate')
    @ApiOperation({ summary: 'Deactivate user account' })
    @ApiResponse({ status: 200, description: 'User deactivated successfully' })
    async deactivate(
      @Param('id') id: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.usersProxyService.deactivate(id, token);
    }
  
    @Patch(':id/activate')
    @ApiOperation({ summary: 'Activate user account' })
    @ApiResponse({ status: 200, description: 'User activated successfully' })
    async activate(
      @Param('id') id: string,
      @Headers('authorization') authorization: string,
    ) {
      const token = authorization?.replace('Bearer ', '');
      return this.usersProxyService.activate(id, token);
    }
  }