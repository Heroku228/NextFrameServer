import { Controller, Get, Inject, NotFoundException, Query, Req, Res } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { Response } from 'express'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { User } from 'microservices/users-microservice/entities/user.entity'
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs'
import { ICurrentUser } from 'types/current-user.type'
import { IRequest } from 'types/request.type'

@Controller('public/users')
export class PublicUsersController {
	constructor(
		@Inject('USERS_SERVICE')
		private readonly usersClient: ClientProxy
	) { }

	@Get('all-cookies')
	getAllCookies(@Req() req: IRequest) {
		const cookies = req.cookies

		if (Object.keys(cookies).length === 0) {
			console.log(Object.keys(cookies).length)
			return {
				message: "No cookies"
			}
		}

		return cookies
	}

	@Get('me')
	getData(
		@CurrentUser() user: ICurrentUser,
		@Res() res: Response
	) {
		console.log('USER => ', user)
		res.send(user)
		return
	}

	@Get()
	async getUser(@Query('username') username: string) {
		console.log('get user controller')

		const observableUser: Observable<User> = this.usersClient.send('find-by-username', username)
			.pipe(
				catchError(
					() =>
						throwError(() =>
							new NotFoundException('User not found'))
				)
			)

		const user = await firstValueFrom(observableUser)
		return plainToInstance(UserResponseDto, user)
	}

	@Get('all-users')
	async showAllUsers() {
		return this.usersClient.send('find-all', {})
	}
}
