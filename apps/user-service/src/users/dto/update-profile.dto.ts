import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Full-stack developer passionate about clean code' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'Europe/Paris' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'en', enum: ['en', 'fr', 'es', 'de'] })
  @IsOptional()
  @IsIn(['en', 'fr', 'es', 'de'])
  language?: string;

  @ApiPropertyOptional({ example: 'dark', enum: ['light', 'dark', 'auto'] })
  @IsOptional()
  @IsIn(['light', 'dark', 'auto'])
  theme?: string;

  @ApiPropertyOptional({ 
    example: { emailNotifications: true, pushNotifications: false },
    description: 'User preferences as JSON'
  })
  @IsOptional()
  preferences?: any;
}