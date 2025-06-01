import { USERS_ROUTES } from 'constants/Routes'
import { randomUUID } from 'crypto'
import { existsSync, } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { TransferredFile } from 'microservices/users-microservice/entities/dto/update-user.dto'
import { extname, join } from 'path'
import { cwd } from 'process'

/**
 * Путь до директории 'uploads', которая содержит файлы пользователей
 */
export const pathToUploadsDir = join(cwd(), 'uploads')

/**
 * Записывает иконку пользователя в 'avatars' директорию, а так же перемещает старую аватарку в 'oldAvatars'
 * @param username - логин пользователя и часть пути к 'avatars' пользователя, file - иконка пользователя
 * @returns Вернет путь до текущей аватарки пользователя
 */
export const writeUserIcon = async (
	username: string,
	file: Express.Multer.File | TransferredFile
) => {
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


	const pathToUserAvatar = `${USERS_ROUTES.PATH_TO_USER_AVATAR}/${username}`

	return pathToUserAvatar
}
