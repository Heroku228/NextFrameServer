import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { hash } from 'bcrypt'
import { plainToInstance } from 'class-transformer'
import { readdir, rename } from 'fs/promises'
import { join } from 'path'
import { writeUserIcon } from 'src/common/utils/WriteUserIcon'
import { ROLES, TRoles } from 'src/consts/Roles'
import { Repository } from 'typeorm'
import { UpdateUserData } from './entities/dto/update-user.dto'
import { UserResponseDto } from './entities/dto/user-response.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) { }

	async findById(id: string) {
		return await this.userRepository.findOne({
			where: { id: id }
		})
	}

	async clear() {
		await this.userRepository.delete({})
	}

	async create(user: User) {
		return await this.userRepository.save(user)
	}

	async findAll(): Promise<UserResponseDto[]> {
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

		return user.roles
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

	async setBecomeSeller(username: string) {
		const updatedUser = await this.userRepository.update({ username }, { isSeller: true })
		console.log('updated user: ', updatedUser)

		return plainToInstance(UserResponseDto, updatedUser)
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

	async updateUserData(userData: UpdateUserData, user: UserResponseDto) {
		if (!userData || !user)
			throw new BadRequestException('Invalid data')

		const existingUser = await this.findByUsername(user.username)
		if (!existingUser) {
			throw new NotFoundException('User not found')
		}

		const updatePayload: Partial<User> = {}

		if (userData.username)
			updatePayload.username = userData.username

		if (userData.email)
			updatePayload.email = userData.email

		if (userData.password) {
			const hashedPassword = await hash(userData.password, 10)
			updatePayload.password = hashedPassword
		}

		if (Object.keys(updatePayload).length === 0)
			throw new BadRequestException('No data provided to update')

		await this.userRepository.update(existingUser.id, updatePayload)

		const updatedUser = await this.userRepository.findOne({
			where: { id: existingUser.id }
		})

		return updatedUser!
	}
}
