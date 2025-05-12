import { ClientProxyFactory, Transport } from '@nestjs/microservices'


export const NEST_CLIENTS_MODULE = {}

export const AUTH_SERVICE = {
	provide: 'AUTH_SERVICE',
	useFactory: () => ClientProxyFactory.create(
		{
			transport: Transport.TCP,
			options: {
				port: 4003
			}
		}
	)
} as const

export const PRODUCTS_SERVICE = {
	provide: 'PRODUCTS_SERVICE',
	useFactory: () => ClientProxyFactory.create(
		{
			transport: Transport.TCP,
			options: {
				port: 4002
			}
		}
	)
} as const

export const USERS_SERVICE = {
	provide: 'USERS_SERVICE',
	useFactory: () => ClientProxyFactory.create(
		{
			transport: Transport.TCP,
			options: {
				port: 4001
			}
		}
	)
} as const

