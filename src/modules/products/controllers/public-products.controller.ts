import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { join } from 'path'
import { FILE_SYSTEM_ROUTES } from 'src/consts/Routes'
import { ResponseProductDto } from '../dto/response-product.dto'
import { ProductsService } from '../products.service'

@Controller('public/products')
export class PublicProductsController {
	constructor(private readonly productsService: ProductsService) { }

	@Get('all-products')
	async getAllProducts() {
		return (await this.productsService.findAll())
			.map(product => plainToInstance(ResponseProductDto, product))
	}

	// DONT USED
	@Get('all-user-products')
	async getProductImage(
		@Param('filename') filename: string,
		@Res() res: Response) {
		const product = await this.productsService.findProductImage(filename)
		console.log('FILE: ', product)
		if (!product) throw new NotFoundException('File not found')
		console.log('[0]: ', product.pathToProductIcons[0])

		const pathToProductIcon = product.pathToProductIcons[0].replace('http://localhost:3000/api/v1/public/products/product-image/', '')
		console.log('PATH TO PRODUCT ICON: ', pathToProductIcon)


		const fullPathToProductIcon = join(FILE_SYSTEM_ROUTES.PATH_TO_UPLOADS_DIR, pathToProductIcon)
		console.log('full path: ', fullPathToProductIcon)
		// return res.sendFile(product.pathToProductIcons[0])
	}
}
