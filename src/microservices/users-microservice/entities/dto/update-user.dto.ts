export class UpdateUserData {
	username: string
	email: string
	password: string
	userId: string
	icon: TransferredFile
}


export interface TransferredFile {
	buffer: Buffer
	originalname: string
	mimetype: string
	size: number
}
