import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTaskDto {
  @ApiProperty({
    example: ['user-id-1', 'user-id-2'],
    description: 'Array of user IDs to assign',
  })
  @IsArray()
  @IsString({ each: true })
  userIds!: string[];
}