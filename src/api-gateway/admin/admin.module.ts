import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { IRequest } from 'types/request.type'


@Injectable()
export class AdminModule implements NestMiddleware {
	use(req: IRequest, res: Response, next: NextFunction) {
		console.log('AdminModule middleware called')
		console.log('req => ', req)
		// if (req.user?.role !== 'admin') {}
	}
}
