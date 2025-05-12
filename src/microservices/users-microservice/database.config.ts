import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'
import { User } from './entities/user.entity'

export const USERS_MICROSERVICE_DATABASE_CONFIG: TypeOrmModuleAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: async (configService: ConfigService) => ({
		type: 'postgres',
		host: configService.get<string>('USERS_POSTGRESQL_HOST'),
		port: configService.get<number>('USERS_POSTGRESQL_PORT'),
		username: configService.get<string>('USERS_POSTGRESQL_USERNAME'),
		password: configService.get<string>('USERS_POSTGRESQL_PASSWORD'),
		database: configService.get<string>('USERS_POSTGRESQL_DATABASE'),
		entities: [User],
		synchronize: true
	})
}
