import { IsString, IsOptional, IsInt, IsHexColor, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({ example: 'To Do' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ example: 5, description: 'WIP limit for this column' })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}