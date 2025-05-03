import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { extname, join } from 'path'

const PARALLEL_WRITE_LIMIT = 8

export const uploadFiles = async (directory: string, images: Express.Multer.File[]) => {
	if (!images || !directory) return []

	if (!existsSync(directory))
		await mkdir(directory, { recursive: true })

	const saveTasks = images.map(async file => await saveFile(file, directory))

	if (images.length < PARALLEL_WRITE_LIMIT)
		return await Promise.all(saveTasks)

	for (const file of images) {
		await saveFile(file, directory)
	}

}

const saveFile = async (file: Express.Multer.File, directory: string) => {
	const filename = normalizeFilename(file)
	const filePath = join(directory, filename)

	await writeFile(filePath, file.buffer)
	return filePath
}

const normalizeFilename = (file: Express.Multer.File) => {
	const extension = extname(file.originalname)
	const originalFileName = file.originalname.replace(extension, '')
	const safeName = originalFileName.replace(/[^\w\d-_]/g, '')
	return `${safeName}-${randomUUID().slice(0, 10)}${extension}`
}
