import { Exclude, Expose } from 'class-transformer'
import { User } from 'src/modules/users/entities/user.entity'


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
	seller: User | string
}
