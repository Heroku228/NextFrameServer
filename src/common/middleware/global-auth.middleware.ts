import { Injectable, NestMiddleware } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { NextFunction, Response } from 'express'
import { IRequest } from 'types/request.type'

/**
 * Забирает из Request jwt токен и проверяет на валидность
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private readonly jwtService: JwtService) { }

	use(req: IRequest, res: Response, next: NextFunction) {
		const token: string = req.cookies?.jwt
		console.log('JWT token from cookies => ', token)

		if (!token) return next()

		try {
			const payload = this.jwtService.verify(token)
			req.user = payload
			console.log('JWT payload => ', payload)
		} catch (err) {
			console.warn('Invalid JWT => ', err)
		}

		next()
	}
}
