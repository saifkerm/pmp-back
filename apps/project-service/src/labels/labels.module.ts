import { Module } from '@nestjs/common';
import { DatabaseModule } from '@pmp-back/database';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';

@Module({
  imports: [DatabaseModule],
  controllers: [LabelsController],
  providers: [LabelsService],
  exports: [LabelsService],
})
export class LabelsModule {}