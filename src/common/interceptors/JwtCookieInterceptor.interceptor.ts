import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { setDefaultCookie, setProtectedCookie } from 'common/utils/set-cookie'
import { Response } from 'express'
import { Observable, tap } from 'rxjs'
import { IRequest } from 'types/request.type'

/**
 * Устанавлием JWT токен для пользователя и статус isSeller
 */

@Injectable()
export class JwtCookieInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const response: Response = context.switchToHttp().getResponse()
		const request: IRequest = context.switchToHttp().getRequest()

		console.log(request.cookies)

		return next.handle().pipe(
			tap(() => {
				if (request.newAccessToken) {
					setProtectedCookie(response, 'jwt', request.newAccessToken)
					setDefaultCookie(response, 'isSeller', request.isSeller)
				}
			})
		)
	}
}
