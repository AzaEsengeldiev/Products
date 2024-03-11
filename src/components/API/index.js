import md5 from 'md5'

const password = 'Valantis'
const apiUrl = 'http://api.valantis.store:40000/products'

function generateAuthHeader() {
	const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '') 
	const authString = `${password}_${timestamp}`
	return {
		'X-Auth': md5(authString) // Предполагается, что у вас есть библиотека для вычисления MD5, либо вы можете использовать другой метод хеширования
	}
}
