import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { SELLER_ERROR_MESSAGE } from 'constants/ErrorMessages'
import { User } from 'microservices/users-microservice/entities/user.entity'

/**
 * Проверяем имеет ли текущий пользователь статус продавца (seller)
 */
@Injectable()
export class SellerGuard implements CanActivate {
	canActivate(context: ExecutionContext) {
		const user: User = context.switchToHttp().getRequest().user

		if (!user) throw new UnauthorizedException()

		if (!user.isSeller)
			throw new BadRequestException(SELLER_ERROR_MESSAGE.NEED_SELLER_STATUS)
		else return true
	}
}
