import { ConflictException, Logger } from '@nestjs/common'
import { pathToCurrentUserIcon } from 'constants/common'
import { rm, stat } from 'fs/promises'

const FILE_SYSTEM_ERRORS = {
	DELETE_DIR_ERROR: 'Не удалось удалить директорию'
}

export const deleteUserDirectory = async (username: string) => {
	const logger = new Logger(deleteUserDirectory.name)

	try {
		const pathToUserDir = pathToCurrentUserIcon(username)
		const isDirExists = await stat(pathToUserDir)

		if (!isDirExists) return

		await rm(pathToUserDir, { recursive: true, force: true })
	} catch (err) {
		logger.error(`[ERROR] ${FILE_SYSTEM_ERRORS.DELETE_DIR_ERROR} `, err)
		throw new ConflictException(FILE_SYSTEM_ERRORS.DELETE_DIR_ERROR)
	}
}
