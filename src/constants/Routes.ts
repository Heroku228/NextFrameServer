import { homedir } from 'os'
import { join } from 'path'


/**
 * Путь до API первой версии
 */
export const PATH_TO_API = 'http://localhost:3000/api/v1' as const


/**
 * Список путей для контроллеров продуктов
 */
export const PRODUCTS_ROUTES = {
	PUBLIC_PRODUCT_IMAGE: `http://localhost:3000/api/v1/public/products/product-image`,
} as const

/**
 * Список путей файловой системы сервера
 */
export const FILE_SYSTEM_ROUTES = {
	PATH_TO_UPLOADS_DIR: join(homedir(), 'next-frame', 'uploads'),
} as const

/**
 * Список путей для контроллеров Users
 */
export const USERS_ROUTES = {
	PATH_TO_USER_AVATAR: 'http://localhost:3000/api/v1/users/user-icon',
	PATH_TO_DEFAULT_ICON: 'http://localhost:3000/api/v1/users/default-icon',
	ME_ROUTE: 'http://localhost:3000/api/v1/users/me'
} as const

/**
 * Список путей для контроллеров авторизации
 */
export const AUTH_ROUTES = {

} as const


