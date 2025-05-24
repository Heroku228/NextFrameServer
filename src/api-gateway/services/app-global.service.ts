

export function simplifyDuplicateKeyMessage(detail: string) {
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
