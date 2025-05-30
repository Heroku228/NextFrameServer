import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { tap } from 'rxjs'


/**
 * Устанавливаем клиенту куку: "isSeller"
 */
@Injectable()
export default class SetSellerCookieInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler<any>) {
		const res = context.switchToHttp().getResponse()

		return next.handle().pipe(
			tap(data => {
				if (data.setSellerCookie) {
					res.cookie('isSeller', true, {
						httpOnly: false,
						secure: true,
						sameSite: 'strict',
						maxAge: 24 * 60 * 60 * 1000
					})
				}
			})
		)
	}
}
