import { Controller, Get, Inject, NotFoundException, Param, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { UserDirectory } from 'common/decorators/user-directory.decorator'
import { CookieUserGuard } from 'common/guards/cookie-user.guard'
import { FILE_SYSTEM_ROUTES } from 'consts/Routes'
import { Response } from 'express'
import { readdir } from 'fs/promises'
import { ResponseProductDto } from 'microservices/products-microservice/dto/response-product.dto'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { join } from 'path'
import { catchError, firstValueFrom, throwError } from 'rxjs'

@Controller('users')
@UseGuards(CookieUserGuard)
export class AppUsersController {
	constructor(
		@Inject()
		private readonly appUsersService: AppUsersService,
		@Inject()
		private readonly usersService: AppUsersService
	) { }

	@Get('me')
	async getCurrentUser(@CurrentUser() user: UserResponseDto) {
		if (!user)
			throw new UnauthorizedException()

		const userResponse = await firstValueFrom(
			this.usersService.findByUsername(user.username)
				.pipe(catchError(() => throwError(() => new NotFoundException()))
				)
		)

		if (!userResponse)
			throw new UnauthorizedException()

		return plainToInstance(UserResponseDto, userResponse)
	}

	@Get('user-products')
	async getUserProducts(@CurrentUser() user: UserResponseDto) {
		const originalUser = await firstValueFrom(
			this.usersService.findByUsername(user.username)
				.pipe(catchError(() => throwError(() => new NotFoundException()))
				)
		)

		if (!originalUser) {
			throw new NotFoundException('User not found')
		}

		const userProducts = await firstValueFrom(
			this.appUsersService.findUserProducts(originalUser.id)
				.pipe(catchError(() => throwError(() => new NotFoundException('User products not found ')))
				)
		)

		console.log('user products -> ', userProducts)

		return userProducts
			.filter(product => !product.isHidden)
			.map(product => plainToInstance(ResponseProductDto, product))
	}

	@Get('user-icon')
	async showUserIcon(
		@UserDirectory() directory: string,
		@Res() res: Response
	) {
		const pathToAvatarsDir = join(directory, 'avatars')
		const userAvatar = await readdir(pathToAvatarsDir)

		const pathToUserAvatarFile = join(pathToAvatarsDir, userAvatar[0])
		return res.sendFile(pathToUserAvatarFile)
	}

	@Get('user-icon/:username/')
	async showIconForAnotherUser(
		@Param('username') username: string,
		@Res() res: Response
	) {
		const pathToAvatarsDir = join(FILE_SYSTEM_ROUTES.PATH_TO_UPLOADS_DIR, username, 'avatars')
		const userAvatar = await readdir(pathToAvatarsDir)

		const pathToUserAvatarFile = join(pathToAvatarsDir, userAvatar[0])
		return res.sendFile(pathToUserAvatarFile)
	}
}

