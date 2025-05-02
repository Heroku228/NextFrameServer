import { Controller, Delete, Get, Logger, NotFoundException, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'src/config/decorators/current-user.decorator'
import { Roles } from 'src/config/decorators/Roles.decorator'
import { JwtAuthGuard } from 'src/config/guards/JwtAuthGuard.guard'
import { RolesGuard } from 'src/config/guards/RolesGuard.guard'
import { UserResponseDto } from './entities/dto/user-response.dto'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	private readonly logger = new Logger()

	@Get('all-users')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles('admin')
	async showAllUsers() {
		const allUsers = await this.usersService.findAllUsers()
		return allUsers.map(user => plainToInstance(UserResponseDto, user))
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	async getCurrentUser(
		@CurrentUser() user: UserResponseDto
	) {
		return user
	}

	@Get()
	async getUser(
		@Query('username') username?: string,
		@Query('email') email?: string
	) {
		let user: User | null = null

		if (username) {
			console.log('username')
			user = await this.usersService.findByUsername(username)
			this.logger.log('User: ', user)
		}

		if (email) {
			console.log('email')
			user = await this.usersService.findByEmail(email)
			this.logger.log('User: ', user)
		}

		if (!user) throw new NotFoundException('User not found')

		return plainToInstance(UserResponseDto, user)
	}

	@Delete('clear')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles('admin')
	async clear() {
		await this.usersService.clear()
	}
}

