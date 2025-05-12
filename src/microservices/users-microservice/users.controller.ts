import { Injectable } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { UsersService } from './users.service'

@Injectable()
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@MessagePattern({ cmd: 'get-user' })
	getCurrentUser(@Payload() data: { username: string }) {
		console.log('getCurrentUser payload data: ', data)
		return this.usersService.findByUsername(data.username)
	}

}
