import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRespository: Repository<User>
	) { }

	async clear() {
		await this.userRespository.clear()
	}

	async saveUser(user: User) {
		return await this.userRespository.save(user)
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
}
