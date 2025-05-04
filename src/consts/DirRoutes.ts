import { homedir } from 'os'

export const defaultHttpPath = 'http://localhost:3000/api/v1'

export const WEB_DIR_ROUTES = {
	uploadsDir: `${defaultHttpPath}/uploads`,
	userDir: (username: string) => `${defaultHttpPath}/${username}`,
	productImage: (filename: string) => `${defaultHttpPath}/products/product-image/${filename}`,
}

export const pathToUploadsDirectory = `${homedir(), 'next-frame', 'uploads'}`
export const LOCALE_DIR_ROUTES = {
	userDir: (username: string) => `${pathToUploadsDirectory}/${username}`,
	userProductsDir: (username: string) => `${pathToUploadsDirectory}/${username}/products-images`,
}

export const webPathToUserIcon = (filename: string) => `http://localhost:3000/api/v1/users/user-icon/${filename}`
