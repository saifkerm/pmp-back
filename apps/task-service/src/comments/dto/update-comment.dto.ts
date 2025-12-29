import { IsString, IsNotEmpty, MinLength, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ 
    example: 'Updated comment content with corrections',
    description: 'New comment content' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Comment cannot be empty' })
  content!: string;

  @ApiPropertyOptional({ 
    example: ['user-id-1', 'user-id-3'],
    description: 'Updated mentions array' 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];
}