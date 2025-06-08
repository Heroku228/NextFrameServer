import { ConflictException, Controller, Get, Inject, Logger, NotFoundException, Param, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { CookieUserGuard } from 'common/guards/cookie-user.guard'
import { pathToCurrentUserIcon, pathToDefaultIconOnFS } from 'constants/common'
import { ROLES } from 'constants/Roles'
import { Response } from 'express'
import { readdir, readFile } from 'fs/promises'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { join } from 'path'
import { cwd } from 'process'
import { firstValueFrom } from 'rxjs'
import { ICurrentUser } from 'types/current-user.type'

@Controller('users')
export class AppUsersController {
	constructor(@Inject() private readonly usersService: AppUsersService) { }
	private logger = new Logger(AppUsersController.name)

	@UseGuards(CookieUserGuard)
	@Get('me')
	async getCurrentUser(@CurrentUser() user: ICurrentUser) {
		if (!user) throw new UnauthorizedException()
		const userResponse = await firstValueFrom(this.usersService.findByUsername(user.username))
			.catch(() => new NotFoundException())

		if (!userResponse) throw new UnauthorizedException()

		return plainToInstance(UserResponseDto, userResponse)
	}

	@UseGuards(CookieUserGuard)
	@Get('check-by-admin-role')
	async checkByAdminRole(@CurrentUser() user: ICurrentUser) {
		return { isAdmin: user.roles.some(role => role === ROLES.admin) }
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
		@Res() res: Response) {

		const dir = pathToCurrentUserIcon(username)

		this.logger.log(`DIR => ${dir}`)

		const pathToAvatarsDir = join(cwd(), 'uploads', username, 'avatars')
		this.logger.log('pathToAvatarsDir => ', pathToAvatarsDir)
		const userAvatar = (await readdir(pathToAvatarsDir))[0]
		this.logger.log('user avatar => ', userAvatar)
		const pathToUserAvatar = join(pathToAvatarsDir, userAvatar)

		const fileData = await readFile(pathToUserAvatar)
		if (!fileData) {
			res.sendFile(pathToDefaultIconOnFS)
			return
		}

		res.sendFile(pathToUserAvatar)
		return
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

