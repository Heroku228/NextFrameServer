import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { firstValueFrom } from 'rxjs'
import { IRequest } from 'types/request.type'


/**
 * @des Не пропускает авторизованного пользователя к ресурсу.
 * Делает запрос к БД - данные берет из IRequest.user
 * @returns true | false
 */
@Injectable()
export class PreventAuthorizedGuard implements CanActivate {

	constructor(private readonly usersService: AppUsersService) { }

	async canActivate(context: ExecutionContext) {
		const req: IRequest = context.switchToHttp().getRequest()
		if (!req.user) return true

		const { username } = req.user
		const currentUser = await firstValueFrom(this.usersService.findByUsername(username))

		if (currentUser) return false
		return true
	}
}
