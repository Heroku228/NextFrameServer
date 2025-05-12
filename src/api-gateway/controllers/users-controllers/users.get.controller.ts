import { Controller, Get, NotFoundException, Param, Res, UseGuards } from '@nestjs/common'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { UserDirectory } from 'common/decorators/user-directory.decorator'
import { JwtAuthGuard } from 'common/guards/JwtAuthGuard.guard'
import { FILE_SYSTEM_ROUTES } from 'consts/Routes'
import { Response } from 'express'
import { readdir } from 'fs/promises'
import { ResponseProductDto } from 'microservices/products-microservice/dto/response-product.dto'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { join } from 'path'
import { catchError, firstValueFrom, throwError } from 'rxjs'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class AppUsersController {
	constructor(private readonly appUsersService: AppUsersService) { }

	@Get('me')
	async getCurrentUser(@CurrentUser() user: UserResponseDto) {
		return user
	}

	@Get('user-products')
	async getUserProducts(@CurrentUser() user: UserResponseDto) {
		const observableUser = this.appUsersService.findById(user.id)
			.pipe(
				catchError(() =>
					throwError(() =>
						new NotFoundException('User not found')
					)
				)
			)

		const originalUser = await firstValueFrom(observableUser)

		console.log('original user -> ', originalUser)

		const observableProducts = this.appUsersService.findUserProducts(originalUser.id)
			.pipe(catchError(() =>
				throwError(() =>
					new NotFoundException('User products not found ')))
			)

		const userProducts = await firstValueFrom(observableProducts)

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

