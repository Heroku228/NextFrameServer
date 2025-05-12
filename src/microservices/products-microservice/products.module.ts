import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PRODUCTS_MICROSERVICE_DATABASE_CONFIG } from './database.config'
import { Product } from './entities/product.entity'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync(PRODUCTS_MICROSERVICE_DATABASE_CONFIG),
		TypeOrmModule.forFeature([Product])
	],
	controllers: [ProductsController],
	providers: [ProductsService],
})
export class ProductsModule { }
