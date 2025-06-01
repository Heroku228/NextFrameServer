
export const API_STATUS = {
	SUCCESS: 'success',
	ERROR: 'error'
} as const

export type API_STATUS = typeof API_STATUS[keyof typeof API_STATUS]

export interface ApiResponse<T> {
	status: API_STATUS,
	statusCode: number,
	data: T
}
