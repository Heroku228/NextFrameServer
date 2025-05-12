// import { BadRequestException, Injectable } from '@nestjs/common'
// import { JwtService } from '@nestjs/jwt'
// import { compare, hash } from 'bcrypt'
// import { plainToInstance } from 'class-transformer'
// import { ROLES } from 'src/consts/Roles'
// import { CreateUserDto } from '../users-microservice/entities/dto/create-user.dto'
// import { UserResponseDto } from '../users-microservice/entities/dto/user-response.dto'
// import { User } from '../users-microservice/entities/user.entity'
// import { UsersService } from '../users-microservice/users.service'

// @Injectable()
// export class AuthService {
// 	constructor(
// 		private readonly usersService: UsersService,
// 		private readonly jwtService: JwtService
// 	) { }

// 	async validate(username: string, password: string) {
// 		const user = await this.usersService.findByUsername(username)

// 		if (user && await compare(password, user.password)) {
// 			const responseUser = plainToInstance(UserResponseDto, user)

// 			const accessToken = this.jwtService.sign({
// 				sub: user.id,
// 				username: user.username,
// 			})

// 			return { responseUser, accessToken }
// 		}
// 		return null
// 	}

// 	generateToken(user: User | UserResponseDto) {
// 		return this.jwtService.sign(user, {
// 			secret: process.env.JWT_KEY,
// 			expiresIn: '1d'
// 		})
// 	}

// 	async register(user: CreateUserDto) {
// 		if (!user) throw new BadRequestException('User not found')

// 		const createdUser = plainToInstance(User, user)
// 		createdUser.roles.push(ROLES.admin)

// 		const hashedPassword = await hash(user.password, 10)
// 		createdUser.password = hashedPassword

// 		await this.usersService.create(createdUser)

// 		const payload = { sub: createdUser.id, username: user.username }

// 		const token = this.jwtService.sign(payload, {
// 			secret: process.env.JWT_KEY,
// 			expiresIn: '1d'
// 		})

// 		return {
// 			data: plainToInstance(UserResponseDto, createdUser),
// 			token: token,
// 		}
// 	}
// }
