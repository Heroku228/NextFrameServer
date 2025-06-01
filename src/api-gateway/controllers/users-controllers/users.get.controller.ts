import { ConflictException, Controller, Get, Inject, NotFoundException, Param, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { UserDirectory } from 'common/decorators/user-directory.decorator'
import { CookieUserGuard } from 'common/guards/cookie-user.guard'
import { pathToDefaultIconOnFS } from 'constants/common'
import { Response } from 'express'
import { readdir } from 'fs/promises'
import { ResponseProductDto } from 'microservices/products-microservice/dto/response-product.dto'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { join } from 'path'
import { cwd } from 'process'
import { catchError, firstValueFrom, throwError } from 'rxjs'
import { ICurrentUser } from 'types/current-user.type'

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
	async getCurrentUser(@CurrentUser() user: ICurrentUser) {
		console.log('User => ', user)
		if (!user) throw new UnauthorizedException()
		const userResponse = await firstValueFrom(this.usersService.findByUsername(user.username))
			.catch(() => new NotFoundException())

		if (!userResponse) throw new UnauthorizedException()

		return plainToInstance(UserResponseDto, userResponse)
	}

	@Get('user-products')
	async getUserProducts(@CurrentUser() user: ICurrentUser) {
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

	@Get('default-icon')
	async showDefaultIcon(
		@Res() res: Response
	) {
		if (!pathToDefaultIconOnFS) throw new ConflictException()

		res.sendFile(pathToDefaultIconOnFS)
		return
	}

	@Get('user-icon/:username')
	async showIconForAnotherUser(
		@Param('username') username: string,
		@Res() res: Response,
		@UserDirectory() dir: string
	) {
		try {
			if (!username) {
				const pathToCurrentUserAvatar = await this.showCurrentUserAvatar(dir)
				res.sendFile(pathToCurrentUserAvatar)
				return
			}

			console.log('user-icon/:username')
			const pathToAvatarsDir = join(cwd(), 'uploads', username, 'avatars')
			console.log(pathToAvatarsDir)
			const userAvatar = (await readdir(pathToAvatarsDir))[0]
			console.log(userAvatar)

			const pathToUserAvatar = join(pathToAvatarsDir, userAvatar)
			return res.sendFile(pathToUserAvatar)
		} catch (err) {
			throw new NotFoundException('Avatar not found')
		}
	}


	private async showCurrentUserAvatar(directory: string) {
		const pathToAvatarsDir = join(directory, 'avatars')
		console.log('pathToAvatarsDir', pathToAvatarsDir)

		const userAvatar = await readdir(pathToAvatarsDir)
		console.log('pathToAvatarsDir)', pathToAvatarsDir)

		try {
			const pathToUserAvatarFile = join(pathToAvatarsDir, userAvatar[0])
			console.log('pathToUserAvatarFile ', pathToUserAvatarFile)
			return pathToUserAvatarFile
		} catch (err) {
			throw new NotFoundException('The user does not have an icon')
		}
	}
}

