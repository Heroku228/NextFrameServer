import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { IRequest } from 'types/request.type'

/**
 * Возвращает текущего авторизованного пользователя из Request
 */

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest() as IRequest
	return request.user
})

