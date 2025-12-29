import { IsString, IsNotEmpty, IsOptional, MinLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ 
    example: 'This looks great! Just one suggestion about the error handling...',
    description: 'Comment content' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Comment cannot be empty' })
  content!: string;

  @ApiPropertyOptional({ 
    example: 'parent-comment-uuid',
    description: 'ID of parent comment for threading/replies' 
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ 
    example: ['user-id-1', 'user-id-2'],
    description: 'Array of user IDs mentioned in the comment' 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];
}