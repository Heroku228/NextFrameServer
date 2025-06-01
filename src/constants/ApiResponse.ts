
export const API_STATUS = {
	SUCCESS: 'успех',
	ERROR: 'ошибка'
} as const

export type API_STATUS = typeof API_STATUS[keyof typeof API_STATUS]

export interface ApiResponse<T> {
	status: API_STATUS,
	statusCode: number,
	data: T
}
