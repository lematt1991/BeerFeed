require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const routes = require('./backend/routes');
const UntappdClient = require('node-untappd');

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

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});