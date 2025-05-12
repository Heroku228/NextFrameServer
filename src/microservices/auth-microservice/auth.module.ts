// import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
// import { ConfigModule, ConfigService } from '@nestjs/config'
// import { JwtModule } from '@nestjs/jwt'
// import { TypeOrmModule } from '@nestjs/typeorm'
// import { AuthMiddleware } from 'src/common/middleware/auth.middleware'
// import { User } from '../users-microservice/entities/user.entity'
// import { UsersService } from '../users-microservice/users.service'
// import { AuthController } from './auth.controller'
// import { AuthService } from './auth.service'
// import { JwtStrategy } from './jwt.strategy'

// @Module({
// 	imports: [
// 		TypeOrmModule.forFeature([User]),
// 		JwtModule.registerAsync({
// 			imports: [ConfigModule],
// 			inject: [ConfigService],
// 			useFactory: (config: ConfigService) => ({
// 				secret: config.get<string>('JWT_KEY'),
// 				signOptions: { expiresIn: '1d' },
// 			}),
// 		}),
// 	],
// 	controllers: [AuthController],
// 	providers: [AuthService, UsersService, JwtStrategy],
// 	exports: [AuthService, JwtModule],
// })
// export class AuthModule implements NestModule {
// 	configure(consumer: MiddlewareConsumer) {
// 		consumer.apply(AuthMiddleware).forRoutes('/users', '/auth')
// 	}
// }
