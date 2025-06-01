import { BadRequestException, Body, ConflictException, Controller, Logger, NotFoundException, Post, Req, Res, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBadRequestResponse, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AppAuthService } from 'api-gateway/services/app-auth.service'
import { simplifyDuplicateKeyMessage } from 'api-gateway/services/app-global.service'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { JwtCookieInterceptor } from 'common/interceptors/JwtCookieInterceptor.interceptor'
import { PreventAuthorizedInterceptor } from 'common/interceptors/PreventAuthorizedInterceptor'
import { FileRequiredPipe } from 'common/pipe/file-required.pipe'
import { RegisterPipe } from 'common/pipe/register.pipe'
import { writeUserIcon } from 'common/utils/WriteUserIcon'
import { API_STATUS, ApiResponse as IApiResponse } from 'constants/ApiResponse'
import { HTTP_STATUS_CODES } from 'constants/Http-status'
import { Request, Response } from 'express'
import { CreateUserDto } from 'microservices/users-microservice/entities/dto/create-user.dto'
import { UserCredentials } from 'microservices/users-microservice/entities/dto/user-credentials.dto'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
import { User } from 'microservices/users-microservice/entities/user.entity'
import { catchError, firstValueFrom, throwError } from 'rxjs'
import { ICurrentUser } from 'types/current-user.type'
import { IRequest } from 'types/request.type'
import { REGISTER_API_OPERATION } from './auth.swagger'

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
@UseInterceptors(PreventAuthorizedInterceptor, JwtCookieInterceptor)
@ApiTags('auth')
export class AuthController {
	constructor(private readonly authService: AppAuthService) { }

	private logger = new Logger(AuthController.name)

	/**
	 * Регистрация нового пользователя
	 * @param file - Файл иконки пользователя
	 * @param payload - Данные пользователя для регистрации
	 * @param req - Запрос, содержащий информацию о новом токене доступа
	 * @returns Объект с информацией о созданном пользователе и пути к иконке
	 */
	@ApiOperation(REGISTER_API_OPERATION)
	@ApiOkResponse({ description: 'Пользователь успешно зарегистрирован', type: UserResponseDto })
	@ApiBadRequestResponse({ description: 'Некорректные данные пользователя' })
	@Post('register')
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('icon'))
	async register(
		@Body(RegisterPipe) payload: CreateUserDto,
		@UploadedFile(FileRequiredPipe) file: Express.Multer.File,
		@Req() req: IRequest,
	) {
		const user = plainToInstance(User, payload)
		this.logger.debug('Register контроллер - данные из запроса: ', payload)
		this.logger.debug('Register контроллер - файл иконки пользователя: ', file)

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
		@CurrentUser() user: ICurrentUser,
		@Req() req: IRequest,
	) {
		if (user) throw new BadRequestException('User is already authenticated')

		const { username, password } = credentials

		const result = await firstValueFrom(
			this.authService.validate(username, password)
				.pipe(catchError(() => throwError(() => new NotFoundException('User not found')))
				)
		)

		if (!result) throw new NotFoundException('User not found')

		if ('status' in result) throw new UnauthorizedException(result)


		const { responseUser, accessToken } = result

		req.newAccessToken = accessToken
		req.isSeller = responseUser.isSeller

		const response: IApiResponse<UserResponseDto> = {
			status: API_STATUS.SUCCESS,
			statusCode: HTTP_STATUS_CODES.OK,
			data: responseUser
		}

		return response
	}

	@Post('logout')
	async logout(
		@Res({ passthrough: true }) res: Response,
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
