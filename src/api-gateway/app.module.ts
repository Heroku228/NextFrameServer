import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AuthMiddleware } from './controllers/auth-controllers/auth.middleware'
import { AuthModule } from './controllers/auth-controllers/auth.module'
import { UsersModule } from './controllers/users-controllers/users.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		UsersModule,
		AuthModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>('JWT_KEY'),
				signOptions: { expiresIn: '1d' },
			}),
		}),
	],
	controllers: [],
	providers: []
})

export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(AuthMiddleware)
			.forRoutes({ path: '*', method: RequestMethod.ALL })
	}
}
