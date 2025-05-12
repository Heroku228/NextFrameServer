import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { AuthModule } from './auth.module'

async function bootstrap() {
	const port = 4003
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
		transport: Transport.TCP,
		options: {
			host: '127.0.0.1',
			port: port,
		},
	})

	console.log(`AUTH MICROSERVICE IS STARTED ON TCP PORT : ${port}`)

	await app.listen()
}
bootstrap()
