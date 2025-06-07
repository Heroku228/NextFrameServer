import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Response } from 'express'
import { IRequest } from 'types/request.type'


/**
 * Рекомендуемо к использованию. Удаляет все куки текущего пользователя
 */
export class ClearCookiesInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler<any>) {
		const response: Response = context.switchToHttp().getResponse()
		const request: IRequest = context.switchToHttp().getRequest()


		for (const [key, value] of Object.entries(request.cookies)) {
			response.clearCookie(key)
		}

		return next.handle()
	}
}
