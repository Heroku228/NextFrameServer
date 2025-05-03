import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { homedir } from 'os'
import { join } from 'path'



export const UserDirectory = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest()
	console.log('user directory decorator')
	return join(homedir(), 'next-frame', 'uploads', request.user.username)
}) 
