import { BadRequestException, Controller, Get, Inject, Logger, NotFoundException, Query, Req, Res } from '@nestjs/common'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { USER_ERROR_MESSAGE } from 'constants/ErrorMessages'
import { Response } from 'express'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { firstValueFrom } from 'rxjs'
import { ICurrentUser } from 'types/current-user.type'
import { IRequest } from 'types/request.type'

@Controller('public/users')
export class PublicUsersController {
	constructor(@Inject() private readonly usersService: AppUsersService) { }

	private logger = new Logger(PublicUsersController.name)

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
		this.logger.log('get user controller')

		const user = await firstValueFrom(this.usersService.findByUsername(username))

		if (!user)
			throw new NotFoundException(USER_ERROR_MESSAGE.USER_NOT_FOUND)

		return plainToInstance(UserResponseDto, user)
	}

	@Get('all-users')
	async showAllUsers() {
		const users = await firstValueFrom(this.usersService.findAll())
			.catch(err => {
				this.logger.error(err)
				throw new BadRequestException(USER_ERROR_MESSAGE.USERS_NOT_FOUND)
			})

		if (!users || users.length < 1)
			return { message: USER_ERROR_MESSAGE.USERS_NOT_FOUND }

		this.logger.log('USERS => ', users)

		return users
	}
}
