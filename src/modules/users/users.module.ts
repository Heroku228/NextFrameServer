import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from '../products/entities/product.entity'
import { ProductsService } from '../products/products.service'
import { User } from './entities/user.entity'
import { PublicUsersController } from './public-users.controller'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
	imports: [TypeOrmModule.forFeature([User, Product])],
	controllers: [UsersController, PublicUsersController],
	providers: [UsersService, ProductsService],
})

export class UsersModule { }
