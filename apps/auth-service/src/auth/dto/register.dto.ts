import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
        example: 'john.doe@example.com',
        description: 'User email address',
    })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

  @ApiProperty({
        example: 'Password123!',
        description: 'Password must contain uppercase, lowercase, number and be at least 8 characters',
    })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    password!: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
    @IsString()
    @MinLength(2, { message: 'First name must be at least 2 characters' })
    firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
    @IsString()
    @MinLength(2, { message: 'Last name must be at least 2 characters' })
    lastName!: string;
}