import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { USER_ERROR_MESSAGE } from 'constants/ErrorMessages'
import { tap } from 'rxjs'
import { IRequest } from 'types/request.type'

/**
 * Блокируем доступ к ресурсу, если пользователь уже авторизован.
 * ПРОВЕРКА ИДЕТ ИСКЛЮЧИТЕЛЬНО ПО JWT-ТОКЕНУ В КУКАХ 
 */
@Injectable()
export class PreventAuthorizedInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler<any>) {
		const request: IRequest = context.switchToHttp().getRequest()

		return next.handle().pipe(
			tap(() => {
				if (request.cookies['jwt'])
					throw new BadRequestException(USER_ERROR_MESSAGE.USER_ALREADY_AUTHORIZED)
			})
		)
	}
}

