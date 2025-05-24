import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { User } from 'microservices/users-microservice/entities/user.entity'
import { Observable } from 'rxjs'


type TypeObservableValidateData = {
	responseUser: UserResponseDto
	accessToken: string
}

@Injectable()
export class AppAuthService {
	constructor(
		@Inject('AUTH_SERVICE')
		private readonly authClient: ClientProxy
	) { }

	register(payload: User) {
		return this.authClient.send('register', payload)
	}


	validate(username: string, password: string): Observable<TypeObservableValidateData | null> {
		return this.authClient.send('validate', { username, password })
	}


	generateToken(user: User | UserResponseDto): Observable<string> {
		const { id, username } = user
		const newToken = this.authClient.send('generate-token', { id, username })

		if (!newToken)
			throw new InternalServerErrorException('Cannot to generate access token')

		return newToken
	}
}
