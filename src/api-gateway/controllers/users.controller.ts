import { Controller, Get, Param } from '@nestjs/common'
import { UsersService } from '../services/users.service'

@Controller('users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
	) { }

	@Get('get-user/:username')
	async getUser(
		@Param('username') username: string
	) {
		console.log('Controller')
		return this.usersService.getCurrentUser(username)
	}
}
