import { Injectable } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { plainToInstance } from 'class-transformer'
import { CreateUserDto } from './entities/dto/create-user.dto'
import { UpdateUserData } from './entities/dto/update-user.dto'
import { UserResponseDto } from './entities/dto/user-response.dto'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'

@Injectable()
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@MessagePattern({ cmd: 'get-user' })
	async getCurrentUser(@Payload() data: { username: string }) {
		console.log('getCurrentUser payload data -> ', data)
		return await this.usersService.findByUsername(data.username)
	}

	// @MessagePattern({ cmd: 'find-user-products' })
	// async findUserProducts(@Payload() data: { userId: string }) {
	// 	return await this.usersService.findUserProducts(data.userId)
	// }

	@MessagePattern({ cmd: 'find-by-id' })
	async findById(@Payload() data: { id: string }) {
		return await this.usersService.findById(data.id)
	}

	@MessagePattern({ cmd: 'clear-all-data' })
	async clear() {
		return await this.usersService.clear()
	}


	@MessagePattern({ cmd: 'find-all' })
	async findAll(@Payload() data: { id: string }) {
		return await this.usersService.findAll()
	}

	@MessagePattern({ cmd: 'find-by-username' })
	async findByUsername(@Payload() data: { username: string }) {
		return await this.usersService.findByUsername(data.username)
	}
	
	@MessagePattern({ cmd: 'find-by-email' })
	async findByEmail(@Payload() data: { email: string }) {
		return await this.usersService.findByEmail(data.email)
	}

	@MessagePattern({ cmd: 'change-user-icon' })
	async changeUserIcon(@Payload() data: {
		file: Express.Multer.File,
		directory: string,
		user: UserResponseDto
	}) {
		return await this.usersService.changeUserIcon(data.file, data.directory, data.user)
	}

	@MessagePattern({ cmd: 'set-become-seller' })
	async setBecomeSeller(@Payload() data: { username: string }) {
		return await this.usersService.setBecomeSeller(data.username)
	}

	@MessagePattern({ cmd: 'set-user-account-by-id' })
	async deleteUserAccountByID(@Payload() data: { userId: string }) {
		return await this.usersService.deleteUserAccountByID(data.userId)
	}

	@MessagePattern({ cmd: 'set-other-user-account' })
	async deleteOtherUserAccount(@Payload() data: { username: string }) {
		return await this.usersService.deleteOtherUserAccount(data.username)
	}

	@MessagePattern({ cmd: 'update-user-data' })
	async updateUserData(@Payload() data: { userData: UpdateUserData, user: UserResponseDto }) {
		return await this.usersService.updateUserData(data.userData, data.user)
	}

	@MessagePattern({ cmd: 'create-user' })
	async createUser(@Payload() data: { createUserDto: CreateUserDto }) {
		console.log('createUser payload data -> ', data)
		const { createUserDto } = data

		const userToSave = plainToInstance(User, createUserDto)
		const user = await this.usersService.create(userToSave)

		return plainToInstance(UserResponseDto, user)
	}
}
