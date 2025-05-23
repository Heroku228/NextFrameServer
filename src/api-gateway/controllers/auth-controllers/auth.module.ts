import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ClientsModule } from 'api-gateway/clients/clients.module'
import { AppAuthService } from 'api-gateway/services/app-auth.service'
import { AuthController } from './auth.controller'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ClientsModule,
	],
	controllers: [AuthController],
	providers: [AppAuthService]
})

export class AuthModule { }
