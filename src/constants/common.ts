import { join } from 'path'
import { cwd } from 'process'
import { USERS_ROUTES } from './Routes'
import { pathToUploadsDir } from 'common/utils/WriteUserIcon'


export const pathToDefaultIconOnFS = join(cwd(), 'uploads', 'default', 'defaultIcon.jpeg')

/**
* Возвращает путь до директории пользователи как URL путь (например: http://example.com/api/v1/users/user-icon/{username})
 */
export const pathToDefaultIconWEB = (username: string) => `${USERS_ROUTES.PATH_TO_USER_AVATAR}/${username}`


/**
 * Возвращет путь до директории пользователя на Файловой Системе (cwd/uploads/{username}/avatars)
 */
export const pathToCurrentUserIcon = (username: string) => `${pathToUploadsDir}/${username}`
