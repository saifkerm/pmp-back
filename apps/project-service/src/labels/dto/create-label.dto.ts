import { IsString, IsOptional, IsHexColor, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabelDto {
  @ApiProperty({ example: 'Bug' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: '#EF4444' })
  @IsHexColor()
  color!: string;

  @ApiPropertyOptional({ example: 'Something is broken' })
  @IsOptional()
  @IsString()
  description?: string;
}