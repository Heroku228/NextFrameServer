import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './modules/auth/auth.module'
import { User } from './modules/users/entities/user.entity'
import { UsersModule } from './modules/users/users.module'


@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get<string>('POSTGRESQL_HOST'),
				port: configService.get<number>('POSTGRESQL_PORT'),
				username: configService.get<string>('POSTGRESQL_USERNAME'),
				password: configService.get<string>('POSTGRESQL_PASSWORD'),
				database: configService.get<string>('POSTGRESQL_DATABASE'),
				entities: [User],
				synchronize: true
			})
		}),
		UsersModule, AuthModule],
	controllers: [],
	providers: [],
})



export class AppModule { }
