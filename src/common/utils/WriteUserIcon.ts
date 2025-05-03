import { randomUUID } from 'crypto'
import { existsSync, } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { homedir } from 'os'
import { extname, join } from 'path'

export const writeUserIcon = async (username: string,
	file: Express.Multer.File) => {
	const pathToUserDirectory = join(homedir(), 'next-frame', 'uploads', username)

	if (!existsSync(pathToUserDirectory

	))
		await mkdir(pathToUserDirectory), { recursive: true }

	const originalname = file.originalname
	const extension = extname(originalname)

	const fullPathToUserIcon = join(pathToUserDirectory, originalname.replace(extension, '') + randomUUID() + extension)

	await writeFile(
		fullPathToUserIcon,
		file.buffer
	)

	return fullPathToUserIcon
}
