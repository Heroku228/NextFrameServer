import { Module } from '@nestjs/common'
import { AUTH_SERVICE, PRODUCTS_SERVICE, USERS_SERVICE } from './microservices.clients'

@Module({
	providers: [AUTH_SERVICE, PRODUCTS_SERVICE, USERS_SERVICE],
	exports: [AUTH_SERVICE, PRODUCTS_SERVICE, USERS_SERVICE],
})
export class ClientsModule { }
