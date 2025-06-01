import { IsDefined, IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator'


export class CreateUserDto {
	@IsEmail({}, { message: 'Некорректная почта' })
	@IsNotEmpty()
	email: string

	@IsString()
	@IsNotEmpty()
	@MinLength(3, { message: 'Логин не может быть меньше чем 3 символа' })
	@MaxLength(20, { message: 'Логин не может быть больше чем 20 символов' })
	username: string

	@IsString()
	@IsNotEmpty({ message: 'Пароль не может быть пустым' })
	@IsDefined({ message: 'Пароль не может быть пустым' })
	@MinLength(6, { message: 'Пароль должен содержать не менее 6 символов' })
	@MaxLength(32, { message: 'Пароль слишком длинный' })
	@Matches(/(?=.*[A-Z])(?=.*\d)/, {
		message: 'Пароль должен содержать в себе как минимум один заглавный символ и одну цифру.'
	})
	password: string

	pathToUserIcon: string
}
