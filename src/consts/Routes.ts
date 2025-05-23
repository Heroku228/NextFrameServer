import { homedir } from 'os'
import { join } from 'path'

export const PATH_TO_API = 'http://localhost:3000/api/v1' as const

export const PRODUCTS_ROUTES = {
	PUBLIC_PRODUCT_IMAGE: `http://localhost:3000/api/v1/public/products/product-image`,
} as const

export const FILE_SYSTEM_ROUTES = {
	PATH_TO_UPLOADS_DIR: join(homedir(), 'next-frame', 'uploads'),
} as const

export const USERS_ROUTES = {
	PATH_TO_USER_AVATAR: 'http://localhost:3000/api/v1/users/user-icon',
	ME_ROUTE: 'http://localhost:3000/api/v1/users/me'
} as const

export const AUTH_ROUTES = {

} as const

