import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { initSwagger } from 'swagger/swagger'
import { AppModule } from './api-gateway/app.module'


async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: {
			origin: true,
			credentials: true,
		},
	})

	const logger = new Logger('MainApp')

	initSwagger(app)

	app.enableCors({
		origin: 'http://localhost:4200',
		credentials: true
	})
	app.setGlobalPrefix('api/v1')
	app.use(cookieParser())
	app.useGlobalPipes(new ValidationPipe({
		stopAtFirstError: true,
	}))

	logger.log('Main app is started on 3000 port')
	await app.listen(process.env.PORT ?? 3000, '0.0.0.0')
}
bootstrap()
