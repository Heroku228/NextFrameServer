import { Injectable, NestMiddleware } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { NextFunction, Response } from 'express'
import { IRequest } from 'types/request.type'


@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private readonly jwtService: JwtService) { }

	use(req: IRequest, res: Response, next: NextFunction) {
		const token: string = req.cookies?.jwt

		if (!token) return next()

		try {
			const payload = this.jwtService.verify(token)
			req.user = payload
		} catch (err) {
			console.warn('Invalid JWT => ', err)
		}

		next()
	}
}
