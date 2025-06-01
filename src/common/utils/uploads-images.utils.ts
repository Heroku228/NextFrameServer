import { loadEnvConfig } from 'constants/config'
import { PRODUCTS_ROUTES } from 'constants/Routes'
import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { extname, join } from 'path'

const isProduction = process.env.NODE_ENV === 'production'
loadEnvConfig(isProduction ? 'production' : 'development')

/**
 * Берем из .env-variables значение для параллельной загрузки,
 * если значение пустое, то инициализуется как 8
 */
const PARALLEL_WRITE_LIMIT = Number(process.env.PARALLEL_WRITE_LIMIT) || 8

/** 
 * Загружает один файл в директорию
 * @returns Вернет URL ввида: http://localhost:3000/api/v1/public/products/product-image/{нормализованное имя файла}
 */
export const uploadFile = async (directory: string,
	image: Express.Multer.File) => {
	const savedFile = await saveFile(image, directory)
	return `${PRODUCTS_ROUTES.PUBLIC_PRODUCT_IMAGE}/${savedFile}`
}

/** 
 * Параллельно загружает загружает файлы в директорию
 * @param Принимает директорию и файлы типа Express.Multer.File
 * @returns Вернет массив строк, которые содержат в себе URL путь до файлов
 */
export const uploadFiles = async (
	directory: string,
	images: Express.Multer.File[]
) => {
	if (!images || !directory) return []

	if (!existsSync(directory))
		await mkdir(directory, { recursive: true })

	if (images.length < PARALLEL_WRITE_LIMIT) {
		const saveTasks = images.map(async file => await saveFile(file, directory))
		console.log('saveTasks: ', saveTasks)
		const tasks = await Promise.all(saveTasks)
		return tasks.map(task => `${PRODUCTS_ROUTES.PUBLIC_PRODUCT_IMAGE}/${task}`)
	}

	const savedFileOnFS: string[] = []

	for (const file of images) {
		const path = await saveFile(file, directory)
		savedFileOnFS.push(path)
		return savedFileOnFS
	}

	return savedFileOnFS.map(file => `${PRODUCTS_ROUTES.PUBLIC_PRODUCT_IMAGE}/${file}`)
}


/**
 * Сохраняет файл в указанную директорию и вернет нормальзованное (normalizeFilename) имя файла
 * @param принимает Express.Multer.File и директорию
 * @returns Возвращает новое имя файла
 */
const saveFile = async (file: Express.Multer.File, directory: string) => {
	const filename = normalizeFilename(file)
	const filePath = join(directory, filename)

	await writeFile(filePath, file.buffer)

	return filename
}

/**
 * Сгенерирует случайное имя для файла
 * @param принимает Express.Multer.File
 * @returns Возвращает новое имя файла
 */
const normalizeFilename = (file: Express.Multer.File) => {
	const extension = extname(file.originalname)

	const originalFileName = file.originalname.replace(extension, '')
	const safeName = originalFileName.replace(/[^\w\d-_]/g, '')

	return `${safeName}-${randomUUID().slice(0, 10)}${extension}`
}
