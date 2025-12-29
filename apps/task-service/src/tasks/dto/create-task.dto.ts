import {
    IsString,
    IsOptional,
    IsInt,
    IsEnum,
    IsDateString,
    IsNumber,
    Min,
    IsArray,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  
  export enum Priority {
    LOWEST = 'LOWEST',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    HIGHEST = 'HIGHEST',
    URGENT = 'URGENT',
  }
  
  export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    IN_REVIEW = 'IN_REVIEW',
    BLOCKED = 'BLOCKED',
    DONE = 'DONE',
    CANCELLED = 'CANCELLED',
  }
  
  export class CreateTaskDto {
    @ApiProperty({ example: 'Implement user authentication' })
    @IsString()
    title!: string;
  
    @ApiPropertyOptional({ example: 'JWT-based authentication with refresh tokens' })
    @IsOptional()
    @IsString()
    description?: string;
  
    @ApiProperty({ example: 'column-id-here' })
    @IsString()
    columnId!: string;
  
    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;
  
    @ApiPropertyOptional({ enum: Priority, default: Priority.MEDIUM })
    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;
  
    @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;
  
    @ApiPropertyOptional({ example: 5, description: 'Story points' })
    @IsOptional()
    @IsInt()
    @Min(0)
    points?: number;
  
    @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
    @IsOptional()
    @IsDateString()
    dueDate?: string;
  
    @ApiPropertyOptional({ example: '2024-12-01T00:00:00Z' })
    @IsOptional()
    @IsDateString()
    startDate?: string;
  
    @ApiPropertyOptional({ example: 16.5 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    estimatedHours?: number;
  
    @ApiPropertyOptional({
      example: ['user-id-1', 'user-id-2'],
      description: 'Array of user IDs to assign',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    assigneeIds?: string[];
  
    @ApiPropertyOptional({
      example: ['label-id-1', 'label-id-2'],
      description: 'Array of label IDs',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    labelIds?: string[];
  }