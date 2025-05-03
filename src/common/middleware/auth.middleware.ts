import { NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'

export class AuthMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: (error?: any) => void) {
		next()
	}
}
