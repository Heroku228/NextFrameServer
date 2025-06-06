import { Body, Controller, Delete, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { AppUsersService } from 'api-gateway/services/app-users.service'
import { Roles } from 'common/decorators/Roles.decorator'
import { JwtAuthGuard } from 'common/guards/JwtAuthGuard.guard'
import { RolesGuard } from 'common/guards/RolesGuard.guard'
import { firstValueFrom } from 'rxjs'

/**
 * Админский контроллер для управления административными функциями.
 * Этот контроллер защищен JWT и ролями, доступен только для администраторов.
 */

@Controller('admin')
@UseInterceptors()
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
	constructor(private readonly usersService: AppUsersService) { }

	// TEMPARILY METHOD
	async deleteAllUsers() {
		const deleteStatus = await firstValueFrom(this.usersService.deleteAllUsers())
			.catch(err => {
				throw new Error(`Ошибка при удалении всех пользователей: ${err.message}`)
			})	
		return { deleteStatus: deleteStatus }
	}d

	/**
	 * 
	 * @param username - имя пользователя, которого нужно заблокировать.
	 * @des Блокирует пользователя по его логину.
	 * Этот метод позволяет администратору заблокировать пользователя, что может быть полезно в случае нарушения правил сообщества.
	 * @param username - имя пользователя, которого нужно заблокировать.
	 * @returns 
	 */
	@Post('ban-user')
	async banUser(@Param('username') username: string) {
		const banStatus = await firstValueFrom(this.usersService.banUser(username))
			.catch(err => {
				throw new Error(`Ошибка при блокировке пользователя: ${err.message}`)
			})

		return { banStatus: banStatus }
	}

	/**
	 * @des Разблокирует пользователя по его логину.
	 * @param username - имя пользователя, которого нужно разблокировать.
	 * @returns статус разблокировки пользователя.
	 */
	@Post('unban-user')
	async unbanUser(@Param('username') username: string) {
		const banStatus = await firstValueFrom(this.usersService.unbanUser(username))
			.catch(err => {
				throw new Error(`Ошибка при разблокировки пользователя: ${err.message}`)
			})

		return { banStatus: banStatus }
	}

	/**
	 * @des Удаляет пользователя по его логину.
	 * @param username - имя пользователя, которого нужно удалить.
	 * @returns статус удаления пользователя.
	 */
	@Delete('delete-user')
	async deleteUser(@Param('username') username: string) {
		const deleteStatus = await firstValueFrom(this.usersService.deleteUser(username))
			.catch(err => {
				throw new Error(`Ошибка при удалении пользователя: ${err.message}`)
			})

		return { deleteStatus: deleteStatus }
	}

	/**
	 * @des Обновляет роль пользователя.
	 * @param username - имя пользователя, роль которого нужно обновить.
	 * @param newRole - новая роль для пользователя.
	 * @returns статус обновления роли пользователя.
	 */
	@Patch('update-user-role')
	async updateUserRole(@Body() { username, newRole }: { username: string, newRole: string }) {
		const updateStatus = await firstValueFrom(this.usersService.updateUserRole(username, newRole))
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
