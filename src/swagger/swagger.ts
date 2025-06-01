import { INestApplication, Logger } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { loadDefaultEnvConfig, loadEnvConfig } from 'constants/config'


loadDefaultEnvConfig()

const isProduction = process.env.NODE_ENV === 'production'
loadEnvConfig(isProduction ? 'production' : 'development')

/**
 * Инициализация Swagger для документации API
 * @description Эта функция настраивает Swagger для документации API в приложении NestJS.
 * Она создает документацию на основе настроек, указанных в DocumentBuilder, и подключает ее к приложению.
 * Swagger будет доступен по адресу /api-docs, если приложение не запущено в продакшн режиме.
 * БУДЕТ ДОСТУПЕН ТОЛЬКО В РЕЖИМЕ 'development'.	
 * @param app INestApplication - NestJS application instance
 */
export const initSwagger = (app: INestApplication<unknown>) => {
	const logger = new Logger('Swagger')
	logger.log('Инициализация Swagger...')
	logger.log('Режим: ', process.env.NODE_ENV)

	if (!isProduction) {
		logger.log('Swagger is enabled')

		const config = new DocumentBuilder()
			.setTitle('NestJS API Gateway')
			.setDescription('API Gateway for the NestJS application')
			.setVersion('1.0')
			.addServer('api/v1')
			.addBearerAuth()
			.build()

		const document = SwaggerModule.createDocument(app, config)
		SwaggerModule.setup('api-docs', app, document)
	} else {
		logger.log('Swagger отключен в режиме production')
	}
}

