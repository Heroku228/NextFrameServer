export const USER_ERROR_MESSAGE = {
	USER_NOT_FOUND: 'Пользователь не найден',
	USER_ALREADY_EXISTS: 'Пользователь с таким логином или Email уже существует',
	USER_BANNED: 'Пользователь заблокирован',
	USER_NOT_BANNED: 'Пользователь не заблокирован',
	USER_NOT_AUTHORIZED: 'Пользователь не авторизован',
	USER_NOT_SELLER: 'Пользователь не является продавцом',
	USER_NOT_ADMIN: 'Пользователь не является администратором',
	USER_NOT_AUTHORIZED_OR_BANNED: 'Пользователь не авторизован или заблокирован',
	USER_NOT_AUTHORIZED_OR_NOT_SELLER: 'Пользователь не авторизован или не является продавцом',
	UNCORRECT_DATA_TO_UPDATE: 'Некорректные данные для обновления пользователя',
	RENAME_DIRECTORY_ERROR: 'Ошибка при переименовании директории пользователя',
	NO_UPDATE_DATA: 'Нет данных для обновления пользователя',
	USER_ALREADY_BANNED: 'Пользователь уже заблокирован',
	USER_ALREADY_AUTHORIZED: 'Пользователь уже авторизован',
	USER_NOT_FOUND_OR_ALREADY_BANNED: 'Пользователь не найден - либо уже был заблокирован',
	USER_NOT_FOUND_OR_ALREADY_UNBANNED: 'Пользователь не найден - либо не является заблокированным',
	CANNOT_CHANGE_USER_ROLE: 'Не удалось изменеить роль пользователя',
	CANNOT_CHANGE_USER_PASSWORD: 'Не удалось изменить пароль пользователя',
	CANNOT_CHANGE_USER_DATA: 'Не удалось изменить данные пользователя',
	NO_USER_DATA: 'Данные пользователя отсутствуют',
	INVALID_BAN_DATA: 'Не получены все необходимые данные для блокировки пользователя',
	INVALID_BAN_DURATION: 'Неправильно установлено время блокировки пользователя',
	UNBAN_USER_ERROR: 'Ошибка при попытке разблокировать пользователя'

} as const

export const USER_SUCCESS_MESSAGE = {
	USER_CREATED: 'Пользователь успешно создан',
	USER_UPDATED: 'Пользователь успешно обновлен',
	USER_DELETED: 'Пользователь успешно удален',
	USER_BANNED: 'Пользователь успешно заблокирован',
	USER_UNBANNED: 'Пользователь успешно разблокирован',
	PASSWORD_UPDATED: 'Пароль успешно обновлен',
	USER_ICON_UPDATED: 'Аватар пользователя успешно обновлен',
	USER_ICON_DELETED: 'Аватар пользователя успешно удален',
	USER_ICON_NOT_FOUND: 'Аватар пользователя не найден',
	USER_ICON_DELETED_SUCCESS: 'Аватар пользователя успешно удален',
} as const

export const ROLE_ERROR_MESSAGE = {
	ROLE_NOT_FOUND: 'Роль не найдена',
	ROLE_ALREADY_EXISTS: 'Роль с таким названием уже существует',
	ROLE_NOT_AUTHORIZED: 'Роль не авторизована',
	ROLE_NOT_ADMIN: 'Роль не является администратором',
} as const
export const ROLE_SUCCESS_MESSAGE = {
	ROLE_CREATED: 'Роль успешно создана',
	ROLE_UPDATED: 'Роль успешно обновлена',
	ROLE_DELETED: 'Роль успешно удалена',
	ALLOWED_ROLES: 'Разрешенные роли',
} as const

export const AUTH_ERROR_MESSAGE = {
	ACCOUNT_NOT_ACTIVATED: 'Аккаунт не активирован',
	CANNOT_DELETE_ADMIN: 'Невозможно удалить администратора',
	ACCOUNT_NOT_FOUND: 'Аккаунт не найден',
	ACCOUNT_ALREADY_EXISTS: 'Аккаунт с таким логином или Email уже существует',
	ACCOUNT_NOT_AUTHORIZED: 'Аккаунт не авторизован',
	ACCOUNT_NOT_AUTHORIZED_OR_BANNED: 'Аккаунт не авторизован или заблокирован',
	ACCOUNT_NOT_AUTHORIZED_OR_NOT_SELLER: 'Аккаунт не авторизован или не является продавцом',
	ACCOUNT_NOT_AUTHORIZED_OR_ADMIN: 'Аккаунт не авторизован или не является администратором',
} as const

export const SELLER_ERROR_MESSAGE = {
	NEED_SELLER_STATUS: 'Необходимо иметь статус продавца для доступа к этому ресурсу'
} as const

export const PRODUCT_ERROR_MESSAGE = {
	PRODUCT_NOT_FOUND: 'Товар не найден',
	PRODUCT_ALREADY_EXISTS: 'Товар с таким названием уже существует',
	PRODUCT_NOT_AVAILABLE: 'Товар недоступен',
	PRODUCT_NOT_IN_STOCK: 'Товар отсутствует на складе',
} as const

