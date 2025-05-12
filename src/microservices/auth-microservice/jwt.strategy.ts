import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { PassportStrategy } from '@nestjs/passport'
import { plainToInstance } from 'class-transformer'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { firstValueFrom, throwError } from 'rxjs'
import { UserResponseDto } from '../users-microservice/entities/dto/user-response.dto'
import { User } from '../users-microservice/entities/user.entity'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject('USERS_SERVICE')
		private readonly usersClient: ClientProxy
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
		const username = payload.username
		const observableUser = this.usersClient.send('find-by-username', { username })
			.pipe(
				() => throwError(
					() => new NotFoundException('User not found'))
			)

		const user: User = await firstValueFrom(observableUser)

		return plainToInstance(UserResponseDto, user)
	}
}
