import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { DeleteProductsController } from './controllers/delete-products.controller'
import { ProductsController } from './controllers/products.controller'
import { PublicProductsController } from './controllers/public-products.controller'
import { UpdateProductsDataController } from './controllers/update-products-data.controller'
import { Product } from './entities/product.entity'
import { ProductsService } from './products.service'

@Module({
	imports: [TypeOrmModule.forFeature([Product, User])],
	controllers: [
		ProductsController,
		PublicProductsController,
		UpdateProductsDataController,
		DeleteProductsController
	],
	providers: [ProductsService, UsersService],
	exports: [ProductsService],
})
export class ProductsModule { }
