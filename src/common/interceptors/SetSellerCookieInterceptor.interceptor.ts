import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { setProtectedCookie } from 'common/utils/set-cookie'
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
				if (data.setSellerCookie)
					setProtectedCookie(res, 'isSeller', true)
			})
		)
	}
}
