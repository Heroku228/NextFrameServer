import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm'
import { hash } from 'bcrypt'
import { plainToInstance } from 'class-transformer'
import { pathToUploadsDir, writeUserIcon } from 'common/utils/WriteUserIcon'
import { ROLES, TRoles } from 'consts/Roles'
import { readdir, rename } from 'fs/promises'
import { join } from 'path'
import { cwd } from 'process'
import { lastValueFrom } from 'rxjs'
import { Repository } from 'typeorm'
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
				const detail = err?.driverError?.detail || 'User with such email or username already exists'
				throw new RpcException(new ConflictException(detail))
			}
			throw err
		}
	}

	async findAll() {
		return (await this.userRepository
			.find())
			.map(user => plainToInstance(UserResponseDto, user))
	}

	async findByUsername(username: string) {
		return await this.userRepository
			.findOne({
				where: {
					username: username
				}
			})
	}

	async findByEmail(email: string) {
		return await this.userRepository
			.findOne({
				where: {
					email: email
				}
			})
	}

	async changeUserRole(username: string, role: string) {
		const isValidRole = Object.values(ROLES).includes(role.toLowerCase() as TRoles)
		if (!isValidRole)
			throw new BadRequestException(`Invalid role. Allowed roles: ${Object.values(ROLES).join(', ')}`)

		const user = await this.userRepository.findOne({
			where: {
				username: username
			}
		})

		if (!user) throw new NotFoundException('User not found')

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
		if (!userId) throw new NotFoundException('Account not found')
		return await this.userRepository.delete(userId)
	}

	async deleteOtherUserAccount(username: string) {
		const user = await this.userRepository.findOne({
			where: {
				username: username
			}
		})

		if (!user) throw new NotFoundException('Account not found')

		if (user.roles.includes('admin'))
			throw new ForbiddenException('You cannot delete admin account')

		this.deleteUserAccountByID(user.id)
	}

	async updateUserData(userData: UpdateUserData) {
		if (!userData)
			throw new BadRequestException('Invalid data')

		const { username, email, password, userId, icon } = userData

		let isUsernameChanged = false
		let isUserIconChanged = false

		const existingUser = await this.findById(userId)

		if (!existingUser)
			throw new NotFoundException('User not found')

		const updatePayload: Partial<User> = {}

		if (username) {
			updatePayload.username = username
			isUsernameChanged = true
		}

		if (email)
			updatePayload.email = email

		if (password) {
			const hashedPassword = await hash(password, 10)
			updatePayload.password = hashedPassword
		}

		if (icon) {
			const targetUsername = isUsernameChanged ? username : existingUser.username
			const pathToUserDir = join(cwd(), 'uploads', targetUsername)

			const avatarsDir = join(pathToUserDir, 'avatars')
			const oldAvatarsDir = join(pathToUserDir, 'oldAvatars')

			const files = await readdir(join(pathToUserDir, 'avatars'))

			if (files.length) {
				await Promise.all(
					files.map(file => rename(
						join(avatarsDir, file),
						join(oldAvatarsDir, file)
					))
				)
			}

			await writeUserIcon(targetUsername, icon)
			isUserIconChanged = true
		}

		if (Object.keys(updatePayload).length === 0 && !isUserIconChanged)
			throw new BadRequestException('No data provided to update')

		try {
			await this.userRepository.update(existingUser.id, updatePayload)

			const updatedUser = await this.userRepository.findOne({
				where: { id: existingUser.id }
			})

			if (isUsernameChanged) {
				const pathToUserDir = join(pathToUploadsDir, existingUser.username)
				const newPathToUserDir = join(pathToUploadsDir, username)
				await rename(pathToUserDir, newPathToUserDir)
			}

			return updatedUser
		} catch (err) {
			throw new RpcException(err)
		}
	}
}
