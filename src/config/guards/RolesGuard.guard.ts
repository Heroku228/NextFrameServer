import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES } from 'src/consts/Roles'
import { User } from 'src/modules/users/entities/user.entity'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) { }

	canActivate(context: ExecutionContext) {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES,
			[context.getHandler(), context.getClass()]
		)

		if (!requiredRoles) return true
		const user: User = context.switchToHttp().getRequest().user
		return requiredRoles.some(role => user.roles.includes(role))
	}
}
