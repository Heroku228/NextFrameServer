import { Controller, Get } from '@nestjs/common'
import { ProductsService } from './products.service'

@Controller('public/products')
export class PublicProductsController {
	constructor(private readonly productsService: ProductsService) { }
	
	@Get('all-products')
	async getAllProducts() {
		return await this.productsService.findAll()
	}
}
