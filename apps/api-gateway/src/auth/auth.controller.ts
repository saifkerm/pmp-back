import {
    Controller,
    Post,
    Body,
    Get,
    HttpCode,
    HttpStatus,
    Headers,
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  import { AuthProxyService } from './auth-proxy.service';
  import { Public, CurrentUser } from '@pmp-back/common';
  
  @ApiTags('Authentication')
  @Controller('auth')
  export class AuthController {
    constructor(private authProxyService: AuthProxyService) {}
  
    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({ status: 409, description: 'Email already exists' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    async register(@Body() registerDto: any) {
      return this.authProxyService.register(registerDto);
    }
  
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, description: 'Successfully logged in' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginDto: any) {
      return this.authProxyService.login(loginDto);
    }
  
    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refreshToken(@Body() refreshTokenDto: any) {
      return this.authProxyService.refreshToken(refreshTokenDto);
    }
  
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout current user' })
    @ApiResponse({ status: 200, description: 'Successfully logged out' })
    async logout(@Headers('authorization') authorization: string) {
      const token = authorization?.replace('Bearer ', '');
      return this.authProxyService.logout(token);
    }
  
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user info' })
    @ApiResponse({ status: 200, description: 'User info retrieved' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getCurrentUser(@CurrentUser() user: any) {
      return user;
    }
  }