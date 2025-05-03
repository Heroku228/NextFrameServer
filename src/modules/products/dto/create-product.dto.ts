import { User } from 'src/modules/users/entities/user.entity'

export class CreateProductDto {
	title: string
	description: string
	price: number
	images: Express.Multer.File[]
	seller: User | string
}
