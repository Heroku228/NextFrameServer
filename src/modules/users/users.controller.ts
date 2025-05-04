import { Controller, Delete, ForbiddenException, Get, Param, Patch, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { plainToInstance } from 'class-transformer'
import { Response } from 'express'
import { readdir, rm } from 'fs/promises'
import { homedir } from 'os'
import { join } from 'path'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { Roles } from 'src/common/decorators/Roles.decorator'
import { UserDirectory } from 'src/common/decorators/user-directory.decorator'
import { JwtAuthGuard } from 'src/common/guards/JwtAuthGuard.guard'
import { RolesGuard } from 'src/common/guards/RolesGuard.guard'
import { FILE_SYSTEM_ROUTES } from 'src/consts/Routes'
import { ResponseProductDto } from '../products/dto/response-product.dto'
import { ProductsService } from '../products/products.service'
import { UserResponseDto } from './entities/dto/user-response.dto'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly productsService: ProductsService
	) { }

	@Delete('clear')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async clear() {
		await this.usersService.clear()
		await rm(join(homedir(), 'next-frame', 'uploads'), { force: true, recursive: true })
		return 'Clear'
	}

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

	@Patch('change-icon')
	@UseInterceptors(FileInterceptor('icon'))
	async changeUserIcon(
		@CurrentUser() user: UserResponseDto,
		@UserDirectory() directory: string,
		@UploadedFile() file: Express.Multer.File
	) {
		return await this.usersService.changeUserIcon(file, directory, user)
	}

	@Patch('become-seller')
	async becomeSeller(
		@CurrentUser() user: User
	) {
		if (user.isSeller) return { message: 'User is already a seller' }
		console.log('user: ', user)
		await this.usersService.setBecomeSeller(user.username)

		return {
			message: `User: ${user.username} now is a seller`
		}
	}
}

