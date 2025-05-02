import { SetMetadata } from '@nestjs/common'
import { ROLES } from 'src/consts/Roles'

export const Roles = (...roles: string[]) => SetMetadata(ROLES, roles)
