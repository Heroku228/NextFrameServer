import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { CreateUserDto } from 'microservices/users-microservice/entities/dto/create-user.dto'


@Injectable()
export class RegisterPipe implements PipeTransform {
	transform(value: CreateUserDto) {
		if (!value.username) {
			throw new BadRequestException('Отсутствует имя пользователя')
		}
		if (!value.password) {
			throw new BadRequestException('Отсутствует пароль пользователя')
		}
		if (!value.email) {
			throw new BadRequestException('Отсутствует email пользователя')
		}

		return value
	}
}
