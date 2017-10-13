require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const routes = require('./backend/routes');
const UntappdClient = require('node-untappd');
const { Checkin } = require('./backend/models');
const { startAll } = require('./backend/feed-proc');

mongoose.Promise = require('bluebird');

var untappd = new UntappdClient();

const CLIENT_SECRET = process.env.UNTAPPD_CLIENT_SECRET;
const CLIENT_ID = process.env.UNTAPPD_CLIENT_ID;

untappd.setClientId(CLIENT_ID);
untappd.setClientSecret(CLIENT_SECRET);

const PORT = process.env.PORT || '3001';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/beerfeed';

mongoose.connect(MONGO_URL, { useMongoClient : true })

const app = express();
app.use('/', routes(untappd));

const server = app.listen(PORT, function () {
  const { address, port } = server.address();
  console.log(`Beer feed listening at http://${address}:${port}`);
});

function removeOld(){
	const twoDays = new Date(new Date() - 1000 * 60 * 60 * 24 * 2);
	Checkin.find({ checkin_created : { $lt : twoDays } })
		.remove((err, result) => {
			if(err){
				console.log(err)
			}else{
				console.log(result)
			}
		})
}

setInterval(removeOld, 1000*60*60*24) // Filter old checkins every day.

app.use(express.static(path.join(__dirname, 'build')));

if(process.env.NODE_ENV === 'production'){
	startAll();
}
