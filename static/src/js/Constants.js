if(process.env.NODE_ENV === 'debug' ){
	console.log('DEBUG!!!!!!!')
} 

export const BACKEND_URL = process.env.NODE_ENV === 'debug' ? 
	'http://localhost:8082' : 
	'https://beerfeed-ml9951.rhcloud.com'


