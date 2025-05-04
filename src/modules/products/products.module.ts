import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from './entities/product.entity'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { PublicProductsController } from './public-products.controller'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'

@Module({
	imports: [TypeOrmModule.forFeature([Product, User])],
	controllers: [ProductsController, PublicProductsController],
	providers: [ProductsService, UsersService],
})
export class ProductsModule { }
