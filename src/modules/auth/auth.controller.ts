import { BadRequestException, Body, Controller, Get, Post, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { plainToInstance } from 'class-transformer'
import { Response } from 'express'
import { writeUserIcon } from 'src/common/utils/WriteUserIcon'
import { CurrentUser } from 'src/config/decorators/current-user.decorator'
import { JwtAuthGuard } from 'src/config/guards/JwtAuthGuard.guard'
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
		console.log(credentials)
		const result = await this.authService.validateUser(credentials.username, credentials.password)

		if (result === null) throw new UnauthorizedException()

		const { responseUser, token } = result

		res.cookie('jwt', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 24 * 60 * 60 * 1000
		})

		return responseUser
	}

	@Post('register')
	@UseInterceptors(FileInterceptor('icon'))
	async register(
		@UploadedFile() file: Express.Multer.File,
		@Body() payload: CreateUserDto,
		@Res({ passthrough: true }) res: Response
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

}
