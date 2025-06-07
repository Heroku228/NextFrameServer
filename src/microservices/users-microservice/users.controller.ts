import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { plainToInstance } from 'class-transformer'
import { USER_ERROR_MESSAGE } from 'constants/ErrorMessages'
import { TBanUserData } from 'types/user-data.type'
import { UpdateUserData } from './entities/dto/update-user.dto'
import { UserResponseDto } from './entities/dto/user-response.dto'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'

@Injectable()
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@MessagePattern('get-user')
	async getCurrentUser(@Payload() data: { username: string }) {
		console.log('getCurrentUser payload data -> ', data)
		return await this.usersService.findByUsername(data.username)
	}

	@MessagePattern('delete-all-users')
	async deleteAllUsers() {
		console.log('delete all users')
		await this.usersService.clear()
		return { message: 'All users deleted successfully' }
	}

	@MessagePattern('ban-user')
	async banUser(@Payload() userData: TBanUserData) {
		try {
			console.log('ban user try')
			return await this.usersService.banUser(userData)
		} catch (err) {
			console.log('ban user catch')
			if (err instanceof NotFoundException) {
				const error: any = err
				return error.response || USER_ERROR_MESSAGE.USER_NOT_FOUND
			}
		}
	}

	@MessagePattern('unban-user')
	async unbanUser(@Payload() username: string) {
		console.log('unban user username => ', username)
		const unbanStatus = await this.usersService.unbanUser(username)

		console.log('unban status => ', unbanStatus)
		if (!unbanStatus)
			return USER_ERROR_MESSAGE.USER_NOT_FOUND_OR_ALREADY_UNBANNED

		return unbanStatus
	}

	@MessagePattern('delete-user')
	async deleteUser(@Payload() username: string) {
		console.log('delete user username => ', username)
		const deleteStatus = await this.usersService.deleteUser(username)
			.catch(err => {
				console.error('[ERROR] (delete-user) ', err)
				throw new BadRequestException(USER_ERROR_MESSAGE.USER_NOT_FOUND)
			})
		return { deleteStatus }
	}

	@MessagePattern('update-user-role')
	async updateUserRole(@Payload() data: { username: string, newRole: string }) {
		const { username, newRole } = data
		const updateStatus = await this.usersService.updateUserRole(username, newRole)
			.catch(err => {
				console.error('[ERROR] (update-user-role) ', err)
				throw new BadRequestException(USER_ERROR_MESSAGE.CANNOT_CHANGE_USER_ROLE)
			})
		return { updateStatus }
	}

	// TODO => Сделать проверку на существование пользователя и на то, что пароль не был сброшен ранее, а так же на то, что новый пароль не совпадает со старым + необходимо подтвредить сброс пароля через email
	@MessagePattern('reset-user-password')
	async resetUserPassword(@Payload() data: { username: string, newPassword: string }) {
		const { username, newPassword } = data
		console.log('reset user password username => ', username, ' newPassword => ', newPassword)
		const resetStatus = await this.usersService.resetUserPassword(username, newPassword)
			.catch(err => {
				console.error('[ERROR] (reset-user-password) ', err)
				throw new BadRequestException(USER_ERROR_MESSAGE.CANNOT_CHANGE_USER_PASSWORD)
			})
	}

	@MessagePattern('find-user-products')
	async findUserProducts(@Payload() data: { userId: string }) {
		return await this.usersService.findUserProducts(data.userId)
	}

	@MessagePattern('find-by-id')
	async findById(@Payload() data: { id: string }) {
		return await this.usersService.findById(data.id)
	}

	@MessagePattern('change-role')
	async changeRole(@Payload() data: { username: string, role: string }) {
		const { username, role } = data
		return await this.usersService.changeUserRole(username, role)
	}

	@MessagePattern('clear-all-data')
	async clear() {
		console.log('mess parttern pclear all data')
		return await this.usersService.clear()
	}

	@MessagePattern('find-all')
	async findAll() {
		return await this.usersService.findAll()
	}

	@MessagePattern('find-by-username')
	async findByUsername(@Payload() username: string) {
		console.log('find by username data => ', username)

		try {
			return await this.usersService.findByUsername(username)
		} catch (err) {
			throw new NotFoundException('[ERROR] ', err.message)
		}
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
	async setBecomeSeller(@Payload() userId: string) {
		console.log('set become seller id => ', userId)
		return await this.usersService.setBecomeSeller(userId)
	}

	@MessagePattern('delete-user-account-by-id')
	async deleteUserAccountByID(@Payload() userId: string) {
		return await this.usersService.deleteUserAccountByID(userId)
	}

	@MessagePattern('set-other-user-account')
	async deleteOtherUserAccount(@Payload() username: string) {
		return await this.usersService.deleteOtherUserAccount(username)
	}

	@MessagePattern('update-user-data')
	async updateUserData(@Payload() userData: UpdateUserData) {
		const updatedUser = await this.usersService.updateUserData(userData)
		return plainToInstance(UserResponseDto, updatedUser)
	}

	@MessagePattern('create-user')
	async createUser(@Payload() createUserDto: User) {
		const userToSave = plainToInstance(User, createUserDto)
		return await this.usersService.create(userToSave)
	}
}
