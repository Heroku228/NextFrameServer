import { Request } from 'express'
import { ICurrentUser } from './current-user.type'

/**
 * Рекомендуем к использованию. 
 * Представляет из себе расширенную версию классичего Request из Express
 */
export interface IRequest extends Request {
	newAccessToken: string,
	user: ICurrentUser,
	isSeller: boolean
}

