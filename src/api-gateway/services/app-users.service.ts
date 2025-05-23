import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Product } from 'microservices/products-microservice/entities/product.entity'
import { CreateUserDto } from 'microservices/users-microservice/entities/dto/create-user.dto'
import { UpdateUserData } from 'microservices/users-microservice/entities/dto/update-user.dto'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { User } from 'microservices/users-microservice/entities/user.entity'
import { Observable } from 'rxjs'

@Injectable()
export class AppUsersService {
	constructor(
		@Inject('USERS_SERVICE')
		private readonly userClient: ClientProxy
	) { }

	findUserProducts(userId: string): Observable<Product[]> {
		return this.userClient.send('find-user-products', { userId })
	}

	findById(id: string): Observable<UserResponseDto> {
		return this.userClient.send('find-by-id', { id })
	}

	clear() {
		return this.userClient.send('clear-all-data', {})
	}

	create(createUserDto: CreateUserDto) {
		return this.userClient.send('create-user', { createUserDto })
	}

	findAll() {
		return this.userClient.send('find-all-user', {})
	}

	findByUsername(username: string): Observable<User | null> {
		return this.userClient.send('find-by-username', username)
	}

	findByEmail(email: string) {
		return this.userClient.send('find-by-email', { email })
	}

	changeUserRole(username: string, role: string) {
		return this.userClient.send('change-user-role', { username, role })
	}

	changeUserIcon(file: Express.Multer.File, directory: string, user: UserResponseDto) {
		return this.userClient.send('change-user-icon', { file, directory, user })
	}

	setBecomeSeller(username: string) {
		return this.userClient.send('set-become-seller', { username })
	}

	deleteUserAccountByID(userId: string) {
		return this.userClient.send('delete-user-account-by-id', { userId })
	}

	deleteOtherUserAccount(username: string) {
		return this.userClient.send('delete-other-user-account', { username })
	}

	updateUserData(userData: UpdateUserData): Observable<User | null> {
		return this.userClient.send('update-user-data', userData)
	}

}

