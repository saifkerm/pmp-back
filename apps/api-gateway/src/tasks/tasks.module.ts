import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TasksController } from './tasks.controller';
import { TasksProxyService } from './tasks-proxy.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [TasksController],
  providers: [TasksProxyService],
})
export class TasksModule {}