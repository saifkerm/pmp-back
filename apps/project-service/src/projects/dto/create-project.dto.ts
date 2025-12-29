import { IsString, IsOptional, MinLength, IsEnum, IsHexColor } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Visibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  TEAM = 'TEAM',
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ example: 'WEB', description: 'Unique project key (3-10 chars)' })
  @IsString()
  @MinLength(2)
  key!: string;

  @ApiPropertyOptional({ example: 'Complete redesign of the company website' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '🚀' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ enum: Visibility, default: Visibility.PRIVATE })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @ApiPropertyOptional({ 
    example: { defaultBoard: 'kanban', columns: 4 },
    description: 'Project settings as JSON'
  })
  @IsOptional()
  settings?: any;
}