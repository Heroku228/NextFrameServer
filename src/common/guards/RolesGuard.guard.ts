import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES } from 'consts/Roles'
import { User } from 'microservices/users-microservice/entities/user.entity'
import { ROLES_KEY } from '../decorators/Roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) { }

	canActivate(context: ExecutionContext) {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		)

		if (!requiredRoles) return true

		const user: User = context.switchToHttp().getRequest().user

		if (user.roles.length === 0)
			user.roles.push(ROLES.user)

		return requiredRoles.some(role => user.roles.includes(role))
	}
}
