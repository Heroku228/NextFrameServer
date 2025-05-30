import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'


/**
 * Проверяет есть ли пользователь в Request, если нет, то Guard не пропустит к контроллеру
 */

@Injectable()
export class CookieUserGuard implements CanActivate {
	canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest()
		return !!request.user
	}
}
