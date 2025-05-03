import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from 'src/modules/users/entities/user.entity'

@Injectable()
export class SellerGuard implements CanActivate {
	canActivate(context: ExecutionContext) {
		const user: User = context.switchToHttp().getRequest().user

		if (!user) throw new UnauthorizedException()

		if (!user.isSeller) return false
		else return true
	}
}
