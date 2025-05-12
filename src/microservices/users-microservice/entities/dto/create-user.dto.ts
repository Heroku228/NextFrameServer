import { IsDefined, IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator'


export class CreateUserDto {
	@IsEmail({}, { message: 'Incorrect email' })
	@IsNotEmpty()
	email: string

	@IsString()
	@IsNotEmpty()
	@MinLength(3, { message: 'Username cannot be less than 3 characters' })
	@MaxLength(20, { message: 'Username cannot be more than 20 characters' })
	username: string

	@IsString()
	@IsNotEmpty({ message: 'Password cannot to be null' })
	@IsDefined({ message: 'Password cannot to be null' })
	@MinLength(6, { message: 'Password cannot be less than 6 characters' })
	@MaxLength(32, { message: 'The password is too long' })
	@Matches(/(?=.*[A-Z])(?=.*\d)/, {
		message: 'The password must contain at least one capital letter and a number.'
	})
	password: string

	pathToUserIcon: string
}
