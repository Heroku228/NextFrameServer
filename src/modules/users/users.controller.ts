import { Controller, Delete, Get, NotFoundException, Patch, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { Roles } from 'src/common/decorators/Roles.decorator'
import { JwtAuthGuard } from 'src/common/guards/JwtAuthGuard.guard'
import { RolesGuard } from 'src/common/guards/RolesGuard.guard'
import { UserResponseDto } from './entities/dto/user-response.dto'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@Get('all-users')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles('admin')
	async showAllUsers() {
		return await this.usersService.findAll()
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	async getCurrentUser(@CurrentUser() user: UserResponseDto) {
		return user
	}

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

	@Patch('become-seller')
	@UseGuards(JwtAuthGuard)
	async becomeSeller(
		@CurrentUser() user: User
	) {
		if (user.isSeller) return { message: 'User is already a seller' }
		console.log('user: ', user)
		await this.usersService.setBecomeSeller(user.username)

		return {
			message: `User: ${user.username} now is a seller`
		}
	}

	@Delete('clear')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles('admin')
	async clear() {
		await this.usersService.clear()
		return 'Clear'
	}
}

