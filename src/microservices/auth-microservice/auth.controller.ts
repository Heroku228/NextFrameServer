import { ConflictException, Controller } from '@nestjs/common'
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { User } from '../users-microservice/entities/user.entity'
import { AuthService } from './auth.service'

type TPayloadCredentials = {
	username: string,
	password: string
}

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@MessagePattern('validate')
	async validate(@Payload() payload: TPayloadCredentials) {
		const { username, password } = payload
		return await this.authService.validate(username, password)
	}

	@MessagePattern('register')
	async register(@Payload() user: User) {
		try {
			const response = await this.authService.register(user)

			if (response) {
				const { data, token } = response
				return {
					createdUser: data,
					token: token
				}
			}
		} catch (err) {
			throw new RpcException(new ConflictException('Failed to create account', err))
		}
	}

	@MessagePattern('generate-token')
	async generateToken(@Payload() user: User | UserResponseDto) {
		return this.authService.generateToken(user)
	}
}
