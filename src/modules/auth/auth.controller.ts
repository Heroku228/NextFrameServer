import { BadRequestException, Body, Controller, Post, Req, Res, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { plainToInstance } from 'class-transformer'
import { Request, Response } from 'express'
import { writeUserIcon } from 'src/common/utils/WriteUserIcon'
import { API_STATUS, ApiResponse } from 'src/consts/ApiResponse'
import { HTTP_STATUS_CODES } from 'src/consts/Http-status'
import { CreateUserDto } from '../users/entities/dto/create-user.dto'
import { UserCredentials } from '../users/entities/dto/user-credentials.dto'
import { UserResponseDto } from '../users/entities/dto/user-response.dto'
import { User } from '../users/entities/user.entity'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('login')
	async login(
		@Body() credentials: UserCredentials,
		@Res({ passthrough: true }) res: Response
	) {
		const result = await this.authService.validate(credentials.username, credentials.password)

		if (result === null) throw new UnauthorizedException()

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
	}

	@Post('register')
	@UseInterceptors(FileInterceptor('icon'))
	async register(
		@Res({ passthrough: true }) res: Response,
		@UploadedFile() file: Express.Multer.File,
		@Body() payload: CreateUserDto,
	) {
		if (!file) {
			return new BadRequestException({
				access: false,
				message: '[Error] File (icon) is missing'
			})
		}

		const user = plainToInstance(User, payload)
		const pathToUserIcon = await writeUserIcon(user.username, file)
		user.pathToUserIcon = pathToUserIcon

		const { data, token } = await this.authService.register(user)

		res.cookie('jwt', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 24 * 60 * 60 * 1000
		})

		if (!data) throw new UnauthorizedException()

		return {
			createdUser: data,
			icon: {
				filename: file.originalname,
				pathToUserIcon: pathToUserIcon
			}
		}
	}


	@Post('logout')
	async logout(
		@Res() res: Response,
		@Req() req: Request
	) {
		if (!req.cookies['jwt']) res
			.status(HTTP_STATUS_CODES.UNAUTHORIZED)
			.json({ message: 'No active session' })

		res.clearCookie('jwt')

		res
			.status(200)
			.json({
				status: HTTP_STATUS_CODES.OK,
				message: 'Successful logout from account'
			})
	}
}
