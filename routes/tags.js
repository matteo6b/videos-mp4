'use strict';

const express = require('express');
const tagController = require('../controllers/tags');
let md_auth = require('../middlewares/authenticated');
let api = express.Router();

api.get('/tag/all', tagController.getAll);

module.exports = api;
