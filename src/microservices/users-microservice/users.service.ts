import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm'
import { hash } from 'bcrypt'
import { plainToInstance } from 'class-transformer'
import { deleteUserDirectory } from 'common/utils/FS'
import { writeUserIcon } from 'common/utils/WriteUserIcon'
import { AUTH_ERROR_MESSAGE, ROLE_ERROR_MESSAGE, ROLE_SUCCESS_MESSAGE, USER_ERROR_MESSAGE, USER_SUCCESS_MESSAGE } from 'constants/ErrorMessages'
import { ROLES, TRoles } from 'constants/Roles'
import { readdir, rename } from 'fs/promises'
import { join } from 'path'
import { cwd } from 'process'
import { lastValueFrom } from 'rxjs'
import { Repository } from 'typeorm'
import { TBanUserData } from 'types/user-data.type'
import { UpdateUserData } from './entities/dto/update-user.dto'
import { UserResponseDto } from './entities/dto/user-response.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@Inject('PRODUCTS_SERVICE')
		private readonly productsClient: ClientProxy,
	) { }

	private logger = new Logger(UsersService.name)

	async findUserProducts(userId: string) {
		const products = await lastValueFrom(
			this.productsClient.send('get-products-by-user', { userId })
		)

		return {
			userId,
			products
		}
	}

	async findById(id: string) {
		return await this.userRepository.findOne({
			where: { id: id }
		})
	}

	async clear() {
		try {
			console.log('clear service')
			await this.userRepository.delete({})
		} catch (err) {
			console.log('clear service catch')
			throw new ConflictException('No users data')
		}
	}

	async create(user: User) {
		try {
			return await this.userRepository.save(user)
		} catch (err) {
			if (err.code === '23505') {
				const detail = err?.driverError?.detail || 'Пользователь с таким логином или Email уже существует'
				throw new RpcException(new ConflictException(detail))
			}
			throw err
		}
	}

	/**
	 * @returns Выводит всех пользователей, отсортированных по дате создания в порядке убывания
	 * и исключает заблокированных пользователей.
	 * Выводит массив объектов UserResponseDto
	 */
	async findAll() {
		return (await this.userRepository
			.find({ order: { createdAt: 'DESC' } }))
			.filter(user => !user.isBanned)
			.map(user => plainToInstance(UserResponseDto, user))
	}

	async findByUsername(username: string) {
		return await this.userRepository
			.findOne({
				where: {
					username: username
				}
			})
			.catch(() => new NotFoundException(USER_ERROR_MESSAGE.USER_NOT_FOUND))
	}


	async findByEmail(email: string) {
		return await this.userRepository
			.findOne({
				where: {
					email: email
				}
			})
			.catch(() => new NotFoundException(USER_ERROR_MESSAGE.USER_NOT_FOUND))
	}

	async changeUserRole(username: string, role: string) {
		this.logger.log({ username, role })
		const isValidRole = Object.values(ROLES).includes(role.toLowerCase() as TRoles)
		
		if (!isValidRole)
			throw new BadRequestException(`
				${ROLE_ERROR_MESSAGE.ROLE_NOT_FOUND}.
				${ROLE_SUCCESS_MESSAGE.ALLOWED_ROLES}: ${Object.values(ROLES).join(', ')}`
			)

		const user = await this.userRepository.findOne({
			where: {
				username: username
			}
		})

		if (!user) throw new NotFoundException(USER_ERROR_MESSAGE.USER_NOT_FOUND)

		role === 'user'
			? await this.userRepository.update(user.id, {
				roles: ['user']
			})
			: await this.userRepository.update(user.id, {
				roles: Array.from(new Set([...user.roles, role]))
			})

		const updatedUser = await this.userRepository.findOne({ where: { id: user.id } })

		return plainToInstance(UserResponseDto, updatedUser)
	}

	async changeUserIcon(
		file: Express.Multer.File,
		directory: string,
		user: UserResponseDto) {
		const currentUserAvatars = await readdir(join(directory, 'avatars'))
		const pathToOldUserAvatars = join(directory, 'oldAvatars')

		await Promise.all(
			currentUserAvatars.map(avatar => rename(
				join(directory, 'avatars', avatar),
				join(pathToOldUserAvatars, avatar))
			)
		)

		const pathToNewUserIcon = await writeUserIcon(user.username, file)
		await this.userRepository.update(user.id, { pathToUserIcon: pathToNewUserIcon })
		return pathToNewUserIcon
	}

	async setBecomeSeller(userId: string) {
		await this.userRepository.update(userId, { isSeller: true })
		const user = await this.userRepository.findOne({ where: { id: userId } })
		return plainToInstance(UserResponseDto, user)
	}

	async deleteUserAccountByID(userId: string) {
		if (!userId) throw new NotFoundException(AUTH_ERROR_MESSAGE.ACCOUNT_NOT_FOUND)
		return await this.userRepository.delete(userId)
	}

	async deleteOtherUserAccount(username: string) {
		const user = await this.userRepository.findOne({
			where: {
				username: username
			}
		})

		if (!user) throw new NotFoundException(AUTH_ERROR_MESSAGE.CANNOT_DELETE_ADMIN)

		if (user.roles.includes('admin'))
			throw new ForbiddenException(AUTH_ERROR_MESSAGE.CANNOT_DELETE_ADMIN)

		this.deleteUserAccountByID(user.id)
	}

	async updateUserData(userData: UpdateUserData) {
		if (!userData || typeof userData !== 'object')
			throw new BadRequestException(USER_ERROR_MESSAGE.UNCORRECT_DATA_TO_UPDATE)

		const { username, email, password, userId, icon } = userData

		const existingUser = await this.findById(userId)

		if (!existingUser)
			throw new NotFoundException(USER_ERROR_MESSAGE.USER_NOT_FOUND)

		const currentUsername = existingUser.username
		const uploadsDir = join(cwd(), 'uploads')
		const updatePayload: Partial<User> = {}

		const isUsernameChanged = username && username !== currentUsername
		const effectiveUsername = isUsernameChanged ? username : currentUsername
		const userDir = join(uploadsDir, effectiveUsername)

		if (username) updatePayload.username = username
		if (email) updatePayload.email = email

		if (password) {
			const hashedPassword = await hash(password, 10)
			updatePayload.password = hashedPassword
		}

		let hasIconUpdated = false

		if (icon) {
			const originalUserDir = join(uploadsDir, currentUsername)

			if (isUsernameChanged)
				await rename(originalUserDir, userDir).catch(() => {
					throw new BadRequestException(USER_ERROR_MESSAGE.RENAME_DIRECTORY_ERROR)
				})


			const avatarsDir = join(userDir, 'avatars')
			const oldAvatarsDir = join(userDir, 'oldAvatars')

			try {
				const files = await readdir(avatarsDir)
				if (files.length) {
					await Promise.all(
						files.map(file =>
							rename(join(avatarsDir, file), join(oldAvatarsDir, file))
						)
					)
				}
			} catch (e) { }

			await writeUserIcon(effectiveUsername, icon)
			hasIconUpdated = true
		}

		if (Object.keys(updatePayload).length === 0 && !hasIconUpdated) {
			throw new BadRequestException(USER_ERROR_MESSAGE.NO_UPDATE_DATA)
		}

		try {
			await this.userRepository.update(existingUser.id, updatePayload)

			const updatedUser = await this.userRepository.findOne({
				where: { id: existingUser.id }
			})

			return updatedUser
		} catch (err) {
			throw new RpcException(err)
		}
	}


	async unbanUser(username: string) {
		const user = await this.userRepository.findOne({
			where: {
				username
			}
		})

		if (!user)
			throw new NotFoundException(USER_ERROR_MESSAGE.USER_NOT_FOUND)
		if (!user.isBanned)
			return new BadRequestException(USER_ERROR_MESSAGE.USER_NOT_BANNED)

		user.isBanned = false
		user.banReason = ''
		user.banDuration = null
		await this.userRepository.save(user)

		return { unbanStatus: USER_SUCCESS_MESSAGE.USER_UNBANNED }
	}

	async deleteUser(username: string) {
		await this.userRepository.delete({ username })

		await deleteUserDirectory(username)

		return { message: USER_SUCCESS_MESSAGE.USER_DELETED }
	}

	async updateUserRole(username: string, newRole: string) {
		const user = await this.userRepository.findOne({ where: { username } })

		if (!user)
			throw new NotFoundException(USER_ERROR_MESSAGE.USER_NOT_FOUND)

		if (!user.roles.includes(newRole)) {
			user.roles.push(newRole)
			await this.userRepository.save(user)
		}

		return plainToInstance(UserResponseDto, user)
	}

	async resetUserPassword(username: string, newPassword: string) {
		const user = await this.userRepository.findOne({ where: { username } })

		if (!user) throw new NotFoundException(USER_ERROR_MESSAGE.USER_NOT_FOUND)

		const hashedUserPassword = await hash(newPassword, 10)
		user.password = hashedUserPassword
		await this.userRepository.save(user)

		return { resetStatus: USER_SUCCESS_MESSAGE.PASSWORD_UPDATED }
	}


	async banUser(userData: TBanUserData) {
		const { username, duration, reason } = userData

		const user = await this.userRepository.findOne({
			where: {
				username
			}
		})

		console.log('USER => ', user)
		if (!user)
			throw new NotFoundException(USER_ERROR_MESSAGE.USER_NOT_FOUND)

		if (user.isBanned) return USER_ERROR_MESSAGE.USER_ALREADY_BANNED

		user.isBanned = true
		user.banReason = reason

		const banUntil = new Date(Date.now() + duration)

		if (isNaN(banUntil.getTime()))
			user.banDuration = new Date(Date.now() + 10 * 1000)
		else user.banDuration = banUntil

		await this.userRepository.save(user)

		return USER_SUCCESS_MESSAGE.USER_BANNED
	}
}
