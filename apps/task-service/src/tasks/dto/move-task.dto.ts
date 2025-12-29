import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveTaskDto {
  @ApiProperty({ example: 'column-id-here', description: 'Target column ID' })
  @IsString()
  columnId!: string;

  @ApiProperty({ example: 2, description: 'New position in the column' })
  @IsInt()
  @Min(0)
  position!: number;
}