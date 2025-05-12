import { Exclude, Expose } from 'class-transformer'
import { User } from 'microservices/users-microservice/entities/user.entity'


@Exclude()
export class ResponseProductDto {
	@Expose()
	title: string
	@Expose()
	description: string
	@Expose()
	price: number
	@Expose()
	pathToProductIcons: string[]
	@Expose()
	seller: User
}
