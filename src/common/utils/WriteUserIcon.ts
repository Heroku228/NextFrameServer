import { USERS_ROUTES } from 'consts/Routes'
import { randomUUID } from 'crypto'
import { existsSync, } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { TransferredFile } from 'microservices/users-microservice/entities/dto/update-user.dto'
import { extname, join } from 'path'
import { cwd } from 'process'


export const pathToUploadsDir = join(cwd(), 'uploads')

export const writeUserIcon = async (username: string,
	file: Express.Multer.File | TransferredFile) => {
	const pathToUserAvatarsDir = join(pathToUploadsDir, username, 'avatars')
	const pathToUserOldAvatarsDir = join(pathToUploadsDir, username, 'oldAvatars')

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

	const actualBuffer = Buffer.isBuffer(file.buffer)
		? file.buffer
		: Buffer.from((file.buffer as any).data)

	await writeFile(
		fullPathToUserIcon,
		actualBuffer
	)

	return USERS_ROUTES.PATH_TO_USER_AVATAR
}
