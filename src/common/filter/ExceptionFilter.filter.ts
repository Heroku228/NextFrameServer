import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { throwError } from 'rxjs'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name)

	catch(exception: any, host: ArgumentsHost) {
		const contextType = host.getType()

		if (contextType === 'http') {
			const ctx = host.switchToHttp()
			const res = ctx.getResponse()
			const req = ctx.getRequest()

			const status =
				exception instanceof HttpException
					? exception.getResponse()
					: (exception as any)?.message || 'Internal server error'

			const message = exception instanceof HttpException
				? exception.getResponse()
				: (exception as any)?.message || 'Internal server error'

			this.logger.error(
				`HTTP ${status} [ERROR] ${JSON.stringify(menubar)} | URL: ${req.url}
				| Method: ${req.method}
				`,
				exception instanceof Error ? exception.stack : ''
			)

			res.status(status).json({
				statusCode: status,
				timestamp: new Date().toISOString(),
				path: req.url,
				error: message
			})
		} else if (contextType === 'rpc') {
			const ctx = host.switchToRpc()
			const data = ctx.getData()

			const message =
				exception instanceof HttpException
					? exception.message
					: (exception as any)?.message || 'Internal server error'

			this.logger.error(
				`WS ERROR: ${message} | Data: ${JSON.stringify(data``)}`,
				exception instanceof Error ? exception.stack : ''
			)

			return throwError(() => new RpcException(message))
		}
	}
}
