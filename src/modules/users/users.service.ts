import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { homedir } from 'os'
import { extname, join } from 'path'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly userRespository: Repository<User>
	) { }

	async saveUser(user: User) {
		await this.userRespository.save(user)
	}

	async findAllUsers() {
		return await this.userRespository.find()
	}

	async findByUsername(username: string) {
		return await this.userRespository.findOne({
			where: {
				username: username
			}
		})
	}

	async findByEmail(email: string) {
		return await this.userRespository.findOne({
			where: {
				email: email
			}
		})
	}


	async writeUserIcon(
		username: string,
		file: Express.Multer.File
	) {
		const pathToUserIcon = join(homedir(), 'next-frame', 'uploads', username)

		if (!existsSync(pathToUserIcon))
			await mkdir(pathToUserIcon), { recursive: true }

		const originalname = file.originalname
		const extension = extname(originalname)

		const fullPathToUserIcon = join(
			pathToUserIcon,
			originalname.replace(extension, '') + randomUUID() + extension)

		await writeFile(
			fullPathToUserIcon,
			file.buffer
		)

		return fullPathToUserIcon
	}
}
