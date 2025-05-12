import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ClientsModule } from 'api-gateway/clients/clients.module'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { DeleteUsersController } from './users.delete.controller'
import { AppUsersController } from './users.get.controller'
import { PatchUserController } from './users.patch.controller'
import { PublicUsersController } from './users.public.controller'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ClientsModule
	],
	controllers: [
		PublicUsersController,
		AppUsersController,
		PatchUserController,
		DeleteUsersController
	],
	providers: [AppUsersService]
})

export class UsersControllerModule { }
