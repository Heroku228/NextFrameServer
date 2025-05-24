import { Request } from 'express'
import { User } from 'microservices/users-microservice/entities/user.entity'


export interface IRequest extends Request {
	newAccessToken: string,
	user: User,
	isSeller: boolean
}

