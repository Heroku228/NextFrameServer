import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'
import { Product } from './entities/product.entity'

export const PRODUCTS_MICROSERVICE_DATABASE_CONFIG: TypeOrmModuleAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: async (configService: ConfigService) => ({
		type: 'postgres',
		host: configService.get<string>('PRODUCTS_POSTGRESQL_HOST'),
		port: configService.get<number>('PRODUCTS_POSTGRESQL_PORT'),
		username: configService.get<string>('PRODUCTS_POSTGRESQL_USERNAME'),
		password: configService.get<string>('PRODUCTS_POSTGRESQL_PASSWORD'),
		database: configService.get<string>('PRODUCTS_POSTGRESQL_DATABASE'),
		entities: [Product],
		synchronize: true
	})
}
