import { Controller, Get, Logger, UnauthorizedException } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { firstValueFrom } from 'rxjs'
import { ICurrentUser } from 'types/current-user.type'
import { CHECK_AUTH_API_OPERATION } from './auth.swagger'

type TAuthenticatedStatus = {
	isAuthenticated: boolean
}
const apiOkResponse = {
	description: 'Пользователь авторизован',
	type: Boolean
}

@Controller('auth')
@ApiTags('auth')
export class CheckAuthController {
	constructor(private readonly usersService: AppUsersService) { }
	private logger = new Logger(CheckAuthController.name)

	/**
	 * Проверяет, авторизован ли текущий пользователь
	 * @param user - Текущий пользователь, полученный из декоратора CurrentUser
	* @returns Возвращает булевое выражение авторизованности текущего пользователя
	*/
	@ApiOperation(CHECK_AUTH_API_OPERATION)
	@ApiOkResponse(apiOkResponse)
	@Get('check-auth')
	async checkAuth(@CurrentUser() user: ICurrentUser): Promise<TAuthenticatedStatus> {
		this.logger.debug('Received request to check authentication status')
		if (!user) return { isAuthenticated: false }

		this.logger.debug('Checking authentication status for user:', user)

		const { username } = user

		const currentUser = await firstValueFrom(this.usersService.findByUsername(username))
			.catch(() => { throw new UnauthorizedException() })

		if (!currentUser) throw new UnauthorizedException()

		return { isAuthenticated: true }
	}
}
