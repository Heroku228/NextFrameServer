import { BadRequestException, Body, ConflictException, Controller, NotFoundException, Post, Req, Res, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AppAuthService } from 'api-gateway/services/app-auth.service'
import { simplifyDuplicateKeyMessage } from 'api-gateway/services/app-global.service'
import { plainToInstance } from 'class-transformer'
import { JwtCookieInterceptor } from 'common/interceptors/JwtCookieInterceptor.interceptor'
import { writeUserIcon } from 'common/utils/WriteUserIcon'
import { API_STATUS, ApiResponse } from 'consts/ApiResponse'
import { HTTP_STATUS_CODES } from 'consts/Http-status'
import { Request, Response } from 'express'
import { CreateUserDto } from 'microservices/users-microservice/entities/dto/create-user.dto'
import { UserCredentials } from 'microservices/users-microservice/entities/dto/user-credentials.dto'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { User } from 'microservices/users-microservice/entities/user.entity'
import { catchError, firstValueFrom, throwError } from 'rxjs'
import { IRequest } from 'types/request.type'

type TRegistrationFailedResponse = {
	response: {
		message: string
		statusCode: number
	}
	status: number
	options: {
		response: {
			message: string,
			error: string,
			statusCode: number
		}
		status: number,
		options: Object,
		message: string,
		name: string
	},
	message: string
	name: string
}


@Controller('auth')
@UseInterceptors(JwtCookieInterceptor)
export class AuthController {
	constructor(private readonly authService: AppAuthService) { }

	@Post('register')
	@UseInterceptors(FileInterceptor('icon'))
	async register(
		@UploadedFile() file: Express.Multer.File,
		@Req() req: IRequest,
		@Body() payload: CreateUserDto,
	) {
		if (req.cookies['jwt']) {
			throw new BadRequestException('The user is already authorized')
		}

		if (!file)
			throw new BadRequestException({
				access: false,
				message: '[Error] File (icon) is missing'
			})

		const user = plainToInstance(User, payload)
		const pathToUserIcon = await writeUserIcon(user.username, file)
		user.pathToUserIcon = pathToUserIcon

		try {
			const { createdUser, token } = await firstValueFrom(this.authService.register(user))
			req.newAccessToken = token

			if (!createdUser) throw new UnauthorizedException()

			return {
				createdUser: plainToInstance(UserResponseDto, createdUser),
				icon: {
					filename: file.originalname,
					pathToUserIcon: pathToUserIcon
				}
			}
		} catch (err) {
			const error = err as TRegistrationFailedResponse

			const response = error.options.response
			const newResponseMessage = simplifyDuplicateKeyMessage(response.message) as string
			response.message = newResponseMessage

			throw new ConflictException(response)
		}
	}

	@Post('login')
	async login(
		@Body() credentials: UserCredentials,
		@Req() req: IRequest,
	) {
		if (req.cookies['jwt'])
			throw new BadRequestException('The user is already authorized')

		const { username, password } = credentials

		const result = await firstValueFrom(
			this.authService.validate(username, password)
				.pipe(catchError(() => throwError(() => new NotFoundException('User not found')))
				)
		)

		if (!result) {
			throw new NotFoundException('User not found')
		}

		const { responseUser, accessToken } = result

		req.newAccessToken = accessToken
		req.isSeller = responseUser.isSeller

		const response: ApiResponse<UserResponseDto> = {
			status: API_STATUS.SUCCESS,
			statusCode: HTTP_STATUS_CODES.OK,
			data: responseUser
		}

		return response
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
