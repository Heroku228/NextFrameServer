import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Patch, UseGuards, UseInterceptors } from '@nestjs/common'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { Roles } from 'common/decorators/Roles.decorator'
import { JwtAuthGuard } from 'common/guards/JwtAuthGuard.guard'
import { RolesGuard } from 'common/guards/RolesGuard.guard'
import { ClearCookiesInterceptor } from 'common/interceptors/ClearCookies.interceptor'
import { USER_ERROR_MESSAGE } from 'constants/ErrorMessages'
import { ROLES } from 'constants/Roles'
import { firstValueFrom } from 'rxjs'
import { ICurrentUser } from 'types/current-user.type'
import { TBanUserData } from 'types/user-data.type'


/**
 * Админский контроллер для управления административными функциями.
 * Этот контроллер защищен JWT и ролями, доступен только для администраторов.
 */

@Controller('admin')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
	constructor(private readonly usersService: AppUsersService) { }

	private logger = new Logger(AdminController.name)

	// TEMPARILY METHOD
	@Delete('delete-all-users')
	@UseInterceptors(ClearCookiesInterceptor)
	async deleteAllUsers() {
		const deleteStatus = await firstValueFrom(this.usersService.deleteAllUsers())
			.catch(err => {
				throw new Error(`Ошибка при удалении всех пользователей: ${err.message}`)
			})

		return { deleteStatus: deleteStatus }
	}

	/**
	 * @param username - имя пользователя, которого нужно заблокировать.
	 * @des Блокирует пользователя по его логину.
	 * Этот метод позволяет администратору заблокировать пользователя, что может быть полезно в случае нарушения правил сообщества.
	 * @param username - имя пользователя, которого нужно заблокировать.
	 * @returns 
	 */
	@Patch('ban-user')
	async banUser(@Body() userData: TBanUserData) {
		const { username, reason, duration } = userData

		if (!username || !reason || !duration)
			throw new BadRequestException(USER_ERROR_MESSAGE.INVALID_BAN_DATA)

		const durationNumber = Number(duration)

		if (isNaN(durationNumber) || durationNumber <= 0)
			throw new BadRequestException(USER_ERROR_MESSAGE.INVALID_BAN_DURATION)

		console.log('test')
		const response = await firstValueFrom(this.usersService.banUser({
			username,
			reason,
			duration: durationNumber
		}))
			.catch(err => { throw new BadRequestException(err) })
		console.log('response => ', response)
		return { response }
	}

	/**
	 * @des Разблокирует пользователя по его логину.
	 * @param username - имя пользователя, которого нужно разблокировать.
	 * @returns статус разблокировки пользователя.
	 */
	@Patch('unban-user')
	async unbanUser(@Body() userData: { username: string }) {
		const { username } = userData
		try {
			return await firstValueFrom(this.usersService.unbanUser(username))
		} catch (err) {
			this.logger.error(`[ERROR] ${USER_ERROR_MESSAGE.UNBAN_USER_ERROR} `, err)
			throw new BadRequestException(USER_ERROR_MESSAGE.UNBAN_USER_ERROR)
		}
	}

	/**
	 * @des Удаляет пользователя по его логину.
	 * @param username - имя пользователя, которого нужно удалить.
	 * @returns статус удаления пользователя.
	 */
	@Delete('delete-user/:username')
	async deleteUser(@Param('username') username: string) {
		this.logger.log(' delete user username => ', username)
		console.log('log username => ', username)

		return await firstValueFrom(this.usersService.deleteUser(username))
			.catch(err => {
				throw new Error(`Ошибка при удалении пользователя: ${err.message}`)
			})
	}

	/**
	 * @des Обновляет роль пользователя.
	 * @param username - имя пользователя, роль которого нужно обновить.
	 * @param newRole - новая роль для пользователя.
	 * @returns статус обновления роли пользователя.
	 */
	@Patch('change-user-role')
	async changeUserRole(@Body() { username, role }: { username: string, role: string }) {
		this.logger.log({ username, role })
		const updateStatus = await firstValueFrom(this.usersService.changeUserRole(username, role))
			.catch(err => {
				throw new Error(`Ошибка при обновлении роли пользователя: ${err.message}`)
			})

		return { updateStatus: updateStatus }
	}

	/**
	 * @des Применяется к пользователя кто нарушил правила сообщества и чей статус должен быть изменен.
	 * @returns 
	 */
	@Patch('update-user-status')
	async updateUserStatus(@Body() { username, newStatus }: { username: string, newStatus: string }) {
		const updateStatus = await firstValueFrom(this.usersService.updateUserStatus(username, newStatus))
			.catch(err => {
				throw new Error(`Ошибка при обновлении статуса пользователя: ${err.message}`)
			})

		return { updateStatus: updateStatus }
	}
}
