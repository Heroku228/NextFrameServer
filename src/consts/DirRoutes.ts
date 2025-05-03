import { homedir } from 'os'

const defaultHttpPath = 'http://localhost:3000/api/v1'

export const WEB_DIR_ROUTES = {
	uploadsDir: `${defaultHttpPath}/uploads`,
	userDir: (username: string) => `${defaultHttpPath}/${username}`,
	userProductsDir: (username: string) => `${defaultHttpPath}/${username}/products-images`
}

const defaultLocalePath = `${homedir(), 'next-frame', 'uploads'}`
export const LOCALE_DIR_ROUTES = {
	userDir: (username: string) => `${defaultLocalePath}/${username}`,
	userProductsDir: (username: string) => `${defaultLocalePath}/${username}/products-images`,
}
