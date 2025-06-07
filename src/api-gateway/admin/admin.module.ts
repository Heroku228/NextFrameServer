import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ClientsModule } from 'api-gateway/clients/clients.module'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { AdminController } from './admin.controller'


@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ClientsModule,
	],
	controllers: [AdminController],
	providers: [AppUsersService],
})

export class AdminModule { }
