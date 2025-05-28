import { HttpStatus } from '@nestjs/common'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'

export type TypeObservableValidateData =
	TSuccessAuthResponse | TFailedAuthResponse

export type TSuccessAuthResponse = {
	responseUser: UserResponseDto
	accessToken: string
}

export type TFailedAuthResponse = {
	message: string,
	status: HttpStatus
}
