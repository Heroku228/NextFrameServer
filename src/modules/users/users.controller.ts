import { Controller, Delete, Get, Param, Patch, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { rm } from 'fs/promises'
import { homedir } from 'os'
import { join } from 'path'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { Roles } from 'src/common/decorators/Roles.decorator'
import { UserDirectory } from 'src/common/decorators/user-directory.decorator'
import { JwtAuthGuard } from 'src/common/guards/JwtAuthGuard.guard'
import { RolesGuard } from 'src/common/guards/RolesGuard.guard'
import { UserResponseDto } from './entities/dto/user-response.dto'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

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

	@Get('user-icon/:filename')
	async showUserIcon(
		@Param('filename') filename: string,
		@CurrentUser() user: UserResponseDto,
		@UserDirectory() directory: string,
		@Res() res: Response
	) {
		console.log('DIRECTORY: ', directory)
		const userAvatar = join(directory, 'avatars', filename)
		return res.sendFile(userAvatar)
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

