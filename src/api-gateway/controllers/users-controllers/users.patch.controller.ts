import { BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, NotFoundException, Param, Patch, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { FileInterceptor } from '@nestjs/platform-express'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { plainToInstance } from 'class-transformer'
import { CookieUserGuard } from 'common/decorators/cookie-user.guard'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { Roles } from 'common/decorators/Roles.decorator'
import { UserDirectory } from 'common/decorators/user-directory.decorator'
import { RolesGuard } from 'common/guards/RolesGuard.guard'
import { HTTP_STATUS_CODES } from 'consts/Http-status'
import { Response } from 'express'
import { UpdateUserData } from 'microservices/users-microservice/entities/dto/update-user.dto'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { User } from 'microservices/users-microservice/entities/user.entity'
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs'


@Controller('users')
@UseGuards(CookieUserGuard)
export class PatchUserController {
	constructor(
		@Inject('USERS_SERVICE')
		private readonly usersClient: ClientProxy,
		@Inject('AUTH_SERVICE')
		private readonly authClient: ClientProxy,

		@Inject()
		private readonly usersService: AppUsersService
	) { }

	@Patch('update-user-data')
	async changeUserData(
		@CurrentUser() user: UserResponseDto,
		@Res() res: Response,
		@Body() userData: UpdateUserData,
	) {
		console.log(user)
		console.log(userData)

		const observableUpdatedUser: Observable<User> = this.usersClient.send('update-user-data', { userData, user })
			.pipe(catchError(
				() => throwError(
					() => new BadRequestException('Cannot update user data'))
			))

		const updatedUser = await firstValueFrom(observableUpdatedUser)
		console.log(updatedUser)

		const observableAccessToken: Observable<string> = this.authClient.send('generate-token', {
			id: updatedUser.id,
			username: updatedUser.username
		})
			.pipe(catchError(
				() => throwError(
					() => new InternalServerErrorException('Cannot to generate access token'))
			))

		const newAccessToken = await firstValueFrom(observableAccessToken)

		res.cookie('jwt', newAccessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 24 * 60 * 60 * 1000
		})

		const response = plainToInstance(UserResponseDto, updatedUser)
		res.json(response)
		return
	}

	@Patch('change-icon')
	@UseInterceptors(FileInterceptor('icon'))
	async changeUserIcon(
		@UploadedFile() file: Express.Multer.File,
		@CurrentUser() user: UserResponseDto,
		@UserDirectory() directory: string,
	) {

		// TODO
		this.usersClient.send('change-user-icon', { file, directory, user })

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
		const observableUserRoles: Observable<string[]> = this.usersClient.send('change-user-role', { username, role })
			.pipe(catchError(
				() => throwError(
					() => new InternalServerErrorException('Cannot change user role'))
			))
		const userRoles = await firstValueFrom(observableUserRoles)

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

		// TODO
		this.usersClient.send('set-become-seller', user.username)

		return {
			message: `User: ${user.username} now is a seller`
		}
	}
}
