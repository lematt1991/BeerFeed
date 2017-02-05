import sinon from 'sinon'
import {Client} from 'pg'

describe('twitter-bot', () => {
	var connectStub;
	var TwitterBot;
	var TWITTER_KEY;
	var TWITTER_SECRET;

	beforeAll(() => {
		connectStub = sinon.stub(Client.prototype, 'connect')
		TwitterBot = require('../twitter-bot').TwitterBot
		TWITTER_KEY = process.env.TWITTER_KEY
		process.env.TWITTER_KEY = 'twitter_key'
		TWITTER_SECRET = process.env.TWITTER_SECRET
		process.env.TWITTER_SECRET = 'twitter_secret'
	})

	afterAll(() => {
		connectStub.restore()
		process.env.TWITTER_SECRET = TWITTER_SECRET;
		process.env.TWITTER_KEY = TWITTER_KEY;
	})

	it('Tweets about good beers', done => {
		var bot = new TwitterBot('username', 'token', 'token_secret')

		var queryStub = sinon.stub(Client.prototype, 'query', query => new Promise((resolve, reject) => {
			resolve({
				rows : [{
					beer : 'Abraxas',
					bid : 77322,
					venue_id : 3803461,
					count : 9,
					rating : 4.44918012619019,
					date : '2017-02-04 00:07:28',
					username : 'nyc_feed',
					brewery : 'Perennial Artisan Ales',
					venue : 'As Is NYC',
					twitter : '@asisnyc'
				}]
			})
		}))

		bot.T.post = jest.fn(() => new Promise((resolve, reject) => resolve()))

		bot.check().then(() => {
			expect({
				query : queryStub.getCall(2).args[0],
				post : bot.T.post.mock.calls[0][1]
			}).toMatchSnapshot()
			done()
		})
		.catch(err => {
			console.log(err)
		})
	})
})

