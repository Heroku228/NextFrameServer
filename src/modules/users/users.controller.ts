import { BadRequestException, Body, Controller, Get, Logger, NotFoundException, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { plainToInstance } from 'class-transformer'
import { CreateUserDto } from './entities/dto/create-user.dto'
import { UserResponseDto } from './entities/dto/user-response.dto'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	private readonly log = new Logger()

	@Get('all-users')
	async showAllUsers() {
		const allUsers = await this.usersService.findAllUsers()
		return allUsers.map(user => plainToInstance(UserResponseDto, user))
	}

	@Get()
	async getUser(
		@Query('username') username?: string,
		@Query('email') email?: string) {

		let user: User | null = null

		if (username) {
			console.log('username')
			user = await this.usersService.findByUsername(username)
			this.log.log('User: ', user)
		}

		if (email) {
			console.log('email')
			user = await this.usersService.findByEmail(email)
			this.log.log('User: ', user)
		}

		if (!user) throw new NotFoundException('User not found')

		return plainToInstance(UserResponseDto, user)
	}


	@Post('save-user')
	@UseInterceptors(FileInterceptor('icon'))
	async saveUser(
		@UploadedFile() file: Express.Multer.File,
		@Body() payload: CreateUserDto,
	) {
		if (!file) {
			return new BadRequestException({
				access: false,
				message: '[Error] File (icon) is missing'
			})
		}

		const user = plainToInstance(User, payload)
		const pathToUserIcon = await this.usersService.writeUserIcon(user.username, file)
		user.pathToUserIcon = pathToUserIcon
		await this.usersService.saveUser(user)

		const response = plainToInstance(UserResponseDto, user, {
			excludeExtraneousValues: true
		})
		return {
			createdUser: response,
			icon: {
				filename: file.originalname,
				pathToUserIcon: pathToUserIcon
			}
		}
	}
}

