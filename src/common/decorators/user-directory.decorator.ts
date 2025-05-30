import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { join } from 'path'
import { cwd } from 'process'


/**
 * Возвращает путь до директории текущего авторизованного пользователя 
 * @returns {string | undefined} Например: текущий пользователь 'heroku228', значит путь -> '{корень проекта}/uploads/heroku228'
 */
export const UserDirectory = createParamDecorator((data: unknown, ctx: ExecutionContext): string | undefined => {
	const request = ctx.switchToHttp().getRequest()
	return join(cwd(), 'uploads', request.user.username)
}) 
