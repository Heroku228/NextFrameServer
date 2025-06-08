import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common'
import { join } from 'path'
import { cwd } from 'process'


/**
 * Возвращает путь до директории текущего авторизованного пользователя 
 * @returns {string | undefined} Например: текущий пользователь 'heroku228', значит путь -> '{корень проекта}/uploads/heroku228'
 */
export const UserDirectory = createParamDecorator((data: unknown, ctx: ExecutionContext): string | undefined => {
	const logger = new Logger(UserDirectory.name)
	const request = ctx.switchToHttp().getRequest()

	logger.log(request.user)
	return join(cwd(), 'uploads', request.user.username)
}) 
