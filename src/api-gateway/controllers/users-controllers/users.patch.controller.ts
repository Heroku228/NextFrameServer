import { Controller, Param, Patch, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { Roles } from 'common/decorators/Roles.decorator'
import { UserDirectory } from 'common/decorators/user-directory.decorator'
import { JwtAuthGuard } from 'common/guards/JwtAuthGuard.guard'
import { RolesGuard } from 'common/guards/RolesGuard.guard'
import { HTTP_STATUS_CODES } from 'consts/Http-status'
import { Response } from 'express'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class PatchUserController {
	constructor(private readonly usersService: AppUsersService) { }

	// @Patch('change-user-data')
	// async changeUserData(
	// 	@CurrentUser() user: UserResponseDto,
	// 	@Req() req: Request,
	// 	@Res() res: Response,
	// 	@Body() userData: UpdateUserData,
	// ) {

	// 	console.log(user)
	// 	console.log(userData)

	// 	const updatedUser = await this.usersService.updateUserData(userData, user)
	// 	console.log(updatedUser)

	// 	const newAccessToken = this.authService.generateToken({
	// 		id: updatedUser.id,
	// 		username: updatedUser.username
	// 	} as UserResponseDto)


	// 		res.cookie('jwt', newAccessToken, {
	// 		httpOnly: true,
	// 		secure: process.env.NODE_ENV === 'production',
	// 			sameSite: 'lax',
	// 				maxAge: 24 * 60 * 60 * 1000
	// 		})

	// const response = plainToInstance(UserResponseDto, updatedUser)
	// res.json(response)
	// 	}

	@Patch('change-icon')
	@UseInterceptors(FileInterceptor('icon'))
	async changeUserIcon(
		@UploadedFile() file: Express.Multer.File,
		@CurrentUser() user: UserResponseDto,
		@UserDirectory() directory: string,
	) {
		this.usersService.changeUserIcon(file, directory, user)

		return { message: 'Icon is successfully changed' }
	}

	@Patch('change-role/:username/:role')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async becomeAdmin(
		@Param('username') username: string,
		@Param('role') role: string,
		@Res() res: Response
	) {
		const userRoles = this.usersService.changeUserRole(username, role)

		res
			.status(HTTP_STATUS_CODES.ACCEPTED)
			.json({
				message: `Role updated to ${role.toUpperCase()} for user ${username}`,
				data: userRoles
			})
	}

	@Patch('become-seller')
	async becomeSeller(@CurrentUser() user: UserResponseDto) {
		if (user.isSeller) return { message: 'User is already a seller' }
		console.log('user: ', user)
		this.usersService.setBecomeSeller(user.username)

		return {
			message: `User: ${user.username} now is a seller`
		}
	}
}
