import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Response } from 'express'
import { Observable, tap } from 'rxjs'
import { IRequest } from 'types/request.type'



@Injectable()
export class JwtCookieInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const response: Response = context.switchToHttp().getResponse()
		const request: IRequest = context.switchToHttp().getRequest()

		return next.handle().pipe(
			tap(() => {
				if (request.newAccessToken) {
					response.cookie('jwt', request.newAccessToken, {
						httpOnly: true,
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'lax',
						maxAge: 24 * 60 * 60 * 1000
					})
				}
			})
		)
	}
}
