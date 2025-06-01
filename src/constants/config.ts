import * as dotenv from 'dotenv'
import { join } from 'path'
import { cwd } from 'process'


/**
 * Список файлов окружения
 * @description Файлы окружения для разных сред разработки
 * @example .env.production, .env.development
 * @type {Object}
 * @property {string} production - Файл окружения для продакшн среды
 * @property {string} development - Файл окружения для девелопмент среды
 * @see https://docs.nestjs.com/techniques/configuration#environment-variables
 */
export const ENV_FILES = {
	main: join(cwd(), '.env'),
	production: join(cwd(), '.env.production'),
	development: join(cwd(), '.env.development'),
} as const

/**
 * Загружает основной файл окружения
 * @returns {void}
 * @see https://docs.nestjs.com/techniques/configuration#environment-variables
 */
export const loadDefaultEnvConfig = () => {
	dotenv.config({ path: ENV_FILES.main })
}

/**
 * Загружает файл окружения в зависимости от переданного параметра
 * @param {keyof typeof ENV_FILES} env - Ключ из ENV_FILES для выбора файла окружения
 * @returns {void}
 * @see https://docs.nestjs.com/techniques/configuration#environment-variables
 */
export const loadEnvConfig = (env: keyof typeof ENV_FILES) => {
	dotenv.config({ path: ENV_FILES[env] })
} 
