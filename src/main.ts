import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { loadDefaultEnvConfig } from 'constants/config'
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
	loadDefaultEnvConfig()

	const frontendUrl = process.env.FRONTEND_URL

	if (!frontendUrl) {
		logger.error('FRONTEND_URL не установлен в переменных окружения')
		throw new Error('FRONTEND_URL не установлен в переменных окружения')
	}

	initSwagger(app)

	app.enableCors({
		origin: frontendUrl,
		credentials: true
	})
	app.setGlobalPrefix('api/v1')
	app.use(cookieParser())
	app.useGlobalPipes(new ValidationPipe({
		stopAtFirstError: true,
	}))

	logger.log('Приложение запущено на порту: ' + (process.env.PORT ?? 3000))
	await app.listen(process.env.PORT ?? 3000, '0.0.0.0')
}
bootstrap()
