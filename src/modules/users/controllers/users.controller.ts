import { Controller, ForbiddenException, Get, Param, Res, UseGuards } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { Response } from 'express'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { UserDirectory } from 'src/common/decorators/user-directory.decorator'
import { JwtAuthGuard } from 'src/common/guards/JwtAuthGuard.guard'
import { FILE_SYSTEM_ROUTES } from 'src/consts/Routes'
import { ResponseProductDto } from '../../products/dto/response-product.dto'
import { ProductsService } from '../../products/products.service'
import { UserResponseDto } from '../entities/dto/user-response.dto'
import { UsersService } from '../users.service'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly productsService: ProductsService
	) { }

	@Get('me')
	async getCurrentUser(@CurrentUser() user: UserResponseDto) {
		return user
	}

	@Get('user-products')
	async getUserProducts(@CurrentUser() user: UserResponseDto) {
		const originalUser = await this.usersService.findById(user.id)
		if (!originalUser) throw new ForbiddenException()

		const userProducts = (await this.productsService.findUserProducts(originalUser?.id))
			.filter(product => !product.isHidden)
			.map(product => plainToInstance(ResponseProductDto, product))

		return userProducts
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

