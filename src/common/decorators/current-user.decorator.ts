import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

/**
 * Возвращает текущего авторизованного пользователя из Request
 */

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest() as Request
	return request.user
})

