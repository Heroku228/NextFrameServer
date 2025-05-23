import { Injectable } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { plainToInstance } from 'class-transformer'
import { UpdateUserData } from './entities/dto/update-user.dto'
import { UserResponseDto } from './entities/dto/user-response.dto'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'

@Injectable()
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
	) { }


	@MessagePattern('get-user')
	async getCurrentUser(@Payload() data: { username: string }) {
		console.log('getCurrentUser payload data -> ', data)
		return await this.usersService.findByUsername(data.username)
	}

	@MessagePattern('find-user-products')
	async findUserProducts(@Payload() data: { userId: string }) {
		return await this.usersService.findUserProducts(data.userId)
	}

	@MessagePattern('find-by-id')
	async findById(@Payload() data: { id: string }) {
		return await this.usersService.findById(data.id)
	}

	@MessagePattern('clear-all-data')
	async clear() {
		return await this.usersService.clear()
	}


	@MessagePattern('find-all')
	async findAll() {
		return await this.usersService.findAll()
	}

	@MessagePattern('find-by-username')
	async findByUsername(@Payload() username: string) {
		console.log('find by username data => ', username)
		const user = await this.usersService.findByUsername(username)
		console.log('find by username user => ', user)
		return user
	}

	@MessagePattern('find-by-email')
	async findByEmail(@Payload() email: string) {
		return await this.usersService.findByEmail(email)
	}

	@MessagePattern('change-user-icon')
	async changeUserIcon(@Payload() data: {
		file: Express.Multer.File,
		directory: string,
		user: UserResponseDto
	}) {
		return await this.usersService.changeUserIcon(data.file, data.directory, data.user)
	}

	@MessagePattern('set-become-seller')
	async setBecomeSeller(@Payload() username: string) {
		return await this.usersService.setBecomeSeller(username)
	}

	@MessagePattern('set-user-account-by-id')
	async deleteUserAccountByID(@Payload() userId: string) {
		return await this.usersService.deleteUserAccountByID(userId)
	}

	@MessagePattern('set-other-user-account')
	async deleteOtherUserAccount(@Payload() username: string) {
		return await this.usersService.deleteOtherUserAccount(username)
	}

	@MessagePattern('update-user-data')
	async updateUserData(@Payload() userData: UpdateUserData, user: UserResponseDto) {
		return await this.usersService.updateUserData(userData, user)
	}

	@MessagePattern('create-user')
	async createUser(@Payload() createUserDto: User) {
		console.log('createUserDto -> ', createUserDto)

		const userToSave = plainToInstance(User, createUserDto)
		return await this.usersService.create(userToSave)
	}
}
