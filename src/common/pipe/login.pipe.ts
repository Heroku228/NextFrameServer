import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { UserCredentials } from 'microservices/users-microservice/entities/dto/user-credentials.dto'


@Injectable()
export class LoginPipe implements PipeTransform {
	transform(value: UserCredentials) {
		if (!value)
			throw new BadRequestException()

		if (!value.username && !value.email)
			throw new BadRequestException('Необходимо указать почту или логин')

		if (!value.password)
			throw new BadRequestException('Необходимо указать пароль')

		return value
	}
}
