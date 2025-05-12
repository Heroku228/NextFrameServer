import { Body, Injectable } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { CreateProductDto } from './dto/create-product.dto'

@Injectable()
export class ProductsController {
	@MessagePattern({ cmd: 'say-hello' })
	async sayHello() {
		console.log('hello')
	}

	@MessagePattern({ cmd: 'create-product' })
	async createProduct(@Body() createProductDto: CreateProductDto) { }

	@MessagePattern({ cmd: 'user-products' })
	async findUserProducts() { }
}
