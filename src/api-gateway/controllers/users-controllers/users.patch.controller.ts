import { BadRequestException, Body, Controller, Inject, InternalServerErrorException, Param, Patch, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common'
import { AppAuthService } from 'api-gateway/services/app-auth.service'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { Roles } from 'common/decorators/Roles.decorator'
import { CookieUserGuard } from 'common/guards/cookie-user.guard'
import { RolesGuard } from 'common/guards/RolesGuard.guard'
import { JwtCookieInterceptor } from 'common/interceptors/JwtCookieInterceptor.interceptor'
import { HTTP_STATUS_CODES } from 'consts/Http-status'
import { Response } from 'express'
import { UpdateUserData } from 'microservices/users-microservice/entities/dto/update-user.dto'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs'
import { UserRequest } from 'types/current-user.type'
import { IRequest } from 'types/request.type'


@Controller('users')
@UseGuards(CookieUserGuard)
export class PatchUserController {
	constructor(
		@Inject()
		private readonly usersService: AppUsersService,
		@Inject()
		private readonly authService: AppAuthService
	) { }

	@Patch('update-user-data')
	@UseInterceptors(JwtCookieInterceptor)
	async changeUserData(
		@CurrentUser() user: UserRequest.ICurrentUser,
		@Body() userData: UpdateUserData,
		@Req() req: IRequest
	) {
		if (!user) throw new UnauthorizedException('No current user data')

		userData.userId = user.sub

		const updatedUser = await firstValueFrom(
			this.usersService.updateUserData(userData).pipe(
				catchError(() => throwError(() => new BadRequestException('Cannot update user data')))
			)
		)

		if (!updatedUser) throw new BadRequestException('Cannot update user data')

		const newAccessToken = await firstValueFrom(
			this.authService.generateToken(updatedUser).pipe(
				catchError(() => throwError(() => new InternalServerErrorException('Cannot to generate access token')))
			)
		)

		req.newAccessToken = newAccessToken

		return plainToInstance(UserResponseDto, updatedUser)
	}

	// @Patch('change-icon')
	// @UseInterceptors(FileInterceptor('icon'))
	// async changeUserIcon(
	// 	@UploadedFile() file: Express.Multer.File,
	// 	@CurrentUser() user: UserResponseDto,
	// 	@UserDirectory() directory: string,
	// ) {

	// 	// TODO
	// 	this.usersClient.send('change-user-icon', { file, directory, user })

	// 	return { message: 'Icon is successfully changed' }
	// }

	@Patch('change-role/:username/:role')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async becomeAdmin(
		@Param('username') username: string,
		@Param('role') role: string,
		@Res() res: Response
	) {
		const observableUserRoles: Observable<string[]> = this.usersService
			.changeUserRole(username, role)
			.pipe(catchError(() =>
				throwError(() =>
					new InternalServerErrorException('Cannot change user role'))
			))

		const userRoles = await firstValueFrom(observableUserRoles)

		res
			.status(HTTP_STATUS_CODES.ACCEPTED)
			.json({
				message: `Role updated to ${role.toUpperCase()} for user ${username}`,
				data: userRoles
			})

		return
	}

	@Patch('become-seller')
	async becomeSeller(@CurrentUser() user: UserResponseDto) {
		const { isSeller, username } = user

		if (isSeller)
			return { message: 'User is already a seller' }
		console.log('user: ', user)
		// TODO
		this.usersService.setBecomeSeller(username)

		return `User: ${user.username} now is a seller`
	}
}
