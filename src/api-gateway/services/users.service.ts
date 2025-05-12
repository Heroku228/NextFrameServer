import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class UsersService {
	constructor(@Inject('USERS_SERVICE')
	private readonly userClient: ClientProxy
	) { }

	async getCurrentUser(username: string) {
		console.log('getCurrentUser: ', username)
		return this.userClient.send({ cmd: 'get-user' }, { username })
	}
}

