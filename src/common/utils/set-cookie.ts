import { Response } from 'express'


export const setProtectedCookie = (res: Response, name: string, val: any) => (
	res.cookie(name, val, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 24 * 60 * 60 * 1000
	})
)

export const setDefaultCookie = (res: Response, name: string, val: any) => {
	res.cookie(name, val, {
		httpOnly: false,
		secure: false,
		sameSite: 'lax',
		maxAge: 24 * 60 * 60 * 1000
	})
}
