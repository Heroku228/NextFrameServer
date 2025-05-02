import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
	console.log('KEY: ',  String(process.env.JWT_KEY))
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api/v1')
	app.use(cookieParser())
	app.useGlobalPipes(new ValidationPipe({
		stopAtFirstError: true,
	}))
	await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
