import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { UsersModule } from './users.module'

async function bootstrap() {
	const port = 4001
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(UsersModule, {
		transport: Transport.TCP,
		options: {
			host: '127.0.0.1',
			port: port,
		},
	})

	console.log(`USERS MICROSERVICE IS STARTED ON TCP PORT : ${port}`)

	await app.listen()
}
bootstrap()
