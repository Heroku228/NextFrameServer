export interface ICurrentUser {
	sub: string,
	username: string,
	roles: string[]
	iat: number,
	exp: number,
}
