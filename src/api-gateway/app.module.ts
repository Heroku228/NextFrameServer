import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ClientsModule } from './clients/clients.module'
import { UsersControllerModule } from './controllers/users-controllers/usersController.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ClientsModule,
		UsersControllerModule
	],
	controllers: [],
	providers: []
})

export class AppModule { }
