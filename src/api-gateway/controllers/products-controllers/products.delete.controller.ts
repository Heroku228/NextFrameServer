import { BadRequestException, Controller, Delete, Param, Query, UseGuards } from '@nestjs/common'
import { UserDirectory } from 'common/decorators/user-directory.decorator'
import { JwtAuthGuard } from 'common/guards/JwtAuthGuard.guard'
import { existsSync } from 'fs'
import { rm } from 'fs/promises'
import { ProductsService } from 'microservices/products-microservice/products.service'
import { join } from 'path'

@Controller('products')
@UseGuards(JwtAuthGuard)
export class DeleteProductsController {
	constructor(private readonly productsService: ProductsService,) { }

	@Delete('delete-product/:productId')
	async deleteProductById(
		@Param('productId') productId: string,
		@UserDirectory() directory: string) {
		await this.productsService.deleteProductById(productId)

		const pathToProductDir = join(directory, 'products', productId)

		if (!existsSync(pathToProductDir))
			throw new BadRequestException()

		await rm(pathToProductDir, { force: true, recursive: true })

		return { message: 'Product is successfully deleted' }
	}

	@Delete('delete-product-image')
	async deleteImageFromProduct(
		@Query('productId') productId: string,
		@Query('filename') filename: string,
		@UserDirectory() directory: string,
	) {
		return await this.productsService.deleteImageFromProduct(productId, filename, directory)
	}
}
