import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'


type TFileRequets = {
	fieldname: string,
	originalname: string,
	encoding: string,
	mimetype: string,
	buffer: Buffer,
	size: number
}

/**
 * @des Валидирует файл 
 */
@Injectable()
export class FileRequiredPipe implements PipeTransform {
	transform(value: TFileRequets) {
		const threeMB = 3 * 1024 * 1024 // 3 MB

		if (!value) return null

		if (!value.mimetype.startsWith('image/')) {
			throw new BadRequestException('Иконка пользователя должна быть изображением')
		}

		if (value.size > threeMB) {
			throw new BadRequestException('Размер иконки пользователя не должен превышать 3МБ')
		}

		return value
	}
}
