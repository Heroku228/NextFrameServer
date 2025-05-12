import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ClientsModule } from './clients/clients.module'
import { UsersController } from './controllers/users.controller'
import { UsersService } from './services/users.service'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ClientsModule
	],
	controllers: [UsersController],
	providers: [UsersService]
})

export class AppModule { }
