export const ROLES = {
	user: 'user',
	admin: 'admin'
} as const

export type TRoles = (typeof ROLES)[keyof typeof ROLES]
