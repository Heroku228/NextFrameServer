import { Exclude, Expose } from 'class-transformer'


@Exclude()
export class UserResponseDto {
	@Expose()
	id: string
	@Expose()
	email: string
	@Expose()
	username: string
	@Expose()
	pathToUserIcon: string
	@Expose()
	roles: string[]
	@Expose()
	isSeller: boolean
}
