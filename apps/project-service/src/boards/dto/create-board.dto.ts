import { IsString, IsInt, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BoardType {
  KANBAN = 'KANBAN',
  LIST = 'LIST',
  CALENDAR = 'CALENDAR',
  TIMELINE = 'TIMELINE',
}

export class CreateBoardDto {
  @ApiProperty({ example: 'Main Board' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({ enum: BoardType, default: BoardType.KANBAN })
  @IsOptional()
  @IsEnum(BoardType)
  type?: BoardType;

  @ApiPropertyOptional({ example: { showCompletedTasks: false } })
  @IsOptional()
  settings?: any;
}