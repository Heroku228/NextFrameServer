import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ClientProxy } from '@nestjs/microservices'
import { compare, hash } from 'bcrypt'
import { plainToInstance } from 'class-transformer'
import { ROLES } from 'consts/Roles'
import { catchError, firstValueFrom, throwError } from 'rxjs'
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
		const user: User = await firstValueFrom(
			this.usersClient.send('find-by-username', username)
				.pipe(catchError(() => throwError(() => new NotFoundException('User not found')))
				))

		if (user && await compare(password, user.password)) {
			const responseUser = plainToInstance(UserResponseDto, user)

			const accessToken = this.jwtService.sign({
				sub: user.id,
				username: user.username,
				roles: user.roles,
			})

			return { responseUser, accessToken }
		}

		return null
	}

	generateToken(user: User | UserResponseDto) {
		const payload = {
			sub: user.id,
			username: user.username,
			roles: user.roles,
		}

		return this.jwtService.sign(payload, {
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

		const userData: UserResponseDto = await firstValueFrom(
			this.usersClient.send('create-user', user))

		const payload = { sub: userData.id, username: userData.username }

		const token = this.jwtService.sign(payload, {
			secret: process.env.JWT_KEY,
			expiresIn: '1d'
		})

		return {
			data: userData,
			token: token,
		}

	}
}
