import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { readdir, rename } from 'fs/promises'
import { join } from 'path'
import { writeUserIcon } from 'src/common/utils/WriteUserIcon'
import { Repository } from 'typeorm'
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
}
