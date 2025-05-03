import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { existsSync } from 'fs'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { uploadFiles } from 'src/common/utils/uploads-images.utils'
import { LOCALE_DIR_ROUTES, WEB_DIR_ROUTES } from 'src/consts/DirRoutes'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { CreateProductDto } from './dto/create-product.dto'
import { ResponseProductDto } from './dto/response-product.dto'
import { Product } from './entities/product.entity'

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>
	) { }

	async createProduct(
		createProductDto: CreateProductDto,
		directory: string,
		images: Express.Multer.File[],
		userId: string,
	) {
		const product = plainToInstance(Product, createProductDto)
		await uploadFiles(join(directory, 'products-images'), images)

		const productImages = await readdir(join(directory, 'products-images'))

		product.seller = { id: userId } as User
		product.pathToProductIcons = productImages


		await this.productRepository.save(product)
		return plainToInstance(ResponseProductDto, product)
	}

	async findAllProductImages(username: string) {
		if (!existsSync(LOCALE_DIR_ROUTES.userProductsDir(username)))
			throw new NotFoundException('Not found product directory')

		const productsImages = await readdir(LOCALE_DIR_ROUTES.userProductsDir(username))

		const productsUrls = productsImages.map(image => WEB_DIR_ROUTES.userProductsDir(username).concat(`/${image}`))

		return productsUrls
	}
}
