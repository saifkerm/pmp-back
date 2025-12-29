import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
  } from '@nestjs/common';
  import { PrismaClient } from '@prisma/client';
  
  @Injectable()
  export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
  
    constructor() {
      super({
        // Prisma 7 : Passer directement l'URL dans le constructeur
        datasourceUrl: process.env.DATABASE_URL,
        log: [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'info' },
          { emit: 'stdout', level: 'warn' },
        ],
      });
    }
  
    async onModuleInit() {
      try {
        await this.$connect();
        this.logger.log('✅ Database connected successfully');
      } catch (error) {
        this.logger.error('❌ Database connection failed', error);
        throw error;
      }
    }
  
    async onModuleDestroy() {
      await this.$disconnect();
      this.logger.log('Database disconnected');
    }
  
    async cleanDatabase() {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Cannot clean database in production');
      }
  
      const models = Reflect.ownKeys(this).filter(
        (key: any) => key[0] !== '_' && key !== 'constructor',
      );
  
      return Promise.all(
        models.map((modelKey) => (this as any)[modelKey].deleteMany()),
      );
    }
  }