import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { User } from 'microservices/users-microservice/entities/user.entity'


@Injectable()
export class AppAuthService {
	constructor(
		@Inject('AUTH_SERVICE')
		private readonly authClient: ClientProxy
	) { }

	register(payload: User) {
		return this.authClient.send('register', payload)
	}


	validate(username: string, password: string) {
		console.log('validate data -> ', username, password)
		return this.authClient.send('validate', { username, password })
	}
}
