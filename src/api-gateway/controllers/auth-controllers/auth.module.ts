import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ClientsModule } from 'api-gateway/clients/clients.module'
import { AppAuthService } from 'api-gateway/services/app-auth.service'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { AuthLogoutController } from './auth-logout.controller'
import { AuthController } from './auth.controller'
import { CheckAuthController } from './check-auth.controller'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ClientsModule,
	],
	controllers: [AuthController, CheckAuthController, AuthLogoutController],
	providers: [AppAuthService, AppUsersService]
})

export class AuthModule { }
