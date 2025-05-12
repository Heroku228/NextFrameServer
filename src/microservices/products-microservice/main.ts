import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { ProductsModule } from './products.module'

async function bootstrap() {
	const port = 4002
	
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(ProductsModule, {
		transport: Transport.TCP,
		options: {
			host: '127.0.0.1',
			port: port,
		},
	})

	console.log(`PRODUCTS MICROSERVICE IS STARTED ON TCP PORT : ${port}`)

	await app.listen()
}

bootstrap()
