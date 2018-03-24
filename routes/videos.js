'use strict'

const express = require('express');
const VideoController = require('../controllers/videos');

let api = express.Router();
let md_auth = require('../middlewares/authenticated');
let md_role = require('../middlewares/isRole');
const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir:'./uploads/videos'})
//md_auth.ensureAuth

api.post('/video/add',[md_auth.ensureAuth,md_upload],VideoController.addVideo);
api.get('/:videoFile',VideoController.playVideo);
api.get('/video/all',md_auth.ensureAuth,VideoController.all);
api.get('/timeline/:page',md_auth.ensureAuth,VideoController.timeline);
api.get('/video/favorites',md_auth.ensureAuth,VideoController.allFavorites);
api.get('/video/:id',md_auth.ensureAuth,VideoController.findOne);
api.post('/:video/favorite',md_auth.ensureAuth,VideoController.favoriteVideo);
api.delete('/:video/unfavorite',md_auth.ensureAuth,VideoController.unfavoriteVideo);
module.exports = api;
