import { randomUUID } from 'crypto'
import { existsSync, } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { homedir } from 'os'
import { extname, join } from 'path'
import { webPathToUserIcon } from 'src/consts/DirRoutes'

export const writeUserIcon = async (username: string,
	file: Express.Multer.File) => {
	const pathToUserAvatarsDir = join(homedir(), 'next-frame', 'uploads', username, 'avatars')
	const pathToUserOldAvatarsDir = join(homedir(), 'next-frame', 'uploads', username, 'oldAvatars')

	if (!existsSync(pathToUserAvatarsDir)) {
		await mkdir(pathToUserAvatarsDir, { recursive: true })
		await mkdir(pathToUserOldAvatarsDir, { recursive: true })
	}

	const originalname = file.originalname
	const extension = extname(originalname)
	const newFilename = originalname.replace(extension, '')
		+ randomUUID()
		+ extension

	const fullPathToUserIcon = join(
		pathToUserAvatarsDir,
		newFilename
	)

	await writeFile(
		fullPathToUserIcon,
		file.buffer
	)

	return webPathToUserIcon(newFilename)
}
