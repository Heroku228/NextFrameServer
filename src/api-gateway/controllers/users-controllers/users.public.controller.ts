import { Controller, Get, NotFoundException, Query } from '@nestjs/common'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { plainToInstance } from 'class-transformer'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { User } from 'microservices/users-microservice/entities/user.entity'
import { firstValueFrom } from 'rxjs'

@Controller('public/users')
export class PublicUsersController {
	constructor(private readonly usersService: AppUsersService) { }

	@Get()
	async getUser(@Query('username') username?: string, @Query('email') email?: string) {
		let user: User | null = null
		console.log('get user controller')

		if (username) {
			const observableUser = this.usersService.findByUsername(username)
			return await firstValueFrom(observableUser)
		}

		if (email) {
			const observableUser = this.usersService.findByEmail(email)
			return await firstValueFrom(observableUser)
		}

		if (!user) throw new NotFoundException('User not found')

		return plainToInstance(UserResponseDto, user)
	}

	@Get('all-users')
	async showAllUsers() {
		return this.usersService.findAll()
	}
}
