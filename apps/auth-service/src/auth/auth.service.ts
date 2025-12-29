import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Logger,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  import { PrismaService } from '@pmp-back/database';
  import * as bcrypt from 'bcrypt';
  import { RegisterDto, LoginDto } from './dto';
  import { JwtPayload } from './strategies/jwt.strategy';
  
  @Injectable()
  export class AuthService {
    private readonly logger = new Logger(AuthService.name);
  
    constructor(
      private prisma: PrismaService,
      private jwtService: JwtService,
      private configService: ConfigService,
    ) {}
  
    async register(registerDto: RegisterDto) {
      const { email, password, firstName, lastName } = registerDto;
  
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
  
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }
  
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Créer l'utilisateur
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          profile: {
            create: {},
          },
          notificationPrefs: {
            create: {},
          },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });
  
      this.logger.log(`New user registered: ${user.email}`);
  
      // Générer les tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role);
  
      // Sauvegarder le refresh token
      await this.updateRefreshToken(user.id, tokens.refreshToken);
  
      return {
        user,
        ...tokens,
      };
    }
  
    async login(loginDto: LoginDto) {
      const { email, password } = loginDto;
  
      // Trouver l'utilisateur
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      // Vérifier si l'utilisateur est actif
      if (!user.isActive) {
        throw new UnauthorizedException('Account is disabled');
      }
  
      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      // Mettre à jour lastLoginAt
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
  
      this.logger.log(`User logged in: ${user.email}`);
  
      // Générer les tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role);
  
      // Sauvegarder le refresh token
      await this.updateRefreshToken(user.id, tokens.refreshToken);
  
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        ...tokens,
      };
    }
  
    async refreshTokens(userId: string) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Access denied');
      }
  
      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.updateRefreshToken(user.id, tokens.refreshToken);
  
      return tokens;
    }
  
    async logout(userId: string) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
  
      this.logger.log(`User logged out: ${userId}`);
  
      return { message: 'Logged out successfully' };
    }
  
    async validateUser(userId: string) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });
  
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }
  
      return user;
    }
  
    private async generateTokens(userId: string, email: string, role: string) {
      const payload: JwtPayload = {
        sub: userId,
        email,
        role,
      };
  
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
        }),
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN', '7d'),
        }),
      ]);
  
      return {
        accessToken,
        refreshToken,
      };
    }
  
    private async updateRefreshToken(userId: string, refreshToken: string) {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: hashedRefreshToken },
      });
    }
  }