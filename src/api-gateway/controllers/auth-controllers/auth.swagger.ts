
const checkAuthOperation = (isAuthenticated: boolean, description: string) => ({
	description: description,
	content: {
		'application/json': {
			schema: {
				type: 'object',
				properties: {
					isAuthenticated: {
						type: 'boolean',
						description: 'Статус авторизации пользователя'
					}
				},
				example: {
					isAuthenticated: isAuthenticated
				}
			}
		}
	}
})

const registerOperation = (description: string) => ({
	description: description,
	content: {
		'application/json': {
			schema: {
				type: 'object',
				properties: {
					createdUser: {
						type: 'object',
						description: 'Информация о созданном пользователе',
						example: {
							username: 'exampleUser',
							email: 'example@gmail.com',
							pathToUserIcon: '/path/to/icon.png',
							createdAt: '2023-10-01T00:00:00Z',
							updatedAt: '2023-10-01T00:00:00Z'
						}
					},
					token: {
						type: 'string',
						description: 'JWT токен для авторизации пользователя',
					}
				},
				example: {
					createdUser: {
						username: 'exampleUser',
						email: 'example@gmail.com',
						pathToUserIcon: '/path/to/icon.png',
						createdAt: '2023-10-01T00:00:00Z',
						updatedAt: '2023-10-01T00:00:00Z'
					},
					token: {
						type: 'string',
						description: 'JWT токен для авторизации пользователя',
						example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
					},
				}
			}
		}
	}
})


export const CHECK_AUTH_RESPONSE = {
	200: checkAuthOperation(true, 'Пользователь авторизован'),
	401: checkAuthOperation(false, 'Пользователь не авторизован'),
}

export const REGISTER_RESPONSE = {
	200: registerOperation('Пользователь успешно зарегистрирован'),
	400: {
		description: 'Ошибка валидации данных пользователя',
		content: {
			'application/json': {
				schema: {
					type: 'object',
					properties: {
						message: { type: 'string', example: 'Validation failed' },
						statusCode: { type: 'number', example: 400 },
						error: { type: 'string', example: 'Bad Request' }
					}
				}
			}
		}
	},
	409: {
		description: 'Пользователь с таким именем уже существует',
		content: {
			'application/json': {
				schema: {
					type: 'object',
					properties: {
						message: { type: 'string', example: 'User already exists' },
						statusCode: { type: 'number', example: 409 },
						error: { type: 'string', example: 'Conflict' },
					}
				}
			}
		}
	}
}

export const CHECK_AUTH_API_OPERATION = {
	summary: 'Проверяем стуатус авторизации',
	operationId: 'checkAuth',
	tags: ['Auth'],
	security: [{ bearerAuth: [] }],
	responses: CHECK_AUTH_RESPONSE,
	description: 'Проверяет авторизован ли пользователь и возвращает статус авторизованности.'
}


export const REGISTER_API_OPERATION = {
	summary: 'Регистрация нового пользователя',
	operationId: 'register',
	tags: ['Auth'],
	responses: CHECK_AUTH_RESPONSE,
	description: 'Регистрирует нового пользователя и возвращает информацию о нем.'
}
