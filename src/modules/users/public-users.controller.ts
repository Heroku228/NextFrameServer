import { Controller, Get, NotFoundException, Query } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { UserResponseDto } from './entities/dto/user-response.dto'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'


@Controller('public/users')
export class PublicUsersController {
	constructor(private readonly usersService: UsersService) { }

	@Get()   
	async getUser(@Query('username') username?: string, @Query('email') email?: string) {
		let user: User | null = null

		if (username)
			user = await this.usersService.findByUsername(username)

		if (email)
			user = await this.usersService.findByEmail(email)

		if (!user) throw new NotFoundException('User not found')

		return plainToInstance(UserResponseDto, user)
	}

	@Get('all-users')
	async showAllUsers() {
		return await this.usersService.findAll()
	}
}
