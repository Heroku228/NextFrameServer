
/**
 *  Упрощает сообщение об ошибке от базы данных
 * @param {string} detail - Подробности ошибки, например: 'Key (email)=(test@example.com) already exists.'
 * @returns {string|undefined} Преобразованное сообщение, например: 'email => test@example.com already exists.'
 */
export function simplifyDuplicateKeyMessage(detail: string): string | undefined {
	if (!detail) return

	const match = detail.match(/\(([^)]+)\)=\(([^)]+)\)/)

	if (match && match.length === 3) {
		const field = match[1]
		console.log('field => ', field)
		const value = match[2]
		console.log('value => ', value)
		return `${field} => ${value} already exists.`
	}
}
