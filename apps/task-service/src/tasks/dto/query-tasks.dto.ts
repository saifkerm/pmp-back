import {
    IsOptional,
    IsString,
    IsInt,
    Min,
    Max,
    IsEnum,
    IsArray,
    IsDateString,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { ApiPropertyOptional } from '@nestjs/swagger';
  import { Priority, TaskStatus } from './create-task.dto';
  
  export class QueryTasksDto {
    @ApiPropertyOptional({ example: 'authentication' })
    @IsOptional()
    @IsString()
    search?: string;
  
    @ApiPropertyOptional({ example: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;
  
    @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 20;
  
    @ApiPropertyOptional({ enum: TaskStatus })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;
  
    @ApiPropertyOptional({ enum: Priority })
    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;
  
    @ApiPropertyOptional({ example: 'user-id-here' })
    @IsOptional()
    @IsString()
    assignedTo?: string;
  
    @ApiPropertyOptional({ example: 'column-id-here' })
    @IsOptional()
    @IsString()
    columnId?: string;
  
    @ApiPropertyOptional({
      example: ['label-id-1', 'label-id-2'],
      description: 'Filter by label IDs',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    labelIds?: string[];
  
    @ApiPropertyOptional({ example: '2024-12-31' })
    @IsOptional()
    @IsDateString()
    dueBefore?: string;
  
    @ApiPropertyOptional({ example: '2024-01-01' })
    @IsOptional()
    @IsDateString()
    dueAfter?: string;
  
    @ApiPropertyOptional({
      example: 'createdAt',
      enum: ['createdAt', 'updatedAt', 'dueDate', 'priority', 'position'],
    })
    @IsOptional()
    @IsString()
    sortBy: string = 'position';
  
    @ApiPropertyOptional({ example: 'asc', enum: ['asc', 'desc'] })
    @IsOptional()
    @IsString()
    sortOrder: 'asc' | 'desc' = 'asc';
  }