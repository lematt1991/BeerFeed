import sinon from 'sinon'
import {Client} from 'pg'

describe('twitter-bot', () => {
	var connectStub;
	var TwitterBot;
	var TWITTER_KEY;
	var TWITTER_SECRET;
	var toISOStub;

	beforeAll(() => {
		connectStub = sinon.stub(Client.prototype, 'connect')
		TwitterBot = require('../backend/twitter-bot').TwitterBot
		TWITTER_KEY = process.env.TWITTER_KEY
		process.env.TWITTER_KEY = 'twitter_key'
		TWITTER_SECRET = process.env.TWITTER_SECRET
		process.env.TWITTER_SECRET = 'twitter_secret'
		toISOStub = sinon.stub(Date.prototype, 'toISOString').callsFake(() => 'fake-time');
	})

	afterAll(() => {
		connectStub.restore()
		process.env.TWITTER_SECRET = TWITTER_SECRET;
		process.env.TWITTER_KEY = TWITTER_KEY;
		toISOStub.restore()
	})

	it('Tweets about good beers', done => {
		var bot = new TwitterBot('username', 'token', 'token_secret')

		var queryStub = sinon.stub(Client.prototype, 'query').callsFake(query => new Promise((resolve, reject) => {
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
			queryStub.restore()
			done()
		})
		.catch(err => {
			console.log(err)
		})
	})

	it('Is 140 character aware', done => {
		var bot = new TwitterBot('username', 'token', 'token_secret')

		var queryStub = sinon.stub(Client.prototype, 'query').callsFake(query => new Promise((resolve, reject) => {
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
				}, 
				{
					beer : 'Abraxassssss',
					bid : 77322,
					venue_id : 3803461,
					count : 9,
					rating : 4.44918012619019,
					date : '2017-02-04 00:07:28',
					username : 'nyc_feed',
					brewery : 'Perennial Artisan Ales',
					venue : 'As Is NYC',
					twitter : '@asisnyc'
				},
				{
					beer : 'Abraxasssssssssssssssssssssssssssssssssssssssssssssssssssss',
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
			expect(bot.T.post.mock.calls[1][1].status.match(/#beer/)).toBeNull()
			expect(bot.T.post.mock.calls[2][1].status.match('@asisnyc')).toBeNull()
			queryStub.restore()
			done()
		})
		.catch(err => {
			console.log(err)
		})
	})
})

