import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from 'src/modules/users/entities/user.entity'

@Injectable()
export class SellerGuard implements CanActivate {
	canActivate(context: ExecutionContext) {
		const user: User = context.switchToHttp().getRequest().user

		if (!user) throw new UnauthorizedException()

		if (!user.isSeller) {
			throw new BadRequestException('You need to become a seller to use product service')
		} else return true
	}
}
