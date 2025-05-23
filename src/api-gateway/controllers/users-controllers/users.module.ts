import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ClientsModule } from 'api-gateway/clients/clients.module'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { JwtStrategy } from 'microservices/auth-microservice/jwt.strategy'
import { DeleteUsersController } from './users.delete.controller'
import { AppUsersController } from './users.get.controller'
import { PatchUserController } from './users.patch.controller'
import { PublicUsersController } from './users.public.controller'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ClientsModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>('JWT_KEY'),
				signOptions: { expiresIn: '1d' },
			}),
		}),
	],
	controllers: [
		PublicUsersController,
		AppUsersController,
		PatchUserController,
		DeleteUsersController
	],
	providers: [AppUsersService, JwtStrategy]
})

export class UsersModule { }
