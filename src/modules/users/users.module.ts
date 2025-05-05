import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { AuthService } from '../auth/auth.service'
import { Product } from '../products/entities/product.entity'
import { DeleteUsersController } from './controllers/users-delete.controller'
import { PatchUserController } from './controllers/users-patch.controller'
import { UsersController } from './controllers/users.controller'
import { User } from './entities/user.entity'
import { PublicUsersController } from './public-users.controller'
import { UsersService } from './users.service'
import { ProductsModule } from '../products/products.module'

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Product]),
		AuthModule,
		ProductsModule
	],
	controllers: [
		UsersController,
		PublicUsersController,
		DeleteUsersController,
		PatchUserController],
	providers: [AuthService, UsersService],
})

export class UsersModule { }
