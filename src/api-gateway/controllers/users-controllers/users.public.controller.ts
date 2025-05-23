import { Controller, Get, Inject, NotFoundException, Query, Res} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { Response } from 'express'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { User } from 'microservices/users-microservice/entities/user.entity'
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs'

@Controller('public/users')
export class PublicUsersController {
	constructor(
		@Inject('USERS_SERVICE')
		private readonly usersClient: ClientProxy) { }

	@Get('me')
	getData(
		@CurrentUser() user: User,
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
