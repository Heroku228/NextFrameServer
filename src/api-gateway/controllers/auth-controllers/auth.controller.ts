import { BadRequestException, Body, Controller, Post, Req, Res, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AppAuthService } from 'api-gateway/services/app-auth.service'
import { plainToInstance } from 'class-transformer'
import { writeUserIcon } from 'common/utils/WriteUserIcon'
import { API_STATUS, ApiResponse } from 'consts/ApiResponse'
import { HTTP_STATUS_CODES } from 'consts/Http-status'
import { Request, Response } from 'express'
import { CreateUserDto } from 'microservices/users-microservice/entities/dto/create-user.dto'
import { UserCredentials } from 'microservices/users-microservice/entities/dto/user-credentials.dto'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { User } from 'microservices/users-microservice/entities/user.entity'
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs'

type TypeObservableData = {
	createdUser: UserResponseDto,
	token: string
}

type TypeObservableValidateData = {
	responseUser: UserResponseDto
	accessToken: string
}

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AppAuthService
	) { }

	@Post('register')
	@UseInterceptors(FileInterceptor('icon'))
	async register(
		@Res({ passthrough: true }) res: Response,
		@UploadedFile() file: Express.Multer.File,
		@Body() payload: CreateUserDto,
	) {
		if (!file) {
			res
				.status(400)
				.send(
					new BadRequestException({
						access: false,
						message: '[Error] File (icon) is missing'
					})
				)
			return
		}

		const user = plainToInstance(User, payload)
		const pathToUserIcon = await writeUserIcon(user.username, file)
		user.pathToUserIcon = pathToUserIcon

		const observableData: Observable<TypeObservableData> = this.authService.register(user)
			.pipe(
				catchError(
					() => throwError(
						() => new UnauthorizedException('Failed to create account'))
				)
			)

		const { createdUser, token } = await firstValueFrom(observableData)

		res.cookie('jwt', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 24 * 60 * 60 * 1000
		})

		if (!createdUser) throw new UnauthorizedException()

		return {
			createdUser: plainToInstance(UserResponseDto, createdUser),
			icon: {
				filename: file.originalname,
				pathToUserIcon: pathToUserIcon
			}
		}
	}

	@Post('login')
	async login(
		@Body() credentials: UserCredentials,
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request
	) {
		// if (req.cookies['jwt']) {
		// 	console.log('LOGIN')
		// 	res.redirect(USERS_ROUTES.ME_ROUTE)
		// 	return
		// }

		console.log('login controller credentials -> ', credentials)

		const { username, password } = credentials

		const observableData: Observable<TypeObservableValidateData> = this.authService
			.validate(username, password)
			.pipe(
				catchError(
					() => throwError(
						() => new UnauthorizedException('No valid data'))
				))

		const result = await firstValueFrom(observableData)
		console.log('login controller result -> ', result)

		const { responseUser, accessToken } = result

		res.cookie('jwt', accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 24 * 60 * 60 * 1000
		})

		const response: ApiResponse<UserResponseDto> = {
			status: API_STATUS.SUCCESS,
			statusCode: HTTP_STATUS_CODES.OK,
			data: responseUser
		}

		res
			.status(response.statusCode)
			.json(response)

		return
	}

	@Post('logout')
	async logout(
		@Res() res: Response,
		@Req() req: Request
	) {
		if (!req.cookies['jwt']) {
			res
				.status(HTTP_STATUS_CODES.UNAUTHORIZED)
				.json({ message: 'No active session' })
			return
		}

		res.clearCookie('jwt')

		res
			.status(200)
			.json({
				status: HTTP_STATUS_CODES.OK,
				message: 'Successful logout from account'
			})
	}
}
