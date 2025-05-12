import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ClientProxy } from '@nestjs/microservices'
import { compare, hash } from 'bcrypt'
import { plainToInstance } from 'class-transformer'
import { ROLES } from 'consts/Roles'
import { firstValueFrom, throwError } from 'rxjs'
import { CreateUserDto } from '../users-microservice/entities/dto/create-user.dto'
import { UserResponseDto } from '../users-microservice/entities/dto/user-response.dto'
import { User } from '../users-microservice/entities/user.entity'

@Injectable()
export class AuthService {
	constructor(
		@Inject('USERS_SERVICE')
		private readonly usersClient: ClientProxy,
		private readonly jwtService: JwtService
	) { }

	async validate(username: string, password: string) {

		const observableUser = this.usersClient.send('find-by-username', { username })
			.pipe((
				() =>
					throwError(
						() => new NotFoundException('User not found'))
			))

		const user: User = await firstValueFrom(observableUser)

		if (user && await compare(password, user.password)) {
			const responseUser = plainToInstance(UserResponseDto, user)

			const accessToken = this.jwtService.sign({
				sub: user.id,
				username: user.username,
			})

			return { responseUser, accessToken }
		}
		return null
	}

	generateToken(user: User | UserResponseDto) {
		return this.jwtService.sign(user, {
			secret: process.env.JWT_KEY,
			expiresIn: '1d'
		})
	}

	async register(createUserDto: CreateUserDto) {
		if (!createUserDto) throw new BadRequestException('User not found')

		const user = plainToInstance(User, createUserDto)
		user.roles.push(ROLES.admin)

		const hashedPassword = await hash(createUserDto.password, 10)
		user.password = hashedPassword

		const observableUser = this.usersClient.send('create-user', { createUserDto })
			.pipe((
				() => throwError(
					() => new NotFoundException('User not found'))
			))

		const userResponseDto: UserResponseDto = await firstValueFrom(observableUser)

		const payload = { sub: user.id, username: user.username }

		const token = this.jwtService.sign(payload, {
			secret: process.env.JWT_KEY,
			expiresIn: '1d'
		})

		return {
			data: userResponseDto,
			token: token,
		}
	}
}
