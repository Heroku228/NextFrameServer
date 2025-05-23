import { Injectable, NestMiddleware } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { NextFunction, Request, Response } from 'express'


@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private readonly jwtService: JwtService) { }

	use(req: Request, res: Response, next: NextFunction) {
		const token = req.cookies?.jwt
		console.log('Token => ', token)

		if (!token) return next()

		try {
			const payload = this.jwtService.verify(token)
			req.user = payload
			console.log("request user -> ", req.user)
		} catch (err) {
			console.warn('Invalid JWT => ', err)
		}

		next()
	}
}
