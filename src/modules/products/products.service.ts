import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { existsSync } from 'fs'
import { readdir, rm } from 'fs/promises'
import { join } from 'path'
import { uploadFiles } from 'src/common/utils/uploads-images.utils'
import { LOCALE_DIR_ROUTES, pathToUploadsDirectory, WEB_DIR_ROUTES } from 'src/consts/DirRoutes'
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

	async findAll() {
		return await this.productRepository.find()
	}

	async clear() {
		if (existsSync(pathToUploadsDirectory))
			await rm(pathToUploadsDirectory, { recursive: true, force: true })

		await this.productRepository.delete({})
	}

	async createProduct(
		createProductDto: CreateProductDto,
		directory: string,
		images: Express.Multer.File[],
		userId: string,
	) {
		const product = plainToInstance(Product, createProductDto)
		product.seller = { id: userId } as User

		try {
			const savedProduct = await this.productRepository.save(product)
			const productImages = await uploadFiles(join(directory, savedProduct.id, 'products-images'), images)

			if (productImages.length > 0)
				await this.productRepository.update(savedProduct.id, { pathToProductIcons: productImages })

			return plainToInstance(ResponseProductDto, savedProduct)
		}
		catch (err) {
			if (product.id) await this.productRepository.delete(product.id)
			throw new InternalServerErrorException('Faild to create product')
		}
	}

	async findAllProductImages(username: string) {
		if (!existsSync(LOCALE_DIR_ROUTES.userProductsDir(username)))
			throw new NotFoundException('Not found product directory')

		const productsImages = await readdir(LOCALE_DIR_ROUTES.userProductsDir(username))

		const productsUrls = productsImages.map(image => WEB_DIR_ROUTES.productImage(image))

		return productsUrls
	}
}
