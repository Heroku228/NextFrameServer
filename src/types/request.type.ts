import { Request } from 'express'


export interface IRequest extends Request {
	newAccessToken: string
}

