import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { plainToInstance } from 'class-transformer'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserResponseDto } from '../users-microservice/entities/dto/user-response.dto'
import { User } from '../users-microservice/entities/user.entity'
import { UsersService } from '../users-microservice/users.service'



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly usersService: UsersService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request) => req.cookies?.jwt,
			]),
			ignoreExpiration: false,
			secretOrKey: String(process.env.JWT_KEY)
		})
	}

	async validate(payload: User) {
		const user = await this.usersService.findByUsername(payload.username)
		return plainToInstance(UserResponseDto, user)
	}
}
