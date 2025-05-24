import { ConflictException, Controller, Delete, ForbiddenException, InternalServerErrorException, Req, Res, UseGuards } from '@nestjs/common'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { Roles } from 'common/decorators/Roles.decorator'
import { UserDirectory } from 'common/decorators/user-directory.decorator'
import { CookieUserGuard } from 'common/guards/cookie-user.guard'
import { RolesGuard } from 'common/guards/RolesGuard.guard'
import { Response } from 'express'
import { rm } from 'fs/promises'
import { join } from 'path'
import { cwd } from 'process'
import { catchError, firstValueFrom, throwError } from 'rxjs'
import { UserRequest } from 'types/current-user.type'
import { IRequest } from 'types/request.type'

@Controller('users')
@UseGuards(CookieUserGuard)
export class DeleteUsersController {
	constructor(private readonly usersService: AppUsersService) { }

	@Delete('clear-all-cookies')
	clearAllCookies(
		@Res() res: Response,
		@Req() req: IRequest) {

		for (const cookie in req.cookies) {
			console.log(cookie)
			res.clearCookie(cookie)
		}

		res.send('clear')
		return
	}

	@Delete('delete-account')
	@Roles('admin')
	@UseGuards(RolesGuard)
	async deleteUserAccount(
		@CurrentUser() user: UserRequest.ICurrentUser,
		@UserDirectory() directory: string,
		@Res() res: Response,
		@Req() req: IRequest
	) {
		if (!user) throw new ForbiddenException()

		await rm(directory, { force: true, recursive: true })

		const deleteStatus = await firstValueFrom(
			this.usersService.deleteUserAccountByID(user.sub)
				.pipe(catchError(err => throwError(() => new ConflictException('Cannot delete account', err))
				))
		)

		for (const cookie in req.cookies) {
			res.clearCookie(cookie)
		}

		res.send({
			message: 'Account is succefully deleted',
			status: deleteStatus
		})

		return
	}

	@Delete('clear')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async clear(
		@Req() req: IRequest,
		@Res() res: Response
	) {
		this.usersService.clear()
			.pipe(catchError(() => throwError(() => new InternalServerErrorException())
			))

		await rm(join(cwd(), 'uploads'), { force: true, recursive: true })

		for (const cookie in req.cookies) {
			console.log('cookie => ', cookie)
			res.clearCookie(cookie)
		}

		res.send('Delete all users')
		return
	}
}
