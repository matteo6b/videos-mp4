'use strict'

const express = require('express');
const UserController = require('../controllers/user');
let api = express.Router();
let md_auth = require('../middlewares/authenticated');
let md_role = require('../middlewares/isRole');
const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir:'./uploads/users'})
//md_auth.ensureAuth
api.post('/register',UserController.saveUser);
api.post('/login',UserController.login);
api.put('/update-user/:id',md_auth.ensureAuth,UserController.updateUser);
api.post('/upload-image-user/:id',[md_auth.ensureAuth,md_upload],UserController.uploadImage);
api.get('/get-image-file/:imageFile',UserController.getImage);
api.get('/user/',md_auth.ensureAuth,UserController.profile);
api.get('/user/:id',md_auth.ensureAuth,UserController.findOne);
api.get('/users/:page?',md_auth.ensureAuth,UserController.getAll);
module.exports = api;
