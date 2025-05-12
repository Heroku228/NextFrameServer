import { Controller, Delete, ForbiddenException, Param, Res, UseGuards } from '@nestjs/common'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { Roles } from 'common/decorators/Roles.decorator'
import { UserDirectory } from 'common/decorators/user-directory.decorator'
import { JwtAuthGuard } from 'common/guards/JwtAuthGuard.guard'
import { RolesGuard } from 'common/guards/RolesGuard.guard'
import { FILE_SYSTEM_ROUTES } from 'consts/Routes'
import { Response } from 'express'
import { existsSync } from 'fs'
import { rm } from 'fs/promises'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { homedir } from 'os'
import { join } from 'path'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class DeleteUsersController {
	constructor(private readonly usersService: AppUsersService) { }

	@Delete('delete-account')
	async deleteUserAccount(
		@CurrentUser() user: UserResponseDto,
		@UserDirectory() directory: string,
		@Res() res: Response
	) {
		if (!user) throw new ForbiddenException()

		await rm(directory, { force: true, recursive: true })

		await this.usersService.deleteUserAccountByID(user.id)
		res.clearCookie('jwt')

		return { message: 'Account is succefully deleted' }
	}


	@UseGuards(RolesGuard)
	@Roles('admin')
	@Delete('delete-account/:username')
	async deleteOtherUserAccount(@Param('username') username: string) {
		await this.usersService.deleteOtherUserAccount(username)

		const pathToUserDirectory = join(FILE_SYSTEM_ROUTES.PATH_TO_UPLOADS_DIR, username)

		if (existsSync(pathToUserDirectory))
			await rm(pathToUserDirectory, { force: true, recursive: true })

		return { message: 'Account is succefully deleted' }
	}

	@Delete('clear')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async clear() {
		await this.usersService.clear()
		await rm(join(homedir(), 'next-frame', 'uploads'), { force: true, recursive: true })
		return 'Clear'
	}
}
