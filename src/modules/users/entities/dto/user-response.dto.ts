import { Exclude, Expose } from 'class-transformer'


@Exclude()
export class UserResponseDto {
	@Expose()
	email: string
	@Expose()
	username: string
	@Expose()
	pathToUserIcon: string
}
