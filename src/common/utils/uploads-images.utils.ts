import { PRODUCTS_ROUTES } from 'consts/Routes'
import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { extname, join } from 'path'

const PARALLEL_WRITE_LIMIT = 8

export const uploadFile = async (directory: string,
	images: Express.Multer.File) => {
	const savedFile = await saveFile(images, directory)
	return `${PRODUCTS_ROUTES.PUBLIC_PRODUCT_IMAGE}/${savedFile}`
}

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

const saveFile = async (file: Express.Multer.File, directory: string) => {
	const filename = normalizeFilename(file)
	const filePath = join(directory, filename)

	await writeFile(filePath, file.buffer)
	return filename
}

const normalizeFilename = (file: Express.Multer.File) => {
	const extension = extname(file.originalname)
	const originalFileName = file.originalname.replace(extension, '')
	const safeName = originalFileName.replace(/[^\w\d-_]/g, '')
	return `${safeName}-${randomUUID().slice(0, 10)}${extension}`
}
