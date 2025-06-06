import { BadRequestException, Body, ConflictException, Controller, Inject, InternalServerErrorException, Patch, Req, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AppAuthService } from 'api-gateway/services/app-auth.service'
import { simplifyDuplicateKeyMessage } from 'api-gateway/services/app-global.service'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { Roles } from 'common/decorators/Roles.decorator'
import { CookieUserGuard } from 'common/guards/cookie-user.guard'
import { RolesGuard } from 'common/guards/RolesGuard.guard'
import { JwtCookieInterceptor } from 'common/interceptors/JwtCookieInterceptor.interceptor'
import { setDefaultCookie } from 'common/utils/set-cookie'
import { Response } from 'express'
import { TransferredFile, UpdateUserData } from 'microservices/users-microservice/entities/dto/update-user.dto'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { catchError, firstValueFrom, throwError } from 'rxjs'
import { ICurrentUser } from 'types/current-user.type'
import { IRequest } from 'types/request.type'

type TDuplicateValueErrorResponse = {
	query: string,
	parameters: string[],
	driverError: {
		length: number,
		name: string,
		severity: string,
		code: string,
		detail: string,
		schema: string,
		table: string,
		constraint: string,
		file: string,
		line: string,
		routine: string
	},
	length: number,
	severity: string,
	code: string,
	detail: string,
	schema: string,
	table: string,
	constraint: string,
	file: string,
	line: string,
	routine: string,
}

type TResetUserPassword = { username: string, newPassword: string }


@Controller('users')
@UseGuards(CookieUserGuard)
export class PatchUserController {
	constructor(
		@Inject()
		private readonly usersService: AppUsersService,
		@Inject()
		private readonly authService: AppAuthService
	) { }


	/** @des Контроллер для функции: "Забыл пароль" */
	@Patch('reset-user-password')
	async resetUserPassword(@Body() { username, newPassword }: TResetUserPassword) {
		const resetStatus = await firstValueFrom(this.authService.resetUserPassword(username, newPassword))
			.catch(err => {
				throw new Error(`Ошибка при сбросе пароля пользователя: ${err.message}`)
			})

		return { resetStatus: resetStatus }
	}

	@Patch('update-user-data')
	@UseInterceptors(JwtCookieInterceptor, FileInterceptor('icon'))
	async changeUserData(
		@CurrentUser() user: ICurrentUser,
		@Body() userData: UpdateUserData,
		@UploadedFile() file: Express.Multer.File,
		@Req() req: IRequest
	) {
		if (!user) throw new UnauthorizedException('No current user data')

		userData.userId = user.sub

		if (file) {
			const filePayload: TransferredFile | null = file ? {
				buffer: file.buffer,
				originalname: file.originalname,
				mimetype: file.mimetype,
				size: file.size,
			} : null

			if (filePayload) userData.icon = filePayload
		}

		const updatedUser = await firstValueFrom(
			this.usersService.updateUserData(userData).pipe(
				catchError(err => throwError(() =>
					this.handleUpdateError(err)))
			)
		)

		console.log('UPDATED USER => ', updatedUser)

		if (!updatedUser) throw new BadRequestException('Cannot update user data')

		const newAccessToken = await firstValueFrom(
			this.authService.generateToken(updatedUser).pipe(
				catchError(() => throwError(() => new InternalServerErrorException('Cannot to generate access token')))
			)
		)

		req.newAccessToken = newAccessToken

		return plainToInstance(UserResponseDto, updatedUser)
	}

	@Patch('change-role')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async changeRole(
		@Body() body: { username: string, role: string }
	) {
		const { username, role } = body

		return await firstValueFrom(
			this.usersService.changeUserRole(username, role)
				.pipe(catchError(() => throwError(() =>
					new BadRequestException('Cannot change user role')))
				))
	}

	@Patch('become-seller')
	async becomeSeller(
		@CurrentUser() user: ICurrentUser,
		@Res() res: Response
	) {
		const { sub } = user

		const userResponse = await firstValueFrom(
			this.usersService.setBecomeSeller(sub)
				.pipe(catchError(() => throwError(() => new BadRequestException('Cannot change user role')))
				)
		)

		if (!userResponse)
			throw new ConflictException('Cannot change user status')

		setDefaultCookie(res, 'isSeller', true)

		res.send({
			message: `User: ${userResponse.username} now is a seller`
		})

		return
	}

	private handleUpdateError(err: unknown): never {
		const error = err as TDuplicateValueErrorResponse
		const detail = simplifyDuplicateKeyMessage(error.detail)
		throw new ConflictException('Cannot update user data', detail)
	}
}
