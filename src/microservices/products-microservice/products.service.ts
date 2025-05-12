import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { uploadFiles } from 'common/utils/uploads-images.utils'
import { FILE_SYSTEM_ROUTES, PRODUCTS_ROUTES } from 'consts/Routes'
import { existsSync } from 'fs'
import { readdir, rm } from 'fs/promises'
import { join } from 'path'
import { Like, Repository } from 'typeorm'
import { UserResponseDto } from '../users-microservice/entities/dto/user-response.dto'
import { CreateProductDto } from './dto/create-product.dto'
import { ResponseProductDto } from './dto/response-product.dto'
import { Product } from './entities/product.entity'

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>
	) { }

	async deleteProductById(productId: string) {
		await this.productRepository.delete(productId)
	}

	async findProductImage(filename: string) {
		return await this.productRepository.findOne({
			where: {
				pathToProductIcons: Like(`%${filename}%`)
			}
		})
	}

	async updateProductData(
		productId: string,
		description?: string,
		title?: string,
		price?: number
	) {
		const product = await this.productRepository.findOne({ where: { id: productId } })

		if (!product) throw new NotFoundException('Product not found')

		const updatePayload: Partial<typeof product> = {}

		if (description !== undefined) updatePayload.description = description
		if (title !== undefined) updatePayload.title = title
		if (price !== undefined) updatePayload.price = price

		if (Object.keys(updatePayload).length === 0)
			throw new BadRequestException('No fields provided for update')

		await this.productRepository.update(productId, updatePayload)

		return { message: 'Product updated successfully' }
	}

	async deleteImageFromProduct(
		productId: string, filename: string, directory: string
	) {
		const product = await this.productRepository.findOne({
			where: { id: productId }
		})

		if (!product) throw new NotFoundException('Product not found')

		const fullFilename = filename.startsWith('http')
			? filename
			: `http://localhost:3000/api/v1/public/products/product-image/${filename}`

		const updatedIcons = product.pathToProductIcons.filter(icon => icon !== fullFilename)


		const pathToFileOnFS = join(directory, 'products', productId, filename)
		console.log('path to file on fs: ', pathToFileOnFS)

		if (!existsSync(pathToFileOnFS)) throw new NotFoundException('File not found')

		await rm(pathToFileOnFS, { force: true, recursive: true })

		await this.productRepository.update(productId, {
			pathToProductIcons: updatedIcons
		})

		return updatedIcons
	}

	async pushNewImageToProduct(productId: string, newSavedFile: string) {
		const product = await this.productRepository.findOne({
			where: { id: productId }
		})

		if (!product) throw new NotFoundException('Product not found')

		const updatedIcons = [...(product.pathToProductIcons || []), newSavedFile]

		await this.productRepository.update(productId, {
			pathToProductIcons: updatedIcons
		})

		return updatedIcons
	}

	async hideProductById(productId: string) {
		return await this.productRepository.update(productId, { isHidden: true })
	}

	async findUserProducts(userId: string) {
		return await this.productRepository.find({
			where:
				{ sellerId: userId }
		})
	}

	async findAll() {
		return await this.productRepository.find()
	}

	async clear() {
		if (existsSync(FILE_SYSTEM_ROUTES.PATH_TO_UPLOADS_DIR))
			await rm(FILE_SYSTEM_ROUTES.PATH_TO_UPLOADS_DIR, { recursive: true, force: true })

		await this.productRepository.delete({})
	}

	async createProduct(
		createProductDto: CreateProductDto,
		directory: string,
		images: Express.Multer.File[],
		user: UserResponseDto
	) {
		const product = plainToInstance(Product, createProductDto)
		product.sellerId = user.id as string
		const savedProduct = await this.productRepository.save(product)
		console.log(savedProduct.id)
		const productImages = await uploadFiles(join(directory, 'products', savedProduct.id), images)

		console.log('Product images : ', productImages)

		if (productImages.length > 0)
			await this.productRepository.update(savedProduct.id, { pathToProductIcons: productImages })

		return plainToInstance(ResponseProductDto, savedProduct)
	}

	async findAllProductImages(username: string) {
		const pathToUserDir = join(FILE_SYSTEM_ROUTES.PATH_TO_UPLOADS_DIR, username)

		if (!existsSync(pathToUserDir))
			throw new NotFoundException('Not found product directory')

		const productsImages = await readdir(pathToUserDir)

		const productsUrls = productsImages.map(image =>
			join(PRODUCTS_ROUTES.PUBLIC_PRODUCT_IMAGE, image))

		return productsUrls
	}
}
