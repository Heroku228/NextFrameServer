import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { User } from '../users-microservice/entities/user.entity'
import { AuthService } from './auth.service'

type TPayloadCredentials = {
	username: string,
	password: string
}

type TTokenPayload = {
	id: string,
	username: string
}

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@MessagePattern('validate')
	async validate(@Payload() payload: TPayloadCredentials) {
		console.log('payload data -> ', payload)

		const { username, password } = payload

		const result = await this.authService.validate(username, password)
		console.log('validate controller result -> ', result)
		return result
	}

	@MessagePattern('register')
	async register(@Payload() user: User) {
		console.log('auth microservice -> payloadData -> ', user)
		const { data, token } = await this.authService.register(user)
		console.log('Data from authMicroservice service -> ', data, token)

		return {
			createdUser: data,
			token: token
		}
	}

	@MessagePattern('generate-token')
	async generateToken(@Payload() user: User | UserResponseDto) {
		return this.authService.generateToken(user)
	}
}
