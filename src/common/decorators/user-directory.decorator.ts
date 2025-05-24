import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { join } from 'path'
import { cwd } from 'process'



export const UserDirectory = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest()
	return join(cwd(), 'uploads', request.user.username)
}) 
