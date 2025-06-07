import { Controller, Post, Req, Res, UseInterceptors } from '@nestjs/common'
import {  ClearCookiesInterceptor } from 'common/interceptors/ClearCookies.interceptor'
import { HTTP_STATUS_CODES } from 'constants/Http-status'
import { Response } from 'express'
import { IRequest } from 'types/request.type'


@Controller('auth')
@UseInterceptors(ClearCookiesInterceptor)
export class AuthLogoutController {

	@Post('logout')
	async logout(
		@Res({ passthrough: true }) res: Response,
		@Req() req: IRequest
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
