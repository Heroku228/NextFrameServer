import { BadRequestException, Controller, Delete, Param, Query, UseGuards } from '@nestjs/common'
import { existsSync } from 'fs'
import { rm } from 'fs/promises'
import { join } from 'path'
import { UserDirectory } from 'src/common/decorators/user-directory.decorator'
import { JwtAuthGuard } from 'src/common/guards/JwtAuthGuard.guard'
import { UsersService } from 'src/modules/users/users.service'
import { ProductsService } from '../products.service'


@Controller('products')
@UseGuards(JwtAuthGuard)
export class DeleteProductsController {
	constructor(
		private readonly productsService: ProductsService,
		private readonly usersService: UsersService
	) { }

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

	@Delete('clear')
	async deleteAllProducts() {
		await this.usersService.clear()
		await this.productsService.clear()
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
