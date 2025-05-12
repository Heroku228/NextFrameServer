import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ClientsModule } from 'api-gateway/clients/clients.module'
import { USERS_MICROSERVICE_DATABASE_CONFIG } from './database.config'
import { User } from './entities/user.entity'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync(USERS_MICROSERVICE_DATABASE_CONFIG),
		TypeOrmModule.forFeature([User]),
		ClientsModule
	],
	controllers: [UsersController],
	providers: [UsersService],
})

export class UsersModule { }
