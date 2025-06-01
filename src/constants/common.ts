import { join } from 'path'
import { cwd } from 'process'
import { USERS_ROUTES } from './Routes'


export const pathToDefaultIconOnFS = join(cwd(), 'uploads', 'default', 'defaultIcon.jpeg')
export const pathToDefaultIconWEB = (username: string) => `${USERS_ROUTES.PATH_TO_USER_AVATAR}/${username}` 
