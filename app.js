'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const favicon = require('serve-favicon');
const path = require('path');
let app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));

//midedlewares

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(cors());
//routes
const userRoutes = require('./routes/user');
const videoRoutes = require('./routes/videos');
const followRoutes = require('./routes/follow');
const tagRoutes = require('./routes/tags');
app.use('/', express.static('client', { redirect: false }));
app.use('/api', userRoutes);
app.use('/api', videoRoutes);
app.use('/api', followRoutes);
app.use('/api', tagRoutes);
app.get('*', (req, res) => {
  res.sendFile(path.resolve('client/index.html'));
});
module.exports = app;
